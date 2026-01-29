import { useState, useEffect } from 'react';
import SalesLayout from '../../components/sales/SalesLayout';
import { Card, Row, Col, Statistic, Table, Tag, DatePicker, Progress, Avatar, Button, Space, Dropdown, message } from 'antd';
import { DollarOutlined, ShoppingCartOutlined, RiseOutlined, ClockCircleOutlined, TrophyOutlined, FireOutlined, DownloadOutlined, CalendarOutlined } from '@ant-design/icons';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../api/axios';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const SalesDashboard = () => {
  const [stats, setStats] = useState({
    today_sales: 0,
    today_transactions: 0,
    range_sales: 0,
    range_transactions: 0
  });
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);
  const [dailyChartData, setDailyChartData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch TODAY's sales summary for cards and goals
      const todayRes = await api.get('/sales/summary', {
        params: {
          start_date: dayjs().format('YYYY-MM-DD'),
          end_date: dayjs().format('YYYY-MM-DD')
        }
      });
      
      let todayStats = { today_sales: 0, today_transactions: 0 };
      if (todayRes.data.success) {
        const todayData = todayRes.data.data || [];
        const aggregated = todayData.reduce((acc, channel) => {
          acc.today_sales += parseFloat(channel.total_sales || 0);
          acc.today_transactions += parseInt(channel.transaction_count || 0);
          return acc;
        }, { today_sales: 0, today_transactions: 0 });
        todayStats = aggregated;
      }

      // Fetch DATE RANGE sales summary for cards
      const summaryRes = await api.get('/sales/summary', {
        params: {
          start_date: dateRange[0].format('YYYY-MM-DD'),
          end_date: dateRange[1].format('YYYY-MM-DD')
        }
      });
      
      let rangeStats = { range_sales: 0, range_transactions: 0 };
      if (summaryRes.data.success) {
        const summaryData = summaryRes.data.data || [];
        const aggregated = summaryData.reduce((acc, channel) => {
          acc.range_sales += parseFloat(channel.total_sales || 0);
          acc.range_transactions += parseInt(channel.transaction_count || 0);
          return acc;
        }, { range_sales: 0, range_transactions: 0 });
        rangeStats = aggregated;
      }

      setStats({
        ...todayStats,
        ...rangeStats
      });

      // Fetch all sales for date range to build chart
      const salesRes = await api.get('/sales', {
        params: {
          start_date: dateRange[0].format('YYYY-MM-DD'),
          end_date: dateRange[1].format('YYYY-MM-DD')
        }
      });
      
      if (salesRes.data.success) {
        // API returns data as array directly in data field
        const allSales = Array.isArray(salesRes.data.data) ? salesRes.data.data : [];
        
        // Get recent 10 sales for table
        setRecentSales(allSales.slice(0, 10));
        
        // Group sales by date for chart
        const dailyData = {};
        
        // Initialize all dates in range with zero values
        for (let d = dayjs(dateRange[0]); d.isBefore(dateRange[1]) || d.isSame(dateRange[1], 'day'); d = d.add(1, 'day')) {
          const dateKey = d.format('MMM D');
          dailyData[dateKey] = { date: dateKey, sales: 0, transactions: 0 };
        }
        
        // Aggregate sales data by date
        allSales.forEach(sale => {
          const saleDate = dayjs(sale.sale_date).format('MMM D');
          if (dailyData[saleDate]) {
            dailyData[saleDate].sales += parseFloat(sale.total_amount || 0);
            dailyData[saleDate].transactions += 1;
          }
        });
        
        // Convert to array and sort by date
        const chartData = Object.values(dailyData);
        setDailyChartData(chartData);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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
      if (format === 'csv') {
        // Generate CSV
        const headers = ['Sale ID', 'Date', 'Channel', 'Customer', 'Amount', 'Payment', 'Status'];
        const csvData = recentSales.map(sale => [
          sale.id,
          dayjs(sale.sale_date).format('YYYY-MM-DD HH:mm'),
          sale.channel,
          sale.customer_name || 'Walk-in',
          sale.total_amount,
          sale.payment_method,
          sale.status
        ]);
        
        const csvContent = [
          headers.join(','),
          ...csvData.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-report-${dateRange[0].format('YYYY-MM-DD')}-to-${dateRange[1].format('YYYY-MM-DD')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        message.success('CSV report downloaded successfully');
      } else if (format === 'summary') {
        // Generate summary report
        const summaryData = [
          'SALES SUMMARY REPORT',
          `Period: ${dateRange[0].format('YYYY-MM-DD')} to ${dateRange[1].format('YYYY-MM-DD')}`,
          '',
          'TODAY\'S PERFORMANCE:',
          `Total Sales: Rs. ${stats.today_sales.toFixed(2)}`,
          `Transactions: ${stats.today_transactions}`,
          `Average Sale: Rs. ${stats.today_transactions ? (stats.today_sales / stats.today_transactions).toFixed(2) : '0.00'}`,
          '',
          'PERIOD PERFORMANCE:',
          `Total Sales: Rs. ${stats.range_sales.toFixed(2)}`,
          `Total Transactions: ${stats.range_transactions}`,
          `Average Sale: Rs. ${stats.range_transactions ? (stats.range_sales / stats.range_transactions).toFixed(2) : '0.00'}`,
          '',
          'Generated on: ' + dayjs().format('YYYY-MM-DD HH:mm:ss')
        ].join('\n');
        
        const blob = new Blob([summaryData], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-summary-${dayjs().format('YYYY-MM-DD')}.txt`;
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
    <SalesLayout>
      <div style={{ padding: '20px', background: '#f5f7fa', marginLeft: '-24px', marginRight: '-24px', marginTop: '-24px', minHeight: 'calc(100vh - 64px)' }}>
        {/* Header with Date Picker and Quick Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
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
          </Space>
          
          <Space>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'csv',
                    label: 'Download CSV',
                    icon: <DownloadOutlined />,
                    onClick: () => handleDownloadReport('csv')
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
              onChange={(dates) => setDateRange(dates)}
              format="YYYY-MM-DD"
              size="large"
              style={{ borderRadius: '8px', border: '2px solid #fee2e2' }}
            />
          </Space>
        </div>

        {/* Statistics Cards with Gradient */}
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
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', opacity: 0.9 }}>Today's Sales</span>
                  <DollarOutlined style={{ fontSize: '24px', opacity: 0.9 }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                  Rs. {(stats.today_sales || 0).toFixed(2)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', opacity: 0.9 }}>
                  <RiseOutlined style={{ marginRight: '4px' }} />
                  <span style={{ fontSize: '12px' }}>{stats.today_sales > 0 ? 'Active' : 'No sales yet'}</span>
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
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', opacity: 0.9 }}>Today's Transactions</span>
                  <ShoppingCartOutlined style={{ fontSize: '24px', opacity: 0.9 }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {stats.today_transactions || 0}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', opacity: 0.9 }}>
                  <span style={{ fontSize: '12px' }}>Avg: Rs. {stats.today_transactions ? (stats.today_sales / stats.today_transactions).toFixed(2) : '0.00'}</span>
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
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', opacity: 0.9 }}>Period Sales</span>
                  <RiseOutlined style={{ fontSize: '24px', opacity: 0.9 }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                  Rs. {(stats.range_sales || 0).toFixed(2)}
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
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', opacity: 0.9 }}>Period Transactions</span>
                  <ClockCircleOutlined style={{ fontSize: '24px', opacity: 0.9 }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {stats.range_transactions || 0}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', opacity: 0.9 }}>
                  <span style={{ fontSize: '12px' }}>{dateRange[0].format('MMM D')} - {dateRange[1].format('MMM D')}</span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Charts Row */}
        <Row gutter={[20, 20]} className="mb-6">
          <Col xs={24} lg={16}>
            <Card 
              title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Sales Activity (Last 7 Days)</span>}
              style={{ 
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                outline: 'none'
              }}
              styles={{ body: { outline: 'none' } }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#999" />
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
                    name="Sales (Rs.)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="transactions" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Transactions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          
          <Col xs={24} lg={8}>
            <Card 
              title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Today's Goals</span>}
              style={{ 
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                height: '100%',
                outline: 'none'
              }}
              styles={{ body: { outline: 'none' } }}
            >
              <div style={{ padding: '12px 0' }}>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '500' }}>Sales Target</span>
                    <span style={{ color: '#dc2626', fontWeight: 'bold' }}>
                      {Math.min(100, ((stats.today_sales || 0) / 50000 * 100)).toFixed(0)}%
                    </span>
                  </div>
                  <Progress 
                    percent={Math.min(100, ((stats.today_sales || 0) / 50000 * 100))}
                    strokeColor="#dc2626"
                  />
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
                    Rs. {(stats.today_sales || 0).toFixed(2)} / Rs. 50,000
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '500' }}>Transactions Target</span>
                    <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
                      {Math.min(100, ((stats.today_transactions || 0) / 50 * 100)).toFixed(0)}%
                    </span>
                  </div>
                  <Progress 
                    percent={Math.min(100, ((stats.today_transactions || 0) / 50 * 100))}
                    strokeColor="#ef4444"
                  />
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
                    {stats.today_transactions || 0} / 50 transactions
                  </div>
                </div>

                <div style={{
                  padding: '16px',
                  background: '#fef2f2',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <TrophyOutlined style={{ fontSize: '32px', color: '#dc2626', marginBottom: '8px' }} />
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {stats.today_sales >= 50000 ? 'Target Achieved!' : 'Keep going! You\'re doing great!'}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Recent Sales Table */}
        <Card 
          title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Recent Sales</span>}
          loading={loading}
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
                title: 'Sale ID',
                dataIndex: 'id',
                key: 'id',
                render: (id) => (
                  <Tag color="red" style={{ fontWeight: 'bold' }}>#{id}</Tag>
                )
              },
              {
                title: 'Channel',
                dataIndex: 'channel',
                key: 'channel',
                render: (channel) => (
                  <Tag 
                    color={channel === 'pos' ? 'blue' : 'green'}
                    style={{ fontWeight: '500' }}
                  >
                    {channel.toUpperCase()}
                  </Tag>
                )
              },
              {
                title: 'Customer',
                dataIndex: 'customer_name',
                key: 'customer_name',
                render: (name) => (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      style={{ 
                        background: '#dc2626',
                        marginRight: '8px'
                      }}
                      size="small"
                    >
                      {(name || 'W')[0].toUpperCase()}
                    </Avatar>
                    <span style={{ fontWeight: '500' }}>{name || 'Walk-in'}</span>
                  </div>
                )
              },
              {
                title: 'Amount',
                dataIndex: 'total_amount',
                key: 'total_amount',
                render: (amount) => (
                  <span style={{ 
                    fontWeight: 'bold',
                    fontSize: '15px',
                    color: '#dc2626'
                  }}>
                    Rs. {parseFloat(amount).toFixed(2)}
                  </span>
                )
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status) => (
                  <Tag 
                    color={status === 'completed' ? 'success' : status === 'reserved' ? 'warning' : 'default'}
                    style={{ fontWeight: '500' }}
                  >
                    {status.toUpperCase()}
                  </Tag>
                )
              },
              {
                title: 'Date',
                dataIndex: 'sale_date',
                key: 'sale_date',
                render: (date) => (
                  <span style={{ color: '#666' }}>
                    {dayjs(date).format('MMM DD, YYYY hh:mm A')}
                  </span>
                )
              }
            ]}
            dataSource={recentSales}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
          />
        </Card>
      </div>
    </SalesLayout>
  );
};

export default SalesDashboard;
