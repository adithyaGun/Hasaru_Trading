import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Tabs, Button, Space, Dropdown, message, DatePicker } from 'antd';
import { 
  DollarOutlined, 
  ShoppingCartOutlined, 
  WarningOutlined, 
  DownloadOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminLayout from '../../components/admin/AdminLayout';
import { alertsAPI, api } from '../../api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const CHANNEL_COLORS = {
  pos: '#dc2626',
  online: '#2563eb',
  otc: '#059669'
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    today_sales: 0,
    today_orders: 0,
    range_sales: 0,
    range_orders: 0,
    lowStockItems: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);
  const [dailyChartData, setDailyChartData] = useState([]);
  const [channelData, setChannelData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const today = dayjs().format('YYYY-MM-DD');
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');
      
      // Batch API calls with error handling for rate limiting
      const [todaySalesResponse, rangeSalesResponse, salesRes] = await Promise.all([
        api.get('/sales/summary', {
          params: { start_date: today, end_date: today }
        }).catch(err => ({ data: { success: false, data: [] } })),
        
        api.get('/sales/summary', {
          params: { start_date: startDate, end_date: endDate }
        }).catch(err => ({ data: { success: false, data: [] } })),
        
        api.get('/sales', {
          params: { start_date: startDate, end_date: endDate }
        }).catch(err => ({ data: { success: false, data: [] } }))
      ]);

      // Small delay before next batch to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

      // Fetch alerts in second batch
      const [alertsResponse, recentAlertsResponse] = await Promise.all([
        alertsAPI.getStatistics().catch(err => ({ data: { data: { active_alerts: 0 } } })),
        alertsAPI.getAll({ limit: 5 }).catch(err => ({ data: { data: { alerts: [] } } }))
      ]);

      // Process today's sales data (aggregate all channels)
      const todayData = todaySalesResponse.data.data || [];
      const todayTotals = todayData.reduce((acc, channel) => ({
        sales: acc.sales + parseFloat(channel.total_sales || 0),
        orders: acc.orders + parseInt(channel.transaction_count || 0)
      }), { sales: 0, orders: 0 });

      // Process range sales data (aggregate all channels)
      const rangeData = rangeSalesResponse.data.data || [];
      const rangeTotals = rangeData.reduce((acc, channel) => ({
        sales: acc.sales + parseFloat(channel.total_sales || 0),
        orders: acc.orders + parseInt(channel.transaction_count || 0)
      }), { sales: 0, orders: 0 });

      // Build channel breakdown for donut chart
      const channels = rangeData
        .filter(ch => parseFloat(ch.total_sales || 0) > 0)
        .map(ch => ({
          name: ch.channel.toUpperCase(),
          value: parseFloat(ch.total_sales || 0),
          transactions: parseInt(ch.transaction_count || 0),
          color: CHANNEL_COLORS[ch.channel] || '#6b7280'
        }));
      setChannelData(channels);

      setStats({
        today_sales: todayTotals.sales,
        today_orders: todayTotals.orders,
        range_sales: rangeTotals.sales,
        range_orders: rangeTotals.orders,
        lowStockItems: alertsResponse.data.data.active_alerts || 0,
      });

      setRecentAlerts(recentAlertsResponse.data.data.alerts || []);
      
      // Build chart data
      if (salesRes.data.success) {
        const allSales = Array.isArray(salesRes.data.data) ? salesRes.data.data : [];
        
        // Group sales by date for chart
        const dailyData = {};
        
        // Initialize all dates in range with zero values
        for (let d = dayjs(dateRange[0]); d.isBefore(dateRange[1]) || d.isSame(dateRange[1], 'day'); d = d.add(1, 'day')) {
          const dateKey = d.format('MMM D');
          dailyData[dateKey] = { date: dateKey, total_sales: 0, transactions: 0 };
        }
        
        // Aggregate sales data by date
        allSales.forEach(sale => {
          const saleDate = dayjs(sale.sale_date).format('MMM D');
          if (dailyData[saleDate]) {
            dailyData[saleDate].total_sales += parseFloat(sale.total_amount || 0);
            dailyData[saleDate].transactions += 1;
          }
        });
        
        // Convert to array
        const chartData = Object.values(dailyData);
        setDailyChartData(chartData);
      }
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      if (error.response?.status === 429) {
        message.error('Too many requests. Please wait a moment and try again.');
      } else {
        message.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRange = (rangeType) => {
    let newRange;
    const today = dayjs();
    
    switch(rangeType) {
      case 'today':
        newRange = [today, today];
        break;
      case 'yesterday':
        newRange = [today.subtract(1, 'day'), today.subtract(1, 'day')];
        break;
      case 'last7days':
        newRange = [today.subtract(7, 'day'), today];
        break;
      case 'last30days':
        newRange = [today.subtract(30, 'day'), today];
        break;
      case 'thisMonth':
        newRange = [today.startOf('month'), today];
        break;
      case 'lastMonth':
        const lastMonth = today.subtract(1, 'month');
        newRange = [lastMonth.startOf('month'), lastMonth.endOf('month')];
        break;
      default:
        newRange = [today.subtract(7, 'day'), today];
    }
    
    setDateRange(newRange);
  };

  const handleDownloadReport = (format) => {
    try {
      if (format === 'alerts') {
        const headers = ['Product', 'Current Stock', 'Reorder Level', 'Status'];
        const csvData = recentAlerts.map(alert => [
          alert.product_name,
          alert.current_stock,
          alert.reorder_level,
          (alert.reorder_level - alert.current_stock) > 10 ? 'Urgent' : 'Warning'
        ]);
        
        const csvContent = [
          headers.join(','),
          ...csvData.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `low-stock-alerts-${dayjs().format('YYYY-MM-DD')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        message.success('Alerts report downloaded successfully');
      } else if (format === 'summary') {
        const summaryData = [
          'ADMIN DASHBOARD SUMMARY',
          `Period: ${dateRange[0].format('YYYY-MM-DD')} to ${dateRange[1].format('YYYY-MM-DD')}`,
          '',
          'TODAY\'S METRICS:',
          `Total Sales: Rs. ${stats.today_sales.toFixed(2)}`,
          `Total Orders: ${stats.today_orders}`,
          `Average Order: Rs. ${stats.today_orders ? (stats.today_sales / stats.today_orders).toFixed(2) : '0.00'}`,
          '',
          'PERIOD METRICS:',
          `Total Sales: Rs. ${stats.range_sales.toFixed(2)}`,
          `Total Orders: ${stats.range_orders}`,
          `Average Order: Rs. ${stats.range_orders ? (stats.range_sales / stats.range_orders).toFixed(2) : '0.00'}`,
          '',
          'INVENTORY:',
          `Low Stock Alerts: ${stats.lowStockItems}`,
          '',
          'Generated on: ' + dayjs().format('YYYY-MM-DD HH:mm:ss')
        ].join('\n');
        
        const blob = new Blob([summaryData], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `admin-summary-${dayjs().format('YYYY-MM-DD')}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
        message.success('Summary report downloaded successfully');
      }
    } catch (error) {
      message.error('Failed to download report');
      console.error('Download error:', error);
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: '20px' }}>
        {/* Header with Quick Filters and Download */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            margin: 0,
            color: '#1a1a1a'
          }}>
            Admin Dashboard
          </h1>
          
          <Space wrap>
            <Button
              icon={<CalendarOutlined />}
              onClick={() => handleQuickRange('today')}
              style={{ borderRadius: '8px' }}
            >
              Today
            </Button>
            <Button
              icon={<CalendarOutlined />}
              onClick={() => handleQuickRange('yesterday')}
              style={{ borderRadius: '8px' }}
            >
              Yesterday
            </Button>
            <Button
              icon={<CalendarOutlined />}
              onClick={() => handleQuickRange('last7days')}
              style={{ borderRadius: '8px' }}
            >
              Last 7 Days
            </Button>
            <Button
              icon={<CalendarOutlined />}
              onClick={() => handleQuickRange('last30days')}
              style={{ borderRadius: '8px' }}
            >
              Last 30 Days
            </Button>
            <Button
              icon={<CalendarOutlined />}
              onClick={() => handleQuickRange('thisMonth')}
              style={{ borderRadius: '8px' }}
            >
              This Month
            </Button>
            
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'alerts',
                    label: 'Download Alerts CSV',
                    icon: <DownloadOutlined />,
                    onClick: () => handleDownloadReport('alerts')
                  },
                  {
                    key: 'summary',
                    label: 'Download Summary',
                    icon: <DownloadOutlined />,
                    onClick: () => handleDownloadReport('summary')
                  }
                ]
              }}
              placement="bottomRight"
            >
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                style={{ 
                  borderRadius: '8px',
                  background: '#dc2626',
                  borderColor: '#dc2626'
                }}
              >
                Download Report
              </Button>
            </Dropdown>
            
            <RangePicker
              value={dateRange}
              onChange={(dates) => dates && setDateRange(dates)}
              format="YYYY-MM-DD"
              size="large"
              style={{ borderRadius: '8px', border: '2px solid #fee2e2' }}
            />
          </Space>
        </div>

        {/* Stats Cards with Gradient */}
        <Row gutter={[20, 20]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{
                background: '#dc2626',
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3)',
                outline: 'none'
              }}
              styles={{ body: { padding: '24px' } }}
            >
              <div style={{ color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', opacity: 0.9 }}>Today's Sales</span>
                  <DollarOutlined style={{ fontSize: '24px', opacity: 0.9 }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                  Rs. {stats.today_sales.toFixed(2)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', opacity: 0.9 }}>
                  <span style={{ fontSize: '12px' }}>{stats.today_sales > 0 ? `${stats.today_orders} transactions` : 'No sales yet'}</span>
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{
                background: '#dc2626',
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3)',
                outline: 'none'
              }}
              styles={{ body: { padding: '24px' } }}
            >
              <div style={{ color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', opacity: 0.9 }}>Today's Orders</span>
                  <ShoppingCartOutlined style={{ fontSize: '24px', opacity: 0.9 }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {stats.today_orders}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', opacity: 0.9 }}>
                  <span style={{ fontSize: '12px' }}>Avg: Rs. {stats.today_orders ? (stats.today_sales / stats.today_orders).toFixed(2) : '0.00'}</span>
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{
                background: '#dc2626',
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3)',
                outline: 'none'
              }}
              styles={{ body: { padding: '24px' } }}
            >
              <div style={{ color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', opacity: 0.9 }}>Period Sales</span>
                  <DollarOutlined style={{ fontSize: '24px', opacity: 0.9 }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                  Rs. {stats.range_sales.toFixed(2)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', opacity: 0.9 }}>
                  <span style={{ fontSize: '12px' }}>{dateRange[0].format('MMM D')} - {dateRange[1].format('MMM D')}</span>
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{
                background: '#dc2626',
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3)',
                outline: 'none'
              }}
              styles={{ body: { padding: '24px' } }}
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
          

        </Row>

        {/* Charts Row */}
        <Row gutter={[20, 20]} className="mb-6">
          <Col xs={24} lg={16}>
            <Card 
              title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Sales Trend ({dateRange[0].format('MMM D')} - {dateRange[1].format('MMM D')})</span>}
              style={{ 
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                outline: 'none'
              }}
              styles={{ body: { outline: 'none' } }}
            >
              {dailyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#999" />
                    <YAxis stroke="#999" />
                    <RechartsTooltip 
                      contentStyle={{ 
                        background: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="total_sales" 
                      stroke="#dc2626" 
                      strokeWidth={3}
                      dot={{ fill: '#dc2626', r: 4 }}
                      name="Sales (Rs.)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="transactions" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', r: 3 }}
                      name="Transactions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                  No sales data available for this period
                </div>
              )}
            </Card>
          </Col>
          
          <Col xs={24} lg={8}>
            <Card 
              title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Sales by Channel</span>}
              style={{ 
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                outline: 'none'
              }}
              styles={{ body: { outline: 'none' } }}
            >
              {channelData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value) => `Rs. ${parseFloat(value).toFixed(2)}`}
                      contentStyle={{ 
                        background: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                  No channel data available
                </div>
              )}
              {channelData.length > 0 && (
                <div style={{ marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                  {channelData.map((channel, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ 
                          width: '12px', 
                          height: '12px', 
                          backgroundColor: channel.color, 
                          borderRadius: '50%', 
                          display: 'inline-block', 
                          marginRight: '8px' 
                        }}></span>
                        <span style={{ fontWeight: '500' }}>{channel.name}</span>
                      </span>
                      <span style={{ color: '#666', fontSize: '14px' }}>
                        {channel.transactions} transactions
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>

        </Row>



        {/* Recent Alerts Table */}
        <Card 
          title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Recent Low Stock Alerts</span>}
          style={{ 
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            outline: 'none'
          }}
          styles={{ body: { outline: 'none' } }}
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
