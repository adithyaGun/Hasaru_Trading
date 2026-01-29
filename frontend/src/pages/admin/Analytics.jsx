import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table,
  Tag,
  Space,
  Button,
  message,
  DatePicker
} from 'antd';
import {
  ReloadOutlined,
  DownloadOutlined,
  RiseOutlined,
  FallOutlined,
  SwapOutlined
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { analyticsAPI } from '../../api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const COLORS = ['#dc2626', '#2563eb', '#059669', '#ea580c', '#8b5cf6', '#eab308'];

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [fastMovingItems, setFastMovingItems] = useState([]);
  const [slowMovingItems, setSlowMovingItems] = useState([]);
  const [inventoryTurnover, setInventoryTurnover] = useState([]);
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    avgTurnover: 0,
    fastMovingCount: 0,
    slowMovingCount: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');

      // Fetch all analytics data in parallel with error handling
      const [topSellingRes, fastMovingRes, slowMovingRes, turnoverRes] = await Promise.all([
        analyticsAPI.getTopSelling({ start_date: startDate, end_date: endDate, limit: 10 })
          .catch(err => {
            console.error('Top selling error:', err);
            return { data: { data: { top_selling_products: [] } } };
          }),
        analyticsAPI.getFastMoving({ start_date: startDate, end_date: endDate, limit: 10 })
          .catch(err => {
            console.error('Fast moving error:', err);
            return { data: { data: { fast_moving_items: [] } } };
          }),
        analyticsAPI.getSlowMoving({ start_date: startDate, end_date: endDate, limit: 10 })
          .catch(err => {
            console.error('Slow moving error:', err);
            return { data: { data: { slow_moving_items: [] } } };
          }),
        analyticsAPI.getInventoryTurnover({ start_date: startDate, end_date: endDate })
          .catch(err => {
            console.error('Turnover error:', err);
            return { data: { data: {} } };
          })
      ]);

      // Extract nested data from API responses
      const topSelling = topSellingRes.data.data?.top_selling_products || [];
      const fastMoving = fastMovingRes.data.data?.fast_moving_items || [];
      const slowMoving = slowMovingRes.data.data?.slow_moving_items || [];
      const turnoverData = turnoverRes.data.data || {};

      // Map top selling to match expected format
      const mappedTopSelling = topSelling.map(item => ({
        ...item,
        total_sold: item.total_quantity_sold || 0,
        total_revenue: item.total_revenue || 0
      }));

      // Map fast/slow moving to match expected format
      const mappedFastMoving = fastMoving.map(item => ({
        ...item,
        total_sold: parseInt(item.quantity_sold) || 0,
        days_in_stock: item.sales_frequency || 0,
        turnover_ratio: parseFloat(item.daily_average_sales) || 0
      }));

      const mappedSlowMoving = slowMoving.map(item => ({
        ...item,
        total_sold: parseInt(item.quantity_sold) || 0,
        days_in_stock: item.sales_frequency || 0,
        turnover_ratio: 0
      }));

      setTopSellingProducts(mappedTopSelling);
      setFastMovingItems(mappedFastMoving);
      setSlowMovingItems(mappedSlowMoving);
      setInventoryTurnover(turnoverData);

      // Calculate stats
      const avgTurnover = parseFloat(turnoverData.inventory_turnover_rate) || 0;

      setStats({
        totalProducts: topSelling.length + fastMoving.length + slowMoving.length,
        avgTurnover: avgTurnover,
        fastMovingCount: fastMoving.length,
        slowMovingCount: slowMoving.length
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      message.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const topSellingColumns = [
    {
      title: 'Rank',
      key: 'rank',
      width: 60,
      render: (_, record, index) => (
        <Tag color={index < 3 ? 'red' : 'default'}>{index + 1}</Tag>
      )
    },
    {
      title: 'Product Name',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (text) => <span style={{ fontWeight: '500' }}>{text}</span>
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Units Sold',
      dataIndex: 'total_sold',
      key: 'total_sold',
      render: (value) => <span style={{ fontWeight: 'bold', color: '#dc2626' }}>{value}</span>,
      sorter: (a, b) => a.total_sold - b.total_sold,
    },
    {
      title: 'Revenue',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      render: (value) => `Rs. ${parseFloat(value || 0).toFixed(2)}`,
      sorter: (a, b) => a.total_revenue - b.total_revenue,
    },
  ];

  const movementColumns = [
    {
      title: 'Product Name',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (text) => <span style={{ fontWeight: '500' }}>{text}</span>
    },
    {
      title: 'Current Stock',
      dataIndex: 'current_stock',
      key: 'current_stock',
      render: (stock) => (
        <Tag color={stock < 10 ? 'red' : stock < 50 ? 'orange' : 'green'}>
          {stock} units
        </Tag>
      )
    },
    {
      title: 'Sold (Period)',
      dataIndex: 'total_sold',
      key: 'total_sold',
    },
    {
      title: 'Sales Frequency',
      dataIndex: 'days_in_stock',
      key: 'days_in_stock',
    },
    {
      title: 'Daily Avg',
      dataIndex: 'turnover_ratio',
      key: 'turnover_ratio',
      render: (value) => `${parseFloat(value || 0).toFixed(2)}`,
      sorter: (a, b) => (a.turnover_ratio || 0) - (b.turnover_ratio || 0),
    },
  ];

  const handleDownload = () => {
    const csvData = [
      ['Top Selling Products Report'],
      [`Period: ${dateRange[0].format('YYYY-MM-DD')} to ${dateRange[1].format('YYYY-MM-DD')}`],
      [],
      ['Rank', 'Product Name', 'SKU', 'Units Sold', 'Revenue'],
      ...topSellingProducts.map((p, i) => [
        i + 1,
        p.product_name,
        p.sku,
        p.total_sold,
        `Rs. ${parseFloat(p.total_revenue || 0).toFixed(2)}`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    message.success('Report downloaded successfully');
  };

  // Prepare chart data for top selling products
  const chartData = topSellingProducts.slice(0, 8).map(item => ({
    name: item.product_name?.substring(0, 20) + '...',
    fullName: item.product_name,
    value: parseFloat(item.total_revenue || 0)
  }));

  return (
    <AdminLayout>
      <div className="mb-6">
        {/* Header */}
        <Row justify="space-between" align="middle" className="mb-6">
          <Col>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Analytics & Insights</h2>
            <p style={{ margin: '4px 0 0', color: '#666' }}>
              {dateRange[0].format('MMM D, YYYY')} - {dateRange[1].format('MMM D, YYYY')}
            </p>
          </Col>
          <Col>
            <Space>
              <RangePicker 
                value={dateRange}
                onChange={(dates) => dates && setDateRange(dates)}
              />
              <Button icon={<ReloadOutlined />} onClick={fetchAnalytics} loading={loading}>
                Refresh
              </Button>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
              >
                Export
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Key Metrics */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: '12px' }}>
              <Statistic
                title="Total Products Analyzed"
                value={stats.totalProducts}
                prefix={<SwapOutlined />}
                valueStyle={{ color: '#2563eb' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: '12px' }}>
              <Statistic
                title="Avg Inventory Turnover"
                value={stats.avgTurnover}
                precision={2}
                suffix="x"
                prefix={<ReloadOutlined />}
                valueStyle={{ color: '#059669' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: '12px' }}>
              <Statistic
                title="Fast Moving Items"
                value={stats.fastMovingCount}
                prefix={<RiseOutlined />}
                valueStyle={{ color: '#16a34a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: '12px' }}>
              <Statistic
                title="Slow Moving Items"
                value={stats.slowMovingCount}
                prefix={<FallOutlined />}
                valueStyle={{ color: '#ea580c' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts Row */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} lg={16}>
            <Card 
              title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Top Selling Products by Revenue</span>}
              style={{ borderRadius: '16px' }}
              loading={loading}
            >
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" angle={-15} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => `Rs. ${parseFloat(value).toFixed(2)}`}
                    labelFormatter={(label, payload) => payload[0]?.payload?.fullName}
                  />
                  <Bar dataKey="value" fill="#dc2626" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          
          <Col xs={24} lg={8}>
            <Card 
              title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Revenue Distribution</span>}
              style={{ borderRadius: '16px' }}
              loading={loading}
            >
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={chartData.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `Rs. ${parseFloat(value).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
              {chartData.slice(0, 6).map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', marginTop: '8px', fontSize: '12px' }}>
                  <span style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: COLORS[index % COLORS.length], 
                    borderRadius: '50%', 
                    marginRight: '8px' 
                  }}></span>
                  <span>{item.fullName}</span>
                </div>
              ))}
            </Card>
          </Col>
        </Row>

        {/* Top Selling Products Table */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24}>
            <Card 
              title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Top 10 Best Sellers</span>}
              style={{ borderRadius: '16px' }}
            >
              <Table
                columns={topSellingColumns}
                dataSource={topSellingProducts}
                rowKey="product_id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </Col>
        </Row>

        {/* Fast & Slow Moving Items */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card 
              title={<span style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a' }}>Fast Moving Items</span>}
              style={{ borderRadius: '16px' }}
            >
              <Table
                columns={movementColumns}
                dataSource={fastMovingItems}
                rowKey="product_id"
                loading={loading}
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card 
              title={<span style={{ fontSize: '18px', fontWeight: 'bold', color: '#ea580c' }}>Slow Moving Items</span>}
              style={{ borderRadius: '16px' }}
            >
              <Table
                columns={movementColumns}
                dataSource={slowMovingItems}
                rowKey="product_id"
                loading={loading}
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
