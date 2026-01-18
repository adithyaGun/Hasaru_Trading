import { useEffect, useState } from 'react';
import { Layout, Card, Table, Tag, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { ordersAPI } from '../../api';
import dayjs from 'dayjs';

const { Content } = Layout;

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getMyOrders();
      setOrders(response.data.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending: 'orange',
    paid: 'blue',
    processing: 'cyan',
    delivered: 'green',
    cancelled: 'red',
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `#${id}`,
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => `Rs. ${parseFloat(amount).toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status]}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />}>
          View Details
        </Button>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold mb-6">My Orders</h1>
          <Card>
            <Table
              columns={columns}
              dataSource={orders}
              rowKey="id"
              loading={loading}
            />
          </Card>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default MyOrders;
