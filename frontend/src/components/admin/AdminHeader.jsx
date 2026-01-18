import { Layout, Dropdown, Button } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { UserOutlined, LogoutOutlined, HomeOutlined } from '@ant-design/icons';

const { Header } = Layout;

const AdminHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

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
      <h2 className="text-xl font-bold m-0">Tire & Auto Parts Management</h2>
      <Dropdown menu={{ items: menuItems }} placement="bottomRight">
        <Button type="text" icon={<UserOutlined />}>
          {user?.name}
        </Button>
      </Dropdown>
    </Header>
  );
};

export default AdminHeader;
