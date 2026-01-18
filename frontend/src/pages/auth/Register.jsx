import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../../store/slices/authSlice';
import { Button, Input, Form, Typography } from 'antd';
import { User, Mail, Lock, Phone, Rocket, Star, Award, CheckCircle } from 'lucide-react';

const { Title, Text } = Typography;

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onFinish = async (values) => {
    const result = await dispatch(register(values));
    if (result.type === 'auth/register/fulfilled') {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-black via-red-950 to-red-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGg3djFoLTd2LTF6bS0yLTFoMXYyaC0xdi0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-red-600/20 backdrop-blur-sm border border-red-500/30 rounded-full px-4 py-2 w-fit">
              <Rocket className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium">Join thousands of satisfied customers</span>
            </div>

            <h1 className="text-5xl font-bold leading-tight">
              Start Your Journey
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
                With Us Today
              </span>
            </h1>

            <p className="text-xl text-gray-300 leading-relaxed max-w-md">
              Create your account and unlock access to premium auto parts, exclusive deals, and expert support.
            </p>

            {/* Benefits */}
            <div className="space-y-6 pt-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                  <CheckCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Instant Access</h3>
                  <p className="text-gray-400">Start shopping immediately after registration</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                  <Star className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Exclusive Deals</h3>
                  <p className="text-gray-400">Members-only discounts and promotions</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                  <Award className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Quality Guaranteed</h3>
                  <p className="text-gray-400">All products backed by warranty</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              <div>
                <div className="text-3xl font-bold text-red-400">10k+</div>
                <div className="text-sm text-gray-400">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-400">5000+</div>
                <div className="text-sm text-gray-400">Products</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-400">99%</div>
                <div className="text-sm text-gray-400">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8 animate-fadeIn">
          {/* Logo & Title */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl mb-6 shadow-lg shadow-red-600/30">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <Title level={1} className="!mb-2 !text-4xl !font-bold">Create Account</Title>
            <Text className="text-gray-500 text-lg">Join Hasaru Trading today</Text>
          </div>

          {/* Form */}
          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            className="space-y-2"
          >
            <Form.Item
              name="name"
              label={<span className="font-semibold text-gray-700">Full Name</span>}
              rules={[{ required: true, message: 'Please input your name!' }]}
            >
              <Input 
                prefix={<User className="w-4 h-4 text-gray-400" />} 
                placeholder="Enter your full name"
                className="!h-12 !rounded-xl"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span className="font-semibold text-gray-700">Email Address</span>}
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' },
              ]}
            >
              <Input 
                prefix={<Mail className="w-4 h-4 text-gray-400" />} 
                placeholder="Enter your email"
                className="!h-12 !rounded-xl"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label={<span className="font-semibold text-gray-700">Phone Number</span>}
              rules={[{ required: true, message: 'Please input your phone!' }]}
            >
              <Input 
                prefix={<Phone className="w-4 h-4 text-gray-400" />} 
                placeholder="Enter your phone number"
                className="!h-12 !rounded-xl"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="font-semibold text-gray-700">Password</span>}
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 6, message: 'Password must be at least 6 characters!' },
              ]}
            >
              <Input.Password
                prefix={<Lock className="w-4 h-4 text-gray-400" />}
                placeholder="Create a strong password"
                className="!h-12 !rounded-xl"
              />
            </Form.Item>

            <Form.Item
              name="confirm"
              label={<span className="font-semibold text-gray-700">Confirm Password</span>}
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<Lock className="w-4 h-4 text-gray-400" />}
                placeholder="Re-enter your password"
                className="!h-12 !rounded-xl"
              />
            </Form.Item>

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded-lg">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <Form.Item className="!mb-6 !pt-4">
              <Button
                type="primary"
                htmlType="submit"
                className="w-full !h-12 !text-base !font-semibold !rounded-xl !bg-gradient-to-r !from-red-600 !to-red-700 hover:!from-red-700 hover:!to-red-800 !border-0 shadow-lg shadow-red-600/30"
                loading={loading}
              >
                Create Account
              </Button>
            </Form.Item>
          </Form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <Text className="text-gray-600">
              Already registered?{' '}
              <Link to="/login" className="text-red-600 hover:text-red-700 font-semibold">
                Sign In
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
    </div>
  );
};

export default Register;
