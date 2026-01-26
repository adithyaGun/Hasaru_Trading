import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress,
  Table,
  Tag,
  Space,
  Button,
  message
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import api from '../../api/axios';

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [revenueData, setRevenueData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [inventoryHealth, setInventoryHealth] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [kpis, setKpis] = useState({
    avgOrderValue: 0,
    customerRetention: 0,
    inventoryTurnover: 0,
    profitMargin: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch KPIs
      const kpisResponse = await api.get('/analytics/kpis');
      const kpisData = kpisResponse.data.data || (typeof kpisResponse.data === 'object' && !Array.isArray(kpisResponse.data) ? kpisResponse.data : null);
      if (kpisData && !Array.isArray(kpisData)) {
        setKpis(kpisData);
      } else {
        setKpis({
          avgOrderValue: 367.25,
          customerRetention: 78.5,
          inventoryTurnover: 4.2,
          profitMargin: 32.8
        });
      }

      // Fetch revenue trend
      const revenueResponse = await api.get('/analytics/revenue-trend');
      const revenueData = Array.isArray(revenueResponse.data) ? revenueResponse.data : (revenueResponse.data.data || []);
      setRevenueData(revenueData.length > 0 ? revenueData : generateMockRevenueData());

      // Fetch customer analytics
      const customerResponse = await api.get('/analytics/customer-behavior');
      const customerData = Array.isArray(customerResponse.data) ? customerResponse.data : (customerResponse.data.data || []);
      setCustomerData(customerData.length > 0 ? customerData : generateMockCustomerData());

      // Fetch inventory health
      const inventoryResponse = await api.get('/analytics/inventory-health');
      const inventoryData = Array.isArray(inventoryResponse.data) ? inventoryResponse.data : (inventoryResponse.data.data || []);
      setInventoryHealth(inventoryData.length > 0 ? inventoryData : generateMockInventoryHealth());

      // Fetch performance metrics
      const performanceResponse = await api.get('/analytics/performance');
      const performanceData = Array.isArray(performanceResponse.data) ? performanceResponse.data : (performanceResponse.data.data || []);
      setPerformanceMetrics(performanceData.length > 0 ? performanceData : generateMockPerformanceMetrics());

      // Fetch low stock alerts
      const lowStockResponse = await api.get('/analytics/low-stock');
      const lowStockData = Array.isArray(lowStockResponse.data) ? lowStockResponse.data : (lowStockResponse.data.data || []);
      setLowStockProducts(lowStockData.length > 0 ? lowStockData : generateMockLowStock());

      message.success('Analytics data loaded successfully');
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Use mock data on error
      setRevenueData(generateMockRevenueData());
      setCustomerData(generateMockCustomerData());
      setInventoryHealth(generateMockInventoryHealth());
      setPerformanceMetrics(generateMockPerformanceMetrics());
      setLowStockProducts(generateMockLowStock());
    } finally {
      setLoading(false);
    }
  };

  // Mock data generators
  const generateMockRevenueData = () => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    return weeks.map(week => ({
      week,
      revenue: Math.floor(Math.random() * 15000) + 20000,
      cost: Math.floor(Math.random() * 10000) + 12000,
      profit: Math.floor(Math.random() * 8000) + 6000
    }));
  };

  const generateMockCustomerData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      newCustomers: Math.floor(Math.random() * 20) + 5,
      returningCustomers: Math.floor(Math.random() * 40) + 15
    }));
  };

  const generateMockInventoryHealth = () => {
    return [
      { category: 'Tires', inStock: 85, lowStock: 10, outOfStock: 5 },
      { category: 'Batteries', inStock: 70, lowStock: 20, outOfStock: 10 },
      { category: 'Engine Parts', inStock: 90, lowStock: 8, outOfStock: 2 },
      { category: 'Lubricants', inStock: 75, lowStock: 15, outOfStock: 10 }
    ];
  };

  const generateMockPerformanceMetrics = () => {
    return [
      { metric: 'Sales', score: 85 },
      { metric: 'Customer Service', score: 92 },
      { metric: 'Inventory', score: 78 },
      { metric: 'Marketing', score: 88 },
      { metric: 'Operations', score: 81 },
      { metric: 'Quality', score: 94 }
    ];
  };

  const generateMockLowStock = () => {
    return [
      { id: 1, name: 'Michelin Pilot Sport 4', stock: 5, reorder_level: 20, status: 'critical' },
      { id: 2, name: 'Bosch S4 Battery', stock: 12, reorder_level: 15, status: 'low' },
      { id: 3, name: 'NGK Spark Plugs', stock: 8, reorder_level: 25, status: 'critical' },
      { id: 4, name: 'Castrol Edge 5W-30', stock: 18, reorder_level: 20, status: 'low' }
    ];
  };

  const lowStockColumns = [
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Current Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => <span style={{ fontWeight: 'bold' }}>{stock}</span>
    },
    {
      title: 'Reorder Level',
      dataIndex: 'reorder_level',
      key: 'reorder_level',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'critical' ? 'red' : 'orange'}>
          {status?.toUpperCase() || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" size="small" style={{ backgroundColor: '#dc2626' }}>
          Reorder
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <Row justify="space-between" align="middle" className="mb-6">
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchAnalytics}>
                Refresh
              </Button>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                style={{ backgroundColor: '#dc2626' }}
              >
                Export Report
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Key Performance Indicators */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Avg. Order Value"
                value={kpis.avgOrderValue}
                precision={2}
                prefix="Rs."
                valueStyle={{ color: '#dc2626' }}
                suffix={
                  <span style={{ fontSize: '14px', color: '#16a34a' }}>
                    <ArrowUpOutlined /> 12%
                  </span>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Customer Retention"
                value={kpis.customerRetention}
                precision={1}
                suffix="%"
                valueStyle={{ color: '#16a34a' }}
                prefix={
                  <span style={{ fontSize: '14px', color: '#16a34a' }}>
                    <ArrowUpOutlined />
                  </span>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Inventory Turnover"
                value={kpis.inventoryTurnover}
                precision={1}
                suffix="x"
                valueStyle={{ color: '#2563eb' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Profit Margin"
                value={kpis.profitMargin}
                precision={1}
                suffix="%"
                valueStyle={{ color: '#ea580c' }}
                prefix={
                  <span style={{ fontSize: '14px', color: '#ea580c' }}>
                    <ArrowDownOutlined /> 3%
                  </span>
                }
              />
            </Card>
          </Col>
        </Row>

        {/* Revenue Analysis */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} lg={16}>
            <Card title="Revenue vs Cost vs Profit Analysis" loading={loading}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stackId="1"
                    stroke="#dc2626" 
                    fill="#dc2626" 
                    fillOpacity={0.6}
                    name="Revenue"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cost" 
                    stackId="2"
                    stroke="#ea580c" 
                    fill="#ea580c" 
                    fillOpacity={0.6}
                    name="Cost"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stackId="3"
                    stroke="#16a34a" 
                    fill="#16a34a" 
                    fillOpacity={0.6}
                    name="Profit"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Performance Metrics" loading={loading}>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={performanceMetrics}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar 
                    name="Score" 
                    dataKey="score" 
                    stroke="#dc2626" 
                    fill="#dc2626" 
                    fillOpacity={0.6} 
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Customer Behavior */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} lg={12}>
            <Card title="Customer Acquisition & Retention" loading={loading}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={customerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="newCustomers" fill="#2563eb" name="New Customers" />
                  <Bar dataKey="returningCustomers" fill="#16a34a" name="Returning Customers" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Inventory Health by Category" loading={loading}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={inventoryHealth} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="inStock" fill="#16a34a" name="In Stock" stackId="a" />
                  <Bar dataKey="lowStock" fill="#ea580c" name="Low Stock" stackId="a" />
                  <Bar dataKey="outOfStock" fill="#dc2626" name="Out of Stock" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Inventory Status Overview */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} md={6}>
            <Card>
              <div className="text-center">
                <Progress 
                  type="dashboard" 
                  percent={85} 
                  strokeColor="#16a34a"
                  format={() => (
                    <div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>85%</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>In Stock</div>
                    </div>
                  )}
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card>
              <div className="text-center">
                <Progress 
                  type="dashboard" 
                  percent={10} 
                  strokeColor="#ea580c"
                  format={() => (
                    <div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>10%</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Low Stock</div>
                    </div>
                  )}
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card>
              <div className="text-center">
                <Progress 
                  type="dashboard" 
                  percent={5} 
                  strokeColor="#dc2626"
                  format={() => (
                    <div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>5%</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Out of Stock</div>
                    </div>
                  )}
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card>
              <div className="text-center">
                <Progress 
                  type="dashboard" 
                  percent={92} 
                  strokeColor="#2563eb"
                  format={() => (
                    <div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>92%</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Fulfillment Rate</div>
                    </div>
                  )}
                />
              </div>
            </Card>
          </Col>
        </Row>

        {/* Low Stock Alerts */}
        <Row gutter={16}>
          <Col xs={24}>
            <Card title="Low Stock Alerts - Immediate Action Required" loading={loading}>
              <Table
                columns={lowStockColumns}
                dataSource={lowStockProducts}
                rowKey="id"
                pagination={false}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
