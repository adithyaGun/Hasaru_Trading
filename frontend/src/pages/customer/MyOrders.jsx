import { useEffect, useState } from 'react';
import { 
  Layout, 
  Card, 
  Table, 
  Tag, 
  Button, 
  Modal,
  Descriptions,
  Timeline,
  Steps,
  Empty,
  message,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  EyeOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  TruckOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../api/axios';

const { Content } = Layout;

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sales/online/my-orders');
      // Backend returns { success, message, data: { orders, pagination } }
      const ordersData = response.data?.data?.orders || [];
      
      // Map new schema fields to expected format
      const mappedOrders = ordersData.map(order => ({
        ...order,
        order_number: `ONL-${String(order.id).padStart(6, '0')}`,
        order_date: order.sale_date || order.created_at,
        shipping_address: extractShippingAddress(order.notes),
        // Map status: 'reserved' -> 'pending', keep others as is
        display_status: order.status === 'reserved' ? 'pending' : order.status
      }));
      
      setOrders(mappedOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      message.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const extractShippingAddress = (notes) => {
    if (!notes) return 'N/A';
    
    // Extract shipping address from notes
    const match = notes.match(/Shipping Address:\s*(.+?)(?:\n|$)/);
    if (match && match[1]) {
      // Remove quotes if present
      return match[1].replace(/^["']|["']$/g, '').trim();
    }
    
    return notes.split('\n')[0] || 'N/A';
  };

  const handleViewDetails = async (order) => {
    try {
      // Fetch full order details with items
      const response = await api.get(`/sales/online/orders/${order.id}`);
      const fullOrder = response.data?.data || order;
      
      // Map the full order with display fields
      const mappedOrder = {
        ...fullOrder,
        order_number: `ONL-${String(fullOrder.id).padStart(6, '0')}`,
        order_date: fullOrder.sale_date || fullOrder.created_at,
        shipping_address: extractShippingAddress(fullOrder.notes),
        display_status: fullOrder.status === 'reserved' ? 'pending' : fullOrder.status
      };
      
      setViewingOrder(mappedOrder);
      setDetailsModalVisible(true);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      // Fallback to basic order data
      setViewingOrder({
        ...order,
        items: order.items || []
      });
      setDetailsModalVisible(true);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'processing': return 'blue';
      case 'shipped': return 'cyan';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <ClockCircleOutlined />;
      case 'processing': return <ShoppingOutlined />;
      case 'shipped': return <TruckOutlined />;
      case 'completed': return <CheckCircleOutlined />;
      case 'cancelled': return <CloseCircleOutlined />;
      default: return null;
    }
  };

  const getOrderProgress = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'completed': return 3;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const columns = [
    {
      title: 'Order Number',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Date',
      dataIndex: 'order_date',
      key: 'order_date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => <strong>Rs. {parseFloat(amount).toFixed(2)}</strong>,
    },
    {
      title: 'Status',
      dataIndex: 'display_status',
      key: 'display_status',
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status?.toUpperCase() || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
          style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
        >
          Track Order
        </Button>
      ),
    },
  ];

  const statsData = {
    total: orders.length,
    pending: orders.filter(o => o.display_status === 'pending').length,
    processing: orders.filter(o => o.display_status === 'processing').length,
    completed: orders.filter(o => o.display_status === 'completed').length
  };

  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content className="bg-gradient-to-br from-black via-red-950 to-red-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8 text-white">My Orders</h1>

          {/* Order Statistics */}
          <Row gutter={16} className="mb-8">
            <Col xs={24} sm={12} md={6}>
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <Statistic 
                  title={<span className="text-white/80">Total Orders</span>}
                  value={statsData.total}
                  valueStyle={{ color: '#ffffff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <Statistic 
                  title={<span className="text-white/80">Pending</span>}
                  value={statsData.pending}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <Statistic 
                  title={<span className="text-white/80">Processing</span>}
                  value={statsData.processing}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <Statistic 
                  title={<span className="text-white/80">Completed</span>}
                  value={statsData.completed}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Orders Table */}
          <Card className="shadow-2xl">
            {orders.length === 0 && !loading ? (
              <Empty 
                description="You haven't placed any orders yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Table
                columns={columns}
                dataSource={orders}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} orders`,
                }}
              />
            )}
          </Card>
        </div>
      </Content>
      <Footer />

      {/* Order Details Modal */}
      <Modal
        title={
          <div>
            <div className="text-xl font-bold">Order Details</div>
            {viewingOrder && (
              <div className="text-sm text-gray-500 font-normal">
                {viewingOrder.order_number}
              </div>
            )}
          </div>
        }
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {viewingOrder && (
          <>
            {/* Order Progress */}
            {viewingOrder.display_status !== 'cancelled' && (
              <Card className="mb-4 bg-gradient-to-r from-red-50 to-red-100">
                <Steps
                  current={getOrderProgress(viewingOrder.display_status)}
                  items={[
                    {
                      title: 'Pending',
                      icon: <ClockCircleOutlined />,
                    },
                    {
                      title: 'Processing',
                      icon: <ShoppingOutlined />,
                    },
                    {
                      title: 'Shipped',
                      icon: <TruckOutlined />,
                    },
                    {
                      title: 'Completed',
                      icon: <CheckCircleOutlined />,
                    },
                  ]}
                />
              </Card>
            )}

            {viewingOrder.display_status === 'cancelled' && (
              <Card className="mb-4 bg-red-50">
                <div className="text-center">
                  <CloseCircleOutlined style={{ fontSize: '48px', color: '#f5222d' }} />
                  <div className="text-xl font-bold text-red-600 mt-2">Order Cancelled</div>
                </div>
              </Card>
            )}

            {/* Order Information */}
            <Descriptions bordered column={2} className="mb-4">
              <Descriptions.Item label="Order Number" span={2}>
                <strong>{viewingOrder.order_number}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Order Date">
                {new Date(viewingOrder.order_date).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(viewingOrder.display_status)} icon={getStatusIcon(viewingOrder.display_status)}>
                  {viewingOrder.display_status?.toUpperCase() || 'N/A'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Status">
                <Tag color={viewingOrder.payment_status === 'paid' ? 'green' : 'orange'}>
                  {viewingOrder.payment_status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {viewingOrder.payment_method?.replace(/_/g, ' ').toUpperCase() || 'COD'}
              </Descriptions.Item>
              <Descriptions.Item label="Shipping Address" span={2}>
                {viewingOrder.shipping_address}
              </Descriptions.Item>
            </Descriptions>

            {/* Order Items */}
            <Card title="Order Items" className="mb-4">
              <Table
                dataSource={viewingOrder.items || []}
                rowKey={(record, index) => index}
                pagination={false}
                columns={[
                  {
                    title: 'Product',
                    dataIndex: 'product_name',
                    key: 'product_name',
                  },
                  {
                    title: 'Quantity',
                    dataIndex: 'quantity',
                    key: 'quantity',
                  },
                  {
                    title: 'Unit Price',
                    dataIndex: 'unit_price',
                    key: 'unit_price',
                    render: (price) => `Rs. ${parseFloat(price || 0).toFixed(2)}`,
                  },
                  {
                    title: 'Total',
                    dataIndex: 'subtotal',
                    key: 'subtotal',
                    render: (subtotal, record) => 
                      `Rs. ${parseFloat(subtotal || (record.quantity * (record.unit_price || 0))).toFixed(2)}`,
                  },
                ]}
                summary={(pageData) => {
                  const total = pageData.reduce(
                    (sum, item) => sum + parseFloat(item.subtotal || (item.quantity * (item.unit_price || 0))),
                    0
                  );
                  return (
                    <Table.Summary>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={3}>
                          <strong>Total Amount</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <strong style={{ color: '#dc2626', fontSize: '16px' }}>
                            Rs. {total.toFixed(2)}
                          </strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  );
                }}
              />
            </Card>

            {/* Order Timeline */}
            <Card title="Order Timeline">
              <Timeline>
                <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
                  <div><strong>Order Placed</strong></div>
                  <div className="text-gray-500 text-sm">
                    {new Date(viewingOrder.order_date).toLocaleString()}
                  </div>
                </Timeline.Item>
                
                {viewingOrder.display_status !== 'pending' && viewingOrder.display_status !== 'cancelled' && (
                  <Timeline.Item color="blue" dot={<ShoppingOutlined />}>
                    <div><strong>Processing Started</strong></div>
                    <div className="text-gray-500 text-sm">Your order is being prepared</div>
                  </Timeline.Item>
                )}
                
                {(viewingOrder.display_status === 'shipped' || viewingOrder.display_status === 'completed') && (
                  <Timeline.Item color="cyan" dot={<TruckOutlined />}>
                    <div><strong>Order Shipped</strong></div>
                    <div className="text-gray-500 text-sm">Your order is on the way</div>
                  </Timeline.Item>
                )}
                
                {viewingOrder.display_status === 'completed' && (
                  <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
                    <div><strong>Order Completed</strong></div>
                    <div className="text-gray-500 text-sm">Your order has been delivered</div>
                  </Timeline.Item>
                )}
                
                {viewingOrder.display_status === 'cancelled' && (
                  <Timeline.Item color="red" dot={<CloseCircleOutlined />}>
                    <div><strong>Order Cancelled</strong></div>
                    <div className="text-gray-500 text-sm">This order has been cancelled</div>
                  </Timeline.Item>
                )}
              </Timeline>
            </Card>
          </>
        )}
      </Modal>
    </Layout>
  );
};

export default MyOrders;
