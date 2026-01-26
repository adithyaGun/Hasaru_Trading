import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Select, 
  DatePicker, 
  Table,
  Space,
  Button,
  message
} from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  RiseOutlined,
  DownloadOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '../../api/axios';

const { RangePicker } = DatePicker;
const { Option } = Select;

const COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#2563eb', '#7c3aed'];

const AdminReports = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    growthRate: 0
  });

  useEffect(() => {
    fetchReportData();
  }, [reportType, dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Fetch overall statistics
      const statsResponse = await api.get('/reports/stats', {
        params: {
          start_date: dateRange?.[0]?.format('YYYY-MM-DD'),
          end_date: dateRange?.[1]?.format('YYYY-MM-DD')
        }
      });
      
      if (statsResponse.data) {
        setStats({
          totalRevenue: statsResponse.data.total_revenue || 0,
          totalOrders: statsResponse.data.total_orders || 0,
          totalCustomers: statsResponse.data.total_customers || 0,
          growthRate: statsResponse.data.growth_rate || 0
        });
      }

      // Fetch sales trend data
      const salesResponse = await api.get('/reports/sales-trend', {
        params: {
          start_date: dateRange?.[0]?.format('YYYY-MM-DD'),
          end_date: dateRange?.[1]?.format('YYYY-MM-DD')
        }
      });
      setSalesData(salesResponse.data || generateMockSalesData());

      // Fetch top products
      const productsResponse = await api.get('/reports/top-products', {
        params: {
          limit: 10
        }
      });
      setTopProducts(productsResponse.data || generateMockTopProducts());

      // Fetch category breakdown
      const categoryResponse = await api.get('/reports/category-breakdown');
      setCategoryData(categoryResponse.data || generateMockCategoryData());

      message.success('Report data loaded successfully');
    } catch (error) {
      console.error('Error fetching report data:', error);
      // Use mock data on error
      setSalesData(generateMockSalesData());
      setTopProducts(generateMockTopProducts());
      setCategoryData(generateMockCategoryData());
      setStats({
        totalRevenue: 125430.50,
        totalOrders: 342,
        totalCustomers: 156,
        growthRate: 15.3
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock data generators for development
  const generateMockSalesData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      revenue: Math.floor(Math.random() * 30000) + 15000,
      orders: Math.floor(Math.random() * 80) + 40
    }));
  };

  const generateMockTopProducts = () => {
    return [
      { id: 1, name: 'Michelin Pilot Sport 4', category: 'Tires', units_sold: 145, revenue: 21750 },
      { id: 2, name: 'Bosch S4 Battery', category: 'Batteries', units_sold: 98, revenue: 14700 },
      { id: 3, name: 'NGK Spark Plugs', category: 'Engine Parts', units_sold: 234, revenue: 7020 },
      { id: 4, name: 'Pirelli P Zero', category: 'Tires', units_sold: 87, revenue: 15660 },
      { id: 5, name: 'Castrol Edge 5W-30', category: 'Lubricants', units_sold: 176, revenue: 8800 }
    ];
  };

  const generateMockCategoryData = () => {
    return [
      { name: 'Tires', value: 45 },
      { name: 'Batteries', value: 25 },
      { name: 'Engine Parts', value: 15 },
      { name: 'Lubricants', value: 10 },
      { name: 'Others', value: 5 }
    ];
  };

  const handleExport = () => {
    message.info('Exporting report...');
    // Implement export functionality
  };

  const topProductsColumns = [
    {
      title: 'Rank',
      key: 'rank',
      render: (_, __, index) => index + 1,
      width: 70,
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Units Sold',
      dataIndex: 'units_sold',
      key: 'units_sold',
      render: (value) => value.toLocaleString(),
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value) => `$${value.toLocaleString()}`,
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <Row justify="space-between" align="middle" className="mb-6">
          <Col>
            <h1 className="text-2xl font-bold">Sales & Inventory Reports</h1>
          </Col>
          <Col>
            <Space>
              <Select
                style={{ width: 150 }}
                value={reportType}
                onChange={setReportType}
              >
                <Option value="sales">Sales Report</Option>
                <Option value="inventory">Inventory Report</Option>
                <Option value="products">Products Report</Option>
              </Select>
              <RangePicker onChange={setDateRange} />
              <Button icon={<ReloadOutlined />} onClick={fetchReportData}>
                Refresh
              </Button>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />} 
                onClick={handleExport}
                style={{ backgroundColor: '#dc2626' }}
              >
                Export
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Key Metrics */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Revenue"
                value={stats.totalRevenue}
                precision={2}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#dc2626' }}
                suffix="USD"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Orders"
                value={stats.totalOrders}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#2563eb' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Customers"
                value={stats.totalCustomers}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#16a34a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Growth Rate"
                value={stats.growthRate}
                precision={1}
                prefix={<RiseOutlined />}
                suffix="%"
                valueStyle={{ color: '#16a34a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} lg={16}>
            <Card title="Sales Trend" loading={loading}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#dc2626" 
                    strokeWidth={2}
                    name="Revenue ($)"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    name="Orders"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Sales by Category" loading={loading}>
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Top Products Bar Chart */}
        <Row gutter={16} className="mb-6">
          <Col xs={24}>
            <Card title="Top Products Performance" loading={loading}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="units_sold" fill="#2563eb" name="Units Sold" />
                  <Bar dataKey="revenue" fill="#dc2626" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Top Products Table */}
        <Row gutter={16}>
          <Col xs={24}>
            <Card title="Top 10 Best-Selling Products" loading={loading}>
              <Table
                columns={topProductsColumns}
                dataSource={topProducts}
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

export default AdminReports;
