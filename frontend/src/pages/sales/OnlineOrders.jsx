import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  Table, 
  Button, 
  Modal, 
  Select, 
  Space, 
  Tag, 
  Popconfirm, 
  message,
  Row,
  Col,
  Card,
  Statistic,
  Descriptions,
  Timeline,
  Input
} from 'antd';
import { 
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TruckOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import api from '../../api/axios';

const { Option } = Select;

const OnlineOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/sales/online/orders');
      // Backend returns { success, message, data: { orders, pagination } }
      const ordersData = response.data?.data?.orders || [];
      setOrders(ordersData);
      calculateStats(ordersData);
      message.success('Orders loaded successfully');
    } catch (error) {
      message.error('Failed to load orders');
      console.error('Error fetching orders:', error);
      // Use mock data on error
      const mockOrders = generateMockOrders();
      setOrders(mockOrders);
      calculateStats(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  const generateMockOrders = () => {
    return [
      {
        id: 1,
        order_number: 'ORD-2026-001',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone: '+1234567890',
        total_amount: 245.50,
        status: 'pending',
        payment_status: 'paid',
        created_at: new Date().toISOString(),
        items: [
          { product_name: 'Michelin Tire', quantity: 2, price: 100 },
          { product_name: 'Oil Filter', quantity: 1, price: 45.50 }
        ]
      },
      {
        id: 2,
        order_number: 'ORD-2026-002',
        customer_name: 'Jane Smith',
        customer_email: 'jane@example.com',
        customer_phone: '+1234567891',
        total_amount: 380.00,
        status: 'processing',
        payment_status: 'paid',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        items: [
          { product_name: 'Car Battery', quantity: 1, price: 380 }
        ]
      }
    ];
  };

  const calculateStats = (ordersData) => {
    if (!Array.isArray(ordersData)) {
      setStats({ total: 0, pending: 0, processing: 0, completed: 0, cancelled: 0 });
      return;
    }
    const total = ordersData.length;
    const pending = ordersData.filter(o => o.status === 'pending').length;
    const processing = ordersData.filter(o => o.status === 'processing').length;
    const completed = ordersData.filter(o => o.status === 'completed').length;
    const cancelled = ordersData.filter(o => o.status === 'cancelled').length;
    setStats({ total, pending, processing, completed, cancelled });
  };

  const handleView = async (record) => {
    setViewingOrder(record);
    setDetailsModalVisible(true);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/sales/online/${orderId}`, { status: newStatus });
      message.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      message.error('Failed to update order status');
      console.error('Error updating order:', error);
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

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'green';
      case 'pending': return 'orange';
      case 'failed': return 'red';
      default: return 'default';
    }
  };

  const filteredOrders = (Array.isArray(orders) ? orders : []).filter(order => {
    const matchesSearch = 
      order.order_number?.toLowerCase().includes(searchText.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: 'Order #',
      dataIndex: 'order_number',
      key: 'order_number',
      width: 140,
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
      width: 150,
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 100,
      render: (amount) => `$${parseFloat(amount).toFixed(2)}`,
    },
    {
      title: 'Payment',
      dataIndex: 'payment_status',
      key: 'payment_status',
      width: 100,
      render: (status) => (
        <Tag color={getPaymentStatusColor(status)}>
          {status?.toUpperCase() || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status?.toUpperCase() || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 300,
      render: (_, record) => (
        <Space size="small" wrap>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleView(record)}
          >
            View
          </Button>
          {record.status === 'pending' && (
            <Popconfirm
              title="Start processing this order?"
              onConfirm={() => handleUpdateStatus(record.id, 'processing')}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" icon={<CheckCircleOutlined />}>
                Process
              </Button>
            </Popconfirm>
          )}
          {record.status === 'processing' && (
            <Popconfirm
              title="Mark this order as shipped?"
              onConfirm={() => handleUpdateStatus(record.id, 'shipped')}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" icon={<TruckOutlined />} style={{ color: '#2563eb' }}>
                Ship
              </Button>
            </Popconfirm>
          )}
          {record.status === 'shipped' && (
            <Popconfirm
              title="Mark this order as completed?"
              onConfirm={() => handleUpdateStatus(record.id, 'completed')}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" icon={<CheckCircleOutlined />} style={{ color: '#16a34a' }}>
                Complete
              </Button>
            </Popconfirm>
          )}
          {(record.status === 'pending' || record.status === 'processing') && (
            <Popconfirm
              title="Cancel this order?"
              onConfirm={() => handleUpdateStatus(record.id, 'cancelled')}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger icon={<CloseCircleOutlined />}>
                Cancel
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Online Orders Management</h1>
        
        {/* Statistics Cards */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} lg={4}>
            <Card>
              <Statistic 
                title="Total Orders" 
                value={stats.total}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Card>
              <Statistic 
                title="Pending" 
                value={stats.pending}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Card>
              <Statistic 
                title="Processing" 
                value={stats.processing}
                valueStyle={{ color: '#2563eb' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Card>
              <Statistic 
                title="Completed" 
                value={stats.completed}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Card>
              <Statistic 
                title="Cancelled" 
                value={stats.cancelled}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters and Actions */}
        <Card className="mb-4">
          <Row gutter={16} align="middle">
            <Col xs={24} md={10}>
              <Input
                placeholder="Search by order number or customer name"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by Status"
                value={filterStatus}
                onChange={setFilterStatus}
              >
                <Option value="all">All Status</Option>
                <Option value="pending">Pending</Option>
                <Option value="processing">Processing</Option>
                <Option value="shipped">Shipped</Option>
                <Option value="completed">Completed</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Col>
            <Col xs={24} md={8} className="text-right">
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchOrders}
              >
                Refresh
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Orders Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={filteredOrders}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} orders`,
            }}
            scroll={{ x: 1100 }}
          />
        </Card>
      </div>

      {/* View Order Details Modal */}
      <Modal
        title="Order Details"
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
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Order Number" span={2}>
                <strong>{viewingOrder.order_number}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Customer Name">
                {viewingOrder.customer_name}
              </Descriptions.Item>
              <Descriptions.Item label="Order Status">
                <Tag color={getStatusColor(viewingOrder.status)}>
                  {viewingOrder.status?.toUpperCase() || 'N/A'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {viewingOrder.customer_email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {viewingOrder.customer_phone}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Status">
                <Tag color={getPaymentStatusColor(viewingOrder.payment_status)}>
                  {viewingOrder.payment_status?.toUpperCase() || 'N/A'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {viewingOrder.payment_method || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Order Date" span={2}>
                {new Date(viewingOrder.created_at).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Shipping Address" span={2}>
                {viewingOrder.shipping_address || 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            <Card title="Order Items" style={{ marginTop: '20px' }}>
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
                    dataIndex: 'price',
                    key: 'price',
                    render: (price) => `$${parseFloat(price).toFixed(2)}`,
                  },
                  {
                    title: 'Total',
                    key: 'total',
                    render: (_, record) => 
                      `$${(record.quantity * record.price).toFixed(2)}`,
                  },
                ]}
                summary={(pageData) => {
                  const total = pageData.reduce(
                    (sum, item) => sum + (item.quantity * item.price),
                    0
                  );
                  return (
                    <Table.Summary>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={3}>
                          <strong>Total Amount</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <strong style={{ color: '#dc2626' }}>
                            ${total.toFixed(2)}
                          </strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  );
                }}
              />
            </Card>

            <Card title="Order Timeline" style={{ marginTop: '20px' }}>
              <Timeline>
                <Timeline.Item color="green">
                  <strong>Order Placed</strong>
                  <br />
                  {new Date(viewingOrder.created_at).toLocaleString()}
                </Timeline.Item>
                {viewingOrder.status !== 'pending' && (
                  <Timeline.Item color="blue">
                    <strong>Processing Started</strong>
                  </Timeline.Item>
                )}
                {viewingOrder.status === 'shipped' && (
                  <Timeline.Item color="cyan">
                    <strong>Order Shipped</strong>
                  </Timeline.Item>
                )}
                {viewingOrder.status === 'completed' && (
                  <Timeline.Item color="green">
                    <strong>Order Completed</strong>
                  </Timeline.Item>
                )}
                {viewingOrder.status === 'cancelled' && (
                  <Timeline.Item color="red">
                    <strong>Order Cancelled</strong>
                  </Timeline.Item>
                )}
              </Timeline>
            </Card>
          </>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default OnlineOrders;
