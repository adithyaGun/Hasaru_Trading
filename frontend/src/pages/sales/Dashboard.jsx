import { useState, useEffect } from 'react';
import SalesLayout from '../../components/sales/SalesLayout';
import { Card, Row, Col, Statistic, Table, Tag, DatePicker, Progress, Avatar } from 'antd';
import { DollarOutlined, ShoppingCartOutlined, RiseOutlined, ClockCircleOutlined, TrophyOutlined, FireOutlined } from '@ant-design/icons';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../api/axios';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const SalesDashboard = () => {
  const [stats, setStats] = useState({
    today_sales: 0,
    today_transactions: 0,
    weekly_sales: 0,
    monthly_sales: 0
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
      // Fetch sales summary
      const summaryRes = await api.get('/sales/summary', {
        params: {
          start_date: dateRange[0].format('YYYY-MM-DD'),
          end_date: dateRange[1].format('YYYY-MM-DD')
        }
      });
      
      if (summaryRes.data.success) {
        setStats(summaryRes.data.data);
      }

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

  return (
    <SalesLayout>
      <div style={{ padding: '20px', background: '#f5f7fa', marginLeft: '-24px', marginRight: '-24px', marginTop: '-24px', minHeight: 'calc(100vh - 64px)' }}>
        {/* Date Picker */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            format="YYYY-MM-DD"
            size="large"
            style={{ borderRadius: '8px', border: '2px solid #fee2e2' }}
          />
        </div>

        {/* Statistics Cards with Gradient */}
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
                background: '#ef4444',
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
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
                background: '#f87171',
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(248, 113, 113, 0.3)'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', opacity: 0.9 }}>Weekly Sales</span>
                  <RiseOutlined style={{ fontSize: '24px', opacity: 0.9 }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                  Rs. {(stats.weekly_sales || 0).toFixed(2)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', opacity: 0.9 }}>
                  <span style={{ fontSize: '12px' }}>Last 7 days</span>
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
                  <span style={{ fontSize: '14px', opacity: 0.9 }}>Monthly Sales</span>
                  <ClockCircleOutlined style={{ fontSize: '24px', opacity: 0.9 }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                  Rs. {(stats.monthly_sales || 0).toFixed(2)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', opacity: 0.9 }}>
                  <span style={{ fontSize: '12px' }}>This month</span>
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
                border: '1px solid #fee2e2',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyChartData}>
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
                border: '1px solid #fee2e2',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                height: '100%'
              }}
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
            border: '1px solid #fee2e2',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}
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
