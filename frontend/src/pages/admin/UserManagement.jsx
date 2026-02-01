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
  Select,
  Switch,
  message,
  Row,
  Col,
  Statistic,
  Popconfirm,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  ReloadOutlined,
  SearchOutlined,
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons';
import api from '../../api/axios';
import dayjs from 'dayjs';

const { Option } = Select;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    role: undefined,
    is_active: undefined,
    search: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    admin: 0,
    sales_staff: 0,
    customer: 0,
    active: 0,
    inactive: 0
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      };
      
      const response = await api.get('/auth/users', { params });
      const data = response.data?.data || {};
      
      setUsers(data.users || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0
      }));

      // Calculate stats
      const allUsers = data.users || [];
      setStats({
        total: data.pagination?.total || 0,
        admin: allUsers.filter(u => u.role === 'admin').length,
        sales_staff: allUsers.filter(u => u.role === 'sales_staff').length,
        customer: allUsers.filter(u => u.role === 'customer').length,
        active: allUsers.filter(u => u.is_active).length,
        inactive: allUsers.filter(u => !u.is_active).length
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      is_active: user.is_active
    });
    setModalVisible(true);
  };

  const handleDelete = async (userId) => {
    try {
      await api.delete(`/auth/users/${userId}`);
      message.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/auth/users/${userId}/toggle-status`);
      message.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error) {
      message.error('Failed to update user status');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        await api.put(`/auth/users/${editingUser.id}`, values);
        message.success('User updated successfully');
      } else {
        // For new users, password is required
        if (!values.password) {
          message.error('Password is required for new users');
          return;
        }
        await api.post('/auth/users', values);
        message.success('User created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.message || `Failed to ${editingUser ? 'update' : 'create'} user`);
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: '#dc2626',
      sales_staff: '#2563eb',
      customer: '#059669'
    };
    const labels = {
      admin: 'Admin',
      sales_staff: 'Sales Staff',
      customer: 'Customer'
    };
    return <Tag color={colors[role]}>{labels[role]}</Tag>;
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <UserOutlined />
          <span style={{ fontWeight: '500' }}>{text}</span>
          {!record.is_active && <Badge status="default" text="Inactive" />}
        </Space>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => getRoleBadge(role)
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('MMM D, YYYY')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title={`${record.is_active ? 'Deactivate' : 'Activate'} this user?`}
            onConfirm={() => handleToggleStatus(record.id, record.is_active)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              icon={record.is_active ? <LockOutlined /> : <UnlockOutlined />}
              style={{ color: record.is_active ? '#faad14' : '#52c41a' }}
            >
              {record.is_active ? 'Deactivate' : 'Activate'}
            </Button>
          </Popconfirm>
          {record.role !== 'admin' && (
            <Popconfirm
              title="Are you sure you want to delete this user?"
              description="This action cannot be undone."
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        {/* Statistics Cards */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Users"
                value={stats.total}
                valueStyle={{ color: '#1890ff' }}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Admins"
                value={stats.admin}
                valueStyle={{ color: '#dc2626' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Sales Staff"
                value={stats.sales_staff}
                valueStyle={{ color: '#2563eb' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Customers"
                value={stats.customer}
                valueStyle={{ color: '#059669' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters and Actions */}
        <Card className="mb-4">
          <Row gutter={16} align="middle">
            <Col xs={24} md={8}>
              <Input
                placeholder="Search by name, email, or phone"
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                allowClear
              />
            </Col>
            <Col xs={24} md={4}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by Role"
                value={filters.role}
                onChange={(value) => setFilters({ ...filters, role: value })}
                allowClear
              >
                <Option value="admin">Admin</Option>
                <Option value="sales_staff">Sales Staff</Option>
                <Option value="customer">Customer</Option>
              </Select>
            </Col>
            <Col xs={24} md={4}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by Status"
                value={filters.is_active}
                onChange={(value) => setFilters({ ...filters, is_active: value })}
                allowClear
              >
                <Option value="1">Active</Option>
                <Option value="0">Inactive</Option>
              </Select>
            </Col>
            <Col xs={24} md={8} className="text-right">
              <Space>
                <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
                  Refresh
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                  style={{ backgroundColor: '#dc2626' }}
                >
                  Add User
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Users Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: (page) => setPagination({ ...pagination, current: page }),
              showSizeChanger: false,
              showTotal: (total) => `Total ${total} users`
            }}
          />
        </Card>
      </div>

      {/* Add/Edit User Modal */}
      <Modal
        title={editingUser ? 'Edit User' : 'Add New User'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={700}
        okText={editingUser ? 'Update' : 'Create'}
        okButtonProps={{ style: { backgroundColor: '#dc2626', borderColor: '#dc2626' } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ is_active: true }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter name' }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter valid email' }
                ]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>
            </Col>
          </Row>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: 'Please select role' }]}
              >
                <Select placeholder="Select role">
                  <Option value="admin">Admin</Option>
                  <Option value="sales_staff">Sales Staff</Option>
                  <Option value="customer">Customer</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone"
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Address"
          >
            <Input.TextArea rows={2} placeholder="Enter address" />
          </Form.Item>

          {editingUser && (
            <Form.Item
              name="is_active"
              label="Account Status"
              valuePropName="checked"
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default UserManagement;
