import { useEffect } from 'react';
import { Layout, Card, Form, Input, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile, updateProfile } from '../../store/slices/authSlice';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const { Content } = Layout;

const Profile = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
    }
  }, [user, form]);

  const onFinish = (values) => {
    dispatch(updateProfile(values));
  };

  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content className="bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold mb-6">My Profile</h1>
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              size="large"
            >
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter your name' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              >
                <Input disabled />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true, message: 'Please enter your phone' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Update Profile
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default Profile;
