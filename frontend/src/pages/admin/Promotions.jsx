import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  InputNumber,
  DatePicker,
  Select,
  message,
  Row,
  Col,
  Statistic,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PercentageOutlined,
  TagOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { promotionsAPI } from '../../api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const AdminPromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    upcoming: 0
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await promotionsAPI.getAll();
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setPromotions(data);
      
      // Calculate stats
      const now = dayjs();
      const stats = data.reduce((acc, promo) => {
        acc.total++;
        const start = dayjs(promo.start_date);
        const end = dayjs(promo.end_date);
        
        if (now.isAfter(end)) acc.expired++;
        else if (now.isBefore(start)) acc.upcoming++;
        else if (promo.status === 'active') acc.active++;
        
        return acc;
      }, { total: 0, active: 0, expired: 0, upcoming: 0 });
      
      setStats(stats);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      message.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPromotion(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingPromotion(record);
    form.setFieldsValue({
      ...record,
      date_range: [dayjs(record.start_date), dayjs(record.end_date)]
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await promotionsAPI.delete(id);
      message.success('Promotion deleted successfully');
      fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      message.error('Failed to delete promotion');
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        name: values.name,
        description: values.description,
        discount_type: values.discount_type,
        discount_value: values.discount_value,
        start_date: values.date_range[0].format('YYYY-MM-DD'),
        end_date: values.date_range[1].format('YYYY-MM-DD'),
        status: values.status || 'active'
      };

      if (editingPromotion) {
        await promotionsAPI.update(editingPromotion.id, payload);
        message.success('Promotion updated successfully');
      } else {
        await promotionsAPI.create(payload);
        message.success('Promotion created successfully');
      }

      setModalVisible(false);
      form.resetFields();
      fetchPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
      message.error(error.response?.data?.message || 'Failed to save promotion');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span style={{ fontWeight: '500' }}>{text}</span>,
      width: '20%'
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: '25%'
    },
    {
      title: 'Discount',
      key: 'discount',
      render: (_, record) => (
        <Tag color="red">
          {record.discount_type === 'percentage' 
            ? `${record.discount_value}%` 
            : `Rs. ${record.discount_value}`}
        </Tag>
      ),
      width: '12%'
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date) => dayjs(date).format('MMM D, YYYY'),
      width: '12%'
    },
    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (date) => dayjs(date).format('MMM D, YYYY'),
      width: '12%'
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const now = dayjs();
        const start = dayjs(record.start_date);
        const end = dayjs(record.end_date);
        
        if (now.isAfter(end)) {
          return <Tag color="gray">EXPIRED</Tag>;
        } else if (now.isBefore(start)) {
          return <Tag color="blue">UPCOMING</Tag>;
        } else if (record.status === 'active') {
          return <Tag color="green">ACTIVE</Tag>;
        } else {
          return <Tag color="orange">INACTIVE</Tag>;
        }
      },
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' }
      ],
      onFilter: (value, record) => record.status === value,
      width: '10%'
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Promotion"
            description="Are you sure you want to delete this promotion?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
      width: '15%'
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        {/* Header */}
        <Row justify="space-between" align="middle" className="mb-6">
          <Col>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              <TagOutlined style={{ marginRight: '8px', color: '#dc2626' }} />
              Promotions Management
            </h2>
            <p style={{ margin: '4px 0 0', color: '#666' }}>
              Create and manage promotional offers
            </p>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchPromotions} loading={loading}>
                Refresh
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleCreate}
                style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
              >
                Create Promotion
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Statistics */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: '12px' }}>
              <Statistic
                title="Total Promotions"
                value={stats.total}
                prefix={<TagOutlined />}
                valueStyle={{ color: '#2563eb' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: '12px' }}>
              <Statistic
                title="Active"
                value={stats.active}
                prefix={<PercentageOutlined />}
                valueStyle={{ color: '#16a34a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: '12px' }}>
              <Statistic
                title="Upcoming"
                value={stats.upcoming}
                valueStyle={{ color: '#2563eb' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: '12px' }}>
              <Statistic
                title="Expired"
                value={stats.expired}
                valueStyle={{ color: '#6b7280' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Promotions Table */}
        <Card style={{ borderRadius: '16px' }}>
          <Table
            columns={columns}
            dataSource={promotions}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} promotions` }}
          />
        </Card>

        {/* Create/Edit Modal */}
        <Modal
          title={editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="Promotion Name"
              rules={[{ required: true, message: 'Please enter promotion name' }]}
            >
              <Input placeholder="e.g., Winter Sale 2026" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <TextArea rows={3} placeholder="Describe the promotion..." />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="discount_type"
                  label="Discount Type"
                  rules={[{ required: true, message: 'Please select discount type' }]}
                >
                  <Select placeholder="Select type">
                    <Select.Option value="percentage">Percentage (%)</Select.Option>
                    <Select.Option value="fixed">Fixed Amount (Rs.)</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="discount_value"
                  label="Discount Value"
                  rules={[
                    { required: true, message: 'Please enter discount value' },
                    { type: 'number', min: 0, message: 'Must be positive' }
                  ]}
                >
                  <InputNumber 
                    style={{ width: '100%' }}
                    placeholder="0"
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="date_range"
              label="Promotion Period"
              rules={[{ required: true, message: 'Please select start and end date' }]}
            >
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              initialValue="active"
            >
              <Select>
                <Select.Option value="active">Active</Select.Option>
                <Select.Option value="inactive">Inactive</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
                >
                  {editingPromotion ? 'Update' : 'Create'} Promotion
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminPromotions;

