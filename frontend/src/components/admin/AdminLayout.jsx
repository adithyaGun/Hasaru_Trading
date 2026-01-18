import { Layout } from 'antd';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const { Content } = Layout;

const AdminLayout = ({ children }) => {
  return (
    <Layout className="min-h-screen">
      <AdminSidebar />
      <Layout>
        <AdminHeader />
        <Content className="m-6">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
