import { Layout } from 'antd';
import SalesSidebar from './SalesSidebar';
import SalesHeader from './SalesHeader';

const { Content } = Layout;

const SalesLayout = ({ children }) => {
  return (
    <Layout className="min-h-screen">
      <SalesSidebar />
      <Layout>
        <SalesHeader />
        <Content className="m-6">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default SalesLayout;
