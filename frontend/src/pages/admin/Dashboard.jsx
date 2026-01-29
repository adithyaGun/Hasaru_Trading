import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Progress, Tag, Tabs } from 'antd';
import { 
  DollarOutlined, 
  ShoppingCartOutlined, 
  WarningOutlined, 
  UserOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminLayout from '../../components/admin/AdminLayout';
import { reportsAPI, alertsAPI } from '../../api';

const COLORS = ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fee2e2', '#fef2f2'];

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    lowStockItems: 0,
    totalCustomers: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Mock data for charts - replace with real API calls
  const [salesTrend, setSalesTrend] = useState([
    { name: 'Mon', sales: 4000, orders: 24 },
    { name: 'Tue', sales: 3000, orders: 18 },
    { name: 'Wed', sales: 5000, orders: 32 },
    { name: 'Thu', sales: 2780, orders: 21 },
    { name: 'Fri', sales: 6890, orders: 41 },
    { name: 'Sat', sales: 8390, orders: 52 },
    { name: 'Sun', sales: 9490, orders: 61 },
  ]);
  
  const [categoryData, setCategoryData] = useState([
    { name: 'Tires', value: 400 },
    { name: 'Batteries', value: 300 },
    { name: 'Oils', value: 200 },
    { name: 'Filters', value: 278 },
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch sales report for today
      const salesResponse = await reportsAPI.getSales({ period: 'daily' });
      
      // Fetch alerts statistics
      const alertsResponse = await alertsAPI.getStatistics();
      
      // Fetch recent alerts
      const recentAlertsResponse = await alertsAPI.getAll({ limit: 5 });

      setStats({
        totalSales: salesResponse.data.data.total_revenue || 0,
        totalOrders: salesResponse.data.data.total_orders || 0,
        lowStockItems: alertsResponse.data.data.active_alerts || 0,
        totalCustomers: 0, // Would need a separate endpoint
      });

      setRecentAlerts(recentAlertsResponse.data.data.alerts || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: '20px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          marginBottom: '24px',
          color: '#1a1a1a'
        }}>
          Admin Dashboard
        </h1>

        {/* Stats Cards with Gradient */}
        <Row gutter={[20, 20]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{
                background: '#dc2626',
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3)'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', opacity: 0.9 }}>Today's Sales</span>
                  <DollarOutlined style={{ fontSize: '24px', opacity: 0.9 }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                  Rs. {stats.totalSales.toFixed(2)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', opacity: 0.9 }}>
                  <ArrowUpOutlined style={{ marginRight: '4px' }} />
                  <span style={{ fontSize: '12px' }}>12% from yesterday</span>
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{
                background: '#ef4444',
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', opacity: 0.9 }}>Total Orders</span>
                  <ShoppingCartOutlined style={{ fontSize: '24px', opacity: 0.9 }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {stats.totalOrders}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', opacity: 0.9 }}>
                  <ArrowUpOutlined style={{ marginRight: '4px' }} />
                  <span style={{ fontSize: '12px' }}>8% from yesterday</span>
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{
                background: '#f87171',
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(248, 113, 113, 0.3)'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', opacity: 0.9 }}>Low Stock Alerts</span>
                  <WarningOutlined style={{ fontSize: '24px', opacity: 0.9 }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {stats.lowStockItems}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', opacity: 0.9 }}>
                  <span style={{ fontSize: '12px' }}>Requires attention</span>
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{
                background: '#fca5a5',
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(252, 165, 165, 0.3)'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', opacity: 0.9 }}>Total Customers</span>
                  <UserOutlined style={{ fontSize: '24px', opacity: 0.9 }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {stats.totalCustomers}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', opacity: 0.9 }}>
                  <ArrowUpOutlined style={{ marginRight: '4px' }} />
                  <span style={{ fontSize: '12px' }}>15 new this week</span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Charts Row */}
        <Row gutter={[20, 20]} className="mb-6">
          <Col xs={24} lg={16}>
            <Card 
              title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Sales Trend (Last 7 Days)</span>}
              style={{ 
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#999" />
                  <YAxis stroke="#999" />
                  <RechartsTooltip 
                    contentStyle={{ 
                      background: 'white', 
                      border: '1px solid #fee2e2',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#dc2626" 
                    strokeWidth={3}
                    dot={{ fill: '#dc2626', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          
          <Col xs={24} lg={8}>
            <Card 
              title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Sales by Category</span>}
              style={{ 
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Weekly Performance */}
        <Row gutter={[20, 20]} className="mb-6">
          <Col xs={24} lg={12}>
            <Card 
              title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Weekly Performance</span>}
              style={{ 
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#999" />
                  <YAxis stroke="#999" />
                  <RechartsTooltip 
                    contentStyle={{ 
                      background: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="sales" fill="#dc2626" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="orders" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card 
              title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Top Performing Products</span>}
              style={{ 
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ padding: '12px 0' }}>
                {[
                  { name: 'Michelin Tire XYZ', sales: 24500, progress: 95 },
                  { name: 'Bosch Battery Pro', sales: 18200, progress: 78 },
                  { name: 'Castrol Engine Oil', sales: 15800, progress: 65 },
                  { name: 'Air Filter Premium', sales: 12400, progress: 52 },
                  { name: 'Brake Pads Deluxe', sales: 9800, progress: 42 }
                ].map((product, index) => (
                  <div key={index} style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '500' }}>{product.name}</span>
                      <span style={{ 
                        color: '#dc2626',
                        fontWeight: 'bold'
                      }}>
                        Rs. {product.sales.toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      percent={product.progress} 
                      strokeColor="#dc2626"
                      showInfo={false}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Recent Alerts Table */}
        <Card 
          title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Recent Low Stock Alerts</span>}
          style={{ 
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <Table
            columns={[
              {
                title: 'Product',
                dataIndex: 'product_name',
                key: 'product_name',
                render: (text) => <span style={{ fontWeight: '500' }}>{text}</span>
              },
              {
                title: 'Current Stock',
                dataIndex: 'current_stock',
                key: 'current_stock',
                render: (stock) => (
                  <Tag color={stock < 10 ? 'red' : 'orange'}>
                    {stock} units
                  </Tag>
                )
              },
              {
                title: 'Reorder Level',
                dataIndex: 'reorder_level',
                key: 'reorder_level',
              },
              {
                title: 'Status',
                key: 'status',
                render: (_, record) => {
                  const diff = record.reorder_level - record.current_stock;
                  return (
                    <Tag color={diff > 10 ? 'red' : 'orange'}>
                      {diff > 10 ? 'Urgent' : 'Warning'}
                    </Tag>
                  );
                }
              }
            ]}
            dataSource={recentAlerts}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
          />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
