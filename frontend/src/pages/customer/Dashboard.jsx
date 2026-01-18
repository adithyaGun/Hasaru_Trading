import { Layout, Card } from 'antd';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const { Content } = Layout;

const CustomerDashboard = () => {
  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>
          <Card>
            <p>Customer dashboard coming soon...</p>
          </Card>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default CustomerDashboard;
