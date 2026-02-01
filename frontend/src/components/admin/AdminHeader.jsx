import { Layout, Dropdown, Button } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { UserOutlined, LogoutOutlined, HomeOutlined, SettingOutlined } from '@ant-design/icons';

const { Header } = Layout;

const AdminHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path.includes('/products')) return 'Products Management';
    if (path.includes('/suppliers')) return 'Suppliers Management';
    if (path.includes('/purchases')) return 'Purchase Orders';
    if (path.includes('/reports')) return 'Reports';
    if (path.includes('/analytics')) return 'Analytics';
    if (path.includes('/alerts')) return 'Alerts';
    if (path.includes('/profile')) return 'My Profile';
    if (path.includes('/users')) return 'User Management';
    if (path.includes('/promotions')) return 'Promotions';
    return 'Admin Panel';
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const menuItems = [
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: 'My Profile',
      onClick: () => navigate('/admin/profile'),
    },
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Go to Website',
      onClick: () => navigate('/'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <Header className="bg-white shadow-sm flex justify-between items-center px-6">
      <h2 className="text-2xl font-bold m-0 text-gray-800">{getPageTitle()}</h2>
      <Dropdown menu={{ items: menuItems }} placement="bottomRight">
        <Button type="text" icon={<UserOutlined />}>
          {user?.name}
        </Button>
      </Dropdown>
    </Header>
  );
};

export default AdminHeader;
