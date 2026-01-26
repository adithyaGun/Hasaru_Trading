import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  HistoryOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const SalesSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: '/sales',
      icon: <DashboardOutlined />,
      label: <Link to="/sales">Dashboard</Link>,
    },
    {
      key: '/sales/pos',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/sales/pos">POS Sale</Link>,
    },
    {
      key: '/sales/orders',
      icon: <ShoppingOutlined />,
      label: <Link to="/sales/orders">Online Orders</Link>,
    },
    {
      key: '/sales/history',
      icon: <HistoryOutlined />,
      label: <Link to="/sales/history">Sales History</Link>,
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
      <div className="p-4 text-center font-bold text-xl border-b flex items-center justify-between">
        {!collapsed && <span>Sales Panel</span>}
        <div 
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => setCollapsed(!collapsed)}
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

export default SalesSidebar;
