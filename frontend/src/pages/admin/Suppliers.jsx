import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Space, 
  Tag, 
  Popconfirm, 
  message,
  Row,
  Col,
  Card,
  Statistic,
  Descriptions
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import api from '../../api/axios';

const { Option } = Select;
const { TextArea } = Input;

const AdminSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [viewingSupplier, setViewingSupplier] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data);
      calculateStats(response.data);
      message.success('Suppliers loaded successfully');
    } catch (error) {
      message.error('Failed to load suppliers');
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (suppliersData) => {
    const total = suppliersData.length;
    const active = suppliersData.filter(s => s.status === 'active').length;
    const inactive = suppliersData.filter(s => s.status === 'inactive').length;
    setStats({ total, active, inactive });
  };

  const handleAdd = () => {
    setEditingSupplier(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingSupplier(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleView = (record) => {
    setViewingSupplier(record);
    setDetailsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/suppliers/${id}`);
      message.success('Supplier deleted successfully');
      fetchSuppliers();
    } catch (error) {
      message.error('Failed to delete supplier');
      console.error('Error deleting supplier:', error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier.id}`, values);
        message.success('Supplier updated successfully');
      } else {
        await api.post('/suppliers', values);
        message.success('Supplier created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      fetchSuppliers();
    } catch (error) {
      message.error(editingSupplier ? 'Failed to update supplier' : 'Failed to create supplier');
      console.error('Error saving supplier:', error);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         supplier.email?.toLowerCase().includes(searchText.toLowerCase()) ||
                         supplier.phone?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = filterStatus === 'all' || supplier.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Contact Person',
      dataIndex: 'contact_person',
      key: 'contact_person',
      width: 150,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 180,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleView(record)}
          >
            View
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this supplier?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Suppliers Management</h1>
        
        {/* Statistics Cards */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={8}>
            <Card>
              <Statistic 
                title="Total Suppliers" 
                value={stats.total}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic 
                title="Active Suppliers" 
                value={stats.active}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic 
                title="Inactive Suppliers" 
                value={stats.inactive}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters and Actions */}
        <Card className="mb-4">
          <Row gutter={16} align="middle">
            <Col xs={24} md={10}>
              <Input
                placeholder="Search by name, email or phone"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by Status"
                value={filterStatus}
                onChange={setFilterStatus}
              >
                <Option value="all">All Status</Option>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Col>
            <Col xs={24} md={8} className="text-right">
              <Space>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={fetchSuppliers}
                >
                  Refresh
                </Button>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                  style={{ backgroundColor: '#dc2626' }}
                >
                  Add Supplier
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Suppliers Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={filteredSuppliers}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} suppliers`,
            }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </div>

      {/* Add/Edit Supplier Modal */}
      <Modal
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={700}
        okText={editingSupplier ? 'Update' : 'Create'}
        okButtonProps={{ style: { backgroundColor: '#dc2626', borderColor: '#dc2626' } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Company Name"
                rules={[{ required: true, message: 'Please enter company name' }]}
              >
                <Input placeholder="Enter company name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="contact_person"
                label="Contact Person"
                rules={[{ required: true, message: 'Please enter contact person' }]}
              >
                <Input placeholder="Enter contact person name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Address"
          >
            <TextArea rows={2} placeholder="Enter full address" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="city"
                label="City"
              >
                <Input placeholder="Enter city" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="state"
                label="State"
              >
                <Input placeholder="Enter state" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="zip_code"
                label="ZIP Code"
              >
                <Input placeholder="Enter ZIP code" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="payment_terms"
            label="Payment Terms"
          >
            <Select placeholder="Select payment terms">
              <Option value="Net 30">Net 30</Option>
              <Option value="Net 60">Net 60</Option>
              <Option value="Net 90">Net 90</Option>
              <Option value="COD">Cash on Delivery</Option>
              <Option value="Advance">Advance Payment</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea rows={3} placeholder="Enter any additional notes" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
            initialValue="active"
          >
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Supplier Details Modal */}
      <Modal
        title="Supplier Details"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>,
          <Button 
            key="edit" 
            type="primary" 
            onClick={() => {
              setDetailsModalVisible(false);
              handleEdit(viewingSupplier);
            }}
            style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
          >
            Edit
          </Button>,
        ]}
        width={700}
      >
        {viewingSupplier && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Company Name" span={2}>
              {viewingSupplier.name}
            </Descriptions.Item>
            <Descriptions.Item label="Contact Person">
              {viewingSupplier.contact_person}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={viewingSupplier.status === 'active' ? 'green' : 'red'}>
                {viewingSupplier.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {viewingSupplier.email}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {viewingSupplier.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Address" span={2}>
              {viewingSupplier.address || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="City">
              {viewingSupplier.city || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="State">
              {viewingSupplier.state || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="ZIP Code">
              {viewingSupplier.zip_code || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Payment Terms">
              {viewingSupplier.payment_terms || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Notes" span={2}>
              {viewingSupplier.notes || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Created At" span={2}>
              {new Date(viewingSupplier.created_at).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default AdminSuppliers;
