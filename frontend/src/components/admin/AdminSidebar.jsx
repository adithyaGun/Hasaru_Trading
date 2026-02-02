import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  DashboardOutlined,
  ShoppingOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  BarChartOutlined,
  BellOutlined,
  UserOutlined,
  TagOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShopOutlined,
  GlobalOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const AdminSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: <Link to="/admin">Dashboard</Link>,
    },
    {
      key: '/admin/products',
      icon: <ShoppingOutlined />,
      label: <Link to="/admin/products">Products</Link>,
    },
    {
      key: '/admin/suppliers',
      icon: <TeamOutlined />,
      label: <Link to="/admin/suppliers">Suppliers</Link>,
    },
    {
      key: '/admin/purchases',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/admin/purchases">Purchases</Link>,
    },
    {
      key: '/admin/pos-sales',
      icon: <ShopOutlined />,
      label: <Link to="/admin/pos-sales">POS Sales</Link>,
    },
    {
      key: '/admin/online-orders',
      icon: <GlobalOutlined />,
      label: <Link to="/admin/online-orders">Online Orders</Link>,
    },
    {
      key: '/admin/reports',
      icon: <FileTextOutlined />,
      label: <Link to="/admin/reports">Reports</Link>,
    },
    {
      key: '/admin/analytics',
      icon: <BarChartOutlined />,
      label: <Link to="/admin/analytics">Analytics</Link>,
    },
    {
      key: '/admin/alerts',
      icon: <BellOutlined />,
      label: <Link to="/admin/alerts">Alerts</Link>,
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: <Link to="/admin/users">Users</Link>,
    },
    {
      key: '/admin/promotions',
      icon: <TagOutlined />,
      label: <Link to="/admin/promotions">Promotions</Link>,
    },
  ];

  return (
    <Sider 
      width={250} 
      theme="light" 
      className="min-h-screen"
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      trigger={null}
    >
      <div className="p-4 text-center font-bold text-xl border-b flex items-center justify-between" style={{ height: '64px' }}>
        {collapsed ? (
          <span style={{ color: '#dc2626', fontSize: '20px', fontWeight: 'bold' }}>HT</span>
        ) : (
          <span style={{ color: '#dc2626', fontWeight: 'bold' }}>Hasaru Trading</span>
        )}
        <div 
          className="cursor-pointer hover:text-red-600 transition-colors"
          onClick={() => setCollapsed(!collapsed)}
          style={{ color: '#dc2626' }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[currentPath]}
        items={menuItems}
        className="border-r-0"
      />
    </Sider>
  );
};

export default AdminSidebar;
