import { Layout, Dropdown, Button } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { UserOutlined, LogoutOutlined, HomeOutlined } from '@ant-design/icons';

const { Header } = Layout;

const SalesHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/sales') return 'Sales Dashboard';
    if (path.includes('/pos')) return 'Point of Sale';
    if (path.includes('/orders')) return 'Online Orders';
    if (path.includes('/history')) return 'Sales History';
    return 'Sales Panel';
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const menuItems = [
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

export default SalesHeader;
