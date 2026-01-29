import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Space, 
  Row, 
  Col, 
  Statistic,
  Descriptions,
  Tag,
  message,
  Modal
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  SaveOutlined,
  TeamOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { authAPI } from '../../api';
import dayjs from 'dayjs';

const AdminUsers = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await authAPI.getProfile();
      const userData = response.data.data || response.data;
      setProfile(userData);
      form.setFieldsValue({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      message.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (values) => {
    setLoading(true);
    try {
      await authAPI.updateProfile(values);
      message.success('Profile updated successfully');
      setEditMode(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      message.success('Password changed successfully');
      passwordForm.resetFields();
    } catch (error) {
      console.error('Error changing password:', error);
      message.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        {/* Header */}
        <Row justify="space-between" align="middle" className="mb-6">
          <Col>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              <UserOutlined style={{ marginRight: '8px', color: '#dc2626' }} />
              User Management
            </h2>
            <p style={{ margin: '4px 0 0', color: '#666' }}>
              Manage your account settings and preferences
            </p>
          </Col>
        </Row>

        {/* Stats */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: '12px' }}>
              <Statistic
                title="Account Status"
                value="Active"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#16a34a', fontSize: '20px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: '12px' }}>
              <Statistic
                title="Role"
                value={profile?.role?.toUpperCase() || 'N/A'}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#2563eb', fontSize: '20px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: '12px' }}>
              <Statistic
                title="Member Since"
                value={profile?.created_at ? dayjs(profile.created_at).format('MMM YYYY') : 'N/A'}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#ea580c', fontSize: '20px' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Profile Information */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} lg={12}>
            <Card 
              title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Profile Information</span>}
              style={{ borderRadius: '16px' }}
              extra={
                !editMode && (
                  <Button type="primary" onClick={() => setEditMode(true)}>
                    Edit Profile
                  </Button>
                )
              }
            >
              {!editMode ? (
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="Name">
                    <span style={{ fontWeight: '500' }}>{profile?.name || 'N/A'}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    <span style={{ fontWeight: '500' }}>{profile?.email || 'N/A'}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone">
                    <span style={{ fontWeight: '500' }}>{profile?.phone || 'Not Set'}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Role">
                    <Tag color="blue">{profile?.role?.toUpperCase() || 'N/A'}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Member Since">
                    {profile?.created_at ? dayjs(profile.created_at).format('MMMM D, YYYY') : 'N/A'}
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleUpdateProfile}
                >
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="John Doe" />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Please enter your email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="john@example.com" />
                  </Form.Item>
                  <Form.Item
                    name="phone"
                    label="Phone Number"
                  >
                    <Input prefix={<PhoneOutlined />} placeholder="+94 77 123 4567" />
                  </Form.Item>
                  <Form.Item>
                    <Space>
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading}
                        icon={<SaveOutlined />}
                        style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
                      >
                        Save Changes
                      </Button>
                      <Button onClick={() => {
                        setEditMode(false);
                        form.resetFields();
                      }}>
                        Cancel
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              )}
            </Card>
          </Col>

          {/* Change Password */}
          <Col xs={24} lg={12}>
            <Card 
              title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Security Settings</span>}
              style={{ borderRadius: '16px' }}
            >
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handleChangePassword}
              >
                <Form.Item
                  name="currentPassword"
                  label="Current Password"
                  rules={[{ required: true, message: 'Please enter your current password' }]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Enter current password" />
                </Form.Item>
                <Form.Item
                  name="newPassword"
                  label="New Password"
                  rules={[
                    { required: true, message: 'Please enter a new password' },
                    { min: 6, message: 'Password must be at least 6 characters' }
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Enter new password" />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  label="Confirm New Password"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: 'Please confirm your password' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Passwords do not match'));
                      },
                    }),
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Confirm new password" />
                </Form.Item>
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
                  >
                    Change Password
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>

        {/* Account Information */}
        <Card 
          title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Account Details</span>}
          style={{ borderRadius: '16px' }}
        >
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="User ID">
              <code>{profile?.id || 'N/A'}</code>
            </Descriptions.Item>
            <Descriptions.Item label="Account Type">
              <Tag color="purple">ADMIN</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color="green">ACTIVE</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Last Login">
              {profile?.last_login ? dayjs(profile.last_login).format('MMMM D, YYYY HH:mm') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {profile?.created_at ? dayjs(profile.created_at).format('MMMM D, YYYY HH:mm') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              {profile?.updated_at ? dayjs(profile.updated_at).format('MMMM D, YYYY HH:mm') : 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;

