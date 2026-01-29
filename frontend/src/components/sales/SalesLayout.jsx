import { Layout } from 'antd';
import SalesSidebar from './SalesSidebar';
import SalesHeader from './SalesHeader';

const { Content } = Layout;

const SalesLayout = ({ children }) => {
  return (
    <Layout className="min-h-screen" style={{ background: '#f5f7fa' }}>
      <SalesSidebar />
      <Layout style={{ background: '#f5f7fa' }}>
        <SalesHeader />
        <Content style={{ margin: '24px', background: '#f5f7fa' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default SalesLayout;
