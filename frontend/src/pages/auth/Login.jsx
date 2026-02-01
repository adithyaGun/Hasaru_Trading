import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../store/slices/authSlice';
import { Button, Input, Form, Typography, Checkbox } from 'antd';
import { User, Lock, ShieldCheck, Zap, TrendingUp, Users } from 'lucide-react';

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Navigate based on role after successful login
    if (user) {
      // Map role to correct path
      const roleToPath = {
        'admin': '/admin',
        'sales_staff': '/sales',
        'customer': '/customer'
      };
      const path = roleToPath[user.role] || `/${user.role}`;
      navigate(path, { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onFinish = async (values) => {
    await dispatch(login(values));
  };

  const fillDemoCredentials = (email, password) => {
    form.setFieldsValue({ email, password });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8 animate-fadeIn">
          {/* Logo & Title */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl mb-6 shadow-lg shadow-red-600/30">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <Title level={1} className="!mb-2 !text-4xl !font-bold">Welcome Back</Title>
            <Text className="text-gray-500 text-lg">Sign in to continue to your account</Text>
          </div>

          {/* Form */}
          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            className="space-y-2"
          >
            <Form.Item
              name="email"
              label={<span className="font-semibold text-gray-700">Email Address</span>}
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' },
              ]}
            >
              <Input 
                prefix={<User className="w-4 h-4 text-gray-400" />} 
                placeholder="Enter your email"
                className="!h-12 !rounded-xl"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="font-semibold text-gray-700">Password</span>}
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                prefix={<Lock className="w-4 h-4 text-gray-400" />}
                placeholder="Enter your password"
                className="!h-12 !rounded-xl"
              />
            </Form.Item>

            <div className="flex items-center justify-between py-2">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>
              <Link to="/forgot-password" className="text-red-600 hover:text-red-700 font-medium">
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded-lg">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Demo Credentials */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm font-semibold text-blue-900 mb-3">🚀 Demo Credentials (Click to Auto-Fill)</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('admin@hasarutrading.com', 'password123')}
                  className="w-full text-left p-2 bg-white hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Admin User</p>
                      <p className="text-xs text-gray-500">admin@hasarutrading.com / password123</p>
                    </div>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">ADMIN</span>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('sales1@hasarutrading.com', 'password123')}
                  className="w-full text-left p-2 bg-white hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Sales Staff 1</p>
                      <p className="text-xs text-gray-500">sales1@hasarutrading.com / password123</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">STAFF</span>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('customer1@email.com', 'password123')}
                  className="w-full text-left p-2 bg-white hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">John Customer</p>
                      <p className="text-xs text-gray-500">customer1@email.com / password123</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">CUSTOMER</span>
                  </div>
                </button>
              </div>
            </div>

            <Form.Item className="!mb-6">
              <Button
                type="primary"
                htmlType="submit"
                className="w-full !h-12 !text-base !font-semibold !rounded-xl !bg-gradient-to-r !from-red-600 !to-red-700 hover:!from-red-700 hover:!to-red-800 !border-0 shadow-lg shadow-red-600/30"
                loading={loading}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">New to Hasaru Trading?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <Text className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-red-600 hover:text-red-700 font-semibold">
                Create Account
              </Link>
            </Text>
          </div>

          {/* Back to Home */}
          <div className="text-center pt-4">
            <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-black via-red-950 to-red-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGg3djFoLTd2LTF6bS0yLTFoMXYyaC0xdi0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-red-600/20 backdrop-blur-sm border border-red-500/30 rounded-full px-4 py-2 w-fit">
              <Zap className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium">Trusted by 10,000+ customers</span>
            </div>

            <h1 className="text-5xl font-bold leading-tight">
              Your Gateway to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
                Quality Auto Parts
              </span>
            </h1>

            <p className="text-xl text-gray-300 leading-relaxed max-w-md">
              Access premium tires, batteries, and automotive parts. Manage your orders, track deliveries, and enjoy exclusive deals.
            </p>

            {/* Features */}
            <div className="space-y-6 pt-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                  <ShieldCheck className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Secure & Reliable</h3>
                  <p className="text-gray-400">Your data is protected with industry-standard encryption</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                  <TrendingUp className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Best Deals</h3>
                  <p className="text-gray-400">Get access to exclusive promotions and discounts</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                  <Users className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Expert Support</h3>
                  <p className="text-gray-400">24/7 customer support to help with your needs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
