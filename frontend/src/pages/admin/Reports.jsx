import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Card, Row, Col, Statistic, Select, DatePicker,
  Table, Space, Button, Empty, message
} from 'antd';
import {
  ShoppingCartOutlined, DownloadOutlined, ReloadOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';
import api from '../../api/axios';

const { RangePicker } = DatePicker;
const { Option } = Select;

const COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#2563eb', '#7c3aed'];

// Compute explicit local date range from a period label.
// We always pass start_date / end_date as full datetime strings so the
// backend never has to guess timezone — it just uses BETWEEN.
const getPeriodDates = (period) => {
  const now = dayjs();
  switch (period) {
    case 'daily':
      return {
        start_date: now.startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        end_date:   now.endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      };
    case 'weekly':
      return {
        start_date: now.subtract(6, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        end_date:   now.endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      };
    case 'monthly':
      return {
        start_date: now.subtract(29, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        end_date:   now.endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      };
    case 'yearly':
      return {
        start_date: now.subtract(364, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        end_date:   now.endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      };
    default:
      return {
        start_date: now.subtract(29, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        end_date:   now.endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      };
  }
};

// Convert a period label to a [dayjs, dayjs] tuple for the picker
const periodToDayjsRange = (p) => {
  const now = dayjs();
  switch (p) {
    case 'daily':   return [now.startOf('day'), now.endOf('day')];
    case 'weekly':  return [now.subtract(6, 'day').startOf('day'), now.endOf('day')];
    case 'monthly': return [now.subtract(29, 'day').startOf('day'), now.endOf('day')];
    case 'yearly':  return [now.subtract(364, 'day').startOf('day'), now.endOf('day')];
    default:        return [now.subtract(29, 'day').startOf('day'), now.endOf('day')];
  }
};

const AdminReports = () => {
  const [loading, setLoading]           = useState(false);
  const [period, setPeriod]             = useState('monthly');
  const [customRange, setCustomRange]   = useState(null); // [dayjs, dayjs] | null
  const [stats, setStats]               = useState({ totalRevenue: 0, totalOrders: 0, onlineOrders: 0, posOrders: 0 });
  const [trendData, setTrendData]       = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topProducts, setTopProducts]   = useState([]);

  useEffect(() => {
    fetchAll();
  }, [period, customRange]);

  const buildParams = () => {
    if (customRange && customRange[0] && customRange[1]) {
      return {
        start_date: customRange[0].startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        end_date:   customRange[1].endOf('day').format('YYYY-MM-DD HH:mm:ss'),
        period: 'custom',
      };
    }
    return { ...getPeriodDates(period), period };
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = buildParams();

      const [salesRes, trendRes, catRes, topRes] = await Promise.all([
        api.get('/reports/sales',          { params }),
        api.get('/reports/sales/trend',    { params }),
        api.get('/reports/sales/category', { params }),
        api.get('/analytics/top-selling',  { params: { ...params, limit: 10 } }),
      ]);

      // ── Stats ──────────────────────────────────────────────────────────────
      const combined = salesRes.data?.data?.combined    || {};
      const online   = salesRes.data?.data?.online_sales || {};
      const pos      = salesRes.data?.data?.pos_sales    || {};

      setStats({
        totalRevenue: parseFloat(combined.total_sales   || 0),
        totalOrders:  parseInt(combined.total_orders    || 0),
        onlineOrders: parseInt(online.order_count       || 0),
        posOrders:    parseInt(pos.transaction_count    || 0),
      });

      // ── Sales Trend ────────────────────────────────────────────────────────
      // Backend groups by DATE + channel, so we merge channels per day here.
      const dailyRaw = trendRes.data?.data?.daily_sales || [];
      const grouped  = {};
      dailyRaw.forEach((row) => {
        // row.date may be a JS Date object (mysql2 returns Date for DATE columns)
        // or a string like "2026-03-05T00:00:00.000Z"
        let dateStr;
        if (row.date instanceof Date) {
          // Use local date parts to avoid UTC offset shift
          const y = row.date.getFullYear();
          const m = String(row.date.getMonth() + 1).padStart(2, '0');
          const d = String(row.date.getDate()).padStart(2, '0');
          dateStr = `${y}-${m}-${d}`;
        } else {
          dateStr = String(row.date).slice(0, 10);
        }
        const [y, m, d] = dateStr.split('-').map(Number);
        const label = new Date(y, m - 1, d)
          .toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        if (!grouped[label]) grouped[label] = { date: label, revenue: 0, orders: 0 };
        grouped[label].revenue += parseFloat(row.daily_total      || 0);
        grouped[label].orders  += parseInt(row.transaction_count  || 0);
      });
      setTrendData(Object.values(grouped));

      // ── Category pie ────────────────────────────────────────────────────────
      const cats = catRes.data?.data?.categories || [];
      setCategoryData(cats.map((c) => ({
        name:  c.category || 'Unknown',
        value: parseFloat(c.total_revenue || 0),
      })));

      // ── Top Products ────────────────────────────────────────────────────────
      const prods = topRes.data?.data?.top_selling_products || [];
      setTopProducts(prods.map((p) => ({
        key:        p.product_id,
        name:       p.product_name,
        category:   p.category || 'N/A',
        brand:      p.brand    || '-',
        units_sold: parseInt(p.total_quantity_sold || 0),
        revenue:    parseFloat(p.total_revenue     || 0),
      })));

    } catch (err) {
      console.error('Report fetch error:', err);
      message.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  // ── CSV Export ───────────────────────────────────────────────────────────
  const handleExport = () => {
    if (!trendData.length && !categoryData.length && !topProducts.length) {
      message.warning('No data to export for this period');
      return;
    }

    const activeRange = customRange ?? periodToDayjsRange(period);
    const from = activeRange[0].format('YYYY-MM-DD');
    const to   = activeRange[1].format('YYYY-MM-DD');

    const rows = [];

    // Summary
    rows.push(['Hasaru Trading — Sales Report']);
    rows.push([`Period: ${from} to ${to}`]);
    rows.push([]);
    rows.push(['SUMMARY']);
    rows.push(['Total Revenue', `Rs. ${stats.totalRevenue.toFixed(2)}`]);
    rows.push(['Total Orders',  stats.totalOrders]);
    rows.push(['Online Orders', stats.onlineOrders]);
    rows.push(['POS Orders',    stats.posOrders]);
    rows.push([]);

    // Daily Trend
    if (trendData.length) {
      rows.push(['DAILY SALES TREND']);
      rows.push(['Date', 'Revenue (Rs.)', 'Orders']);
      trendData.forEach((r) => rows.push([r.date, r.revenue.toFixed(2), r.orders]));
      rows.push([]);
    }

    // Category breakdown
    if (categoryData.length) {
      rows.push(['SALES BY CATEGORY']);
      rows.push(['Category', 'Revenue (Rs.)']);
      categoryData.forEach((c) => rows.push([c.name, c.value.toFixed(2)]));
      rows.push([]);
    }

    // Top products
    if (topProducts.length) {
      rows.push(['TOP SELLING PRODUCTS']);
      rows.push(['#', 'Product', 'Category', 'Brand', 'Units Sold', 'Revenue (Rs.)']);
      topProducts.forEach((p, i) =>
        rows.push([i + 1, p.name, p.category, p.brand, p.units_sold, p.revenue.toFixed(2)])
      );
    }

    const csv  = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `sales-report-${from}-to-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('Report exported successfully');
  };

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns = [
    { title: '#',          key: 'rank',       width: 55, render: (_, __, i) => i + 1 },
    { title: 'Product',    dataIndex: 'name',       key: 'name' },
    { title: 'Category',   dataIndex: 'category',   key: 'category' },
    { title: 'Brand',      dataIndex: 'brand',      key: 'brand' },
    {
      title: 'Units Sold', dataIndex: 'units_sold', key: 'units_sold',
      render: (v) => v.toLocaleString(),
    },
    {
      title: 'Revenue', dataIndex: 'revenue', key: 'revenue',
      render: (v) => `Rs. ${parseFloat(v).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    },
  ];

  const EmptyChart = () => (
    <div className="flex items-center justify-center h-[300px]">
      <Empty description="No data for this period" image={Empty.PRESENTED_IMAGE_SIMPLE} />
    </div>
  );

  const fmtRevenue = (v) => `Rs. ${parseFloat(v).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <AdminLayout>
      <div className="mb-6">

        {/* ── Toolbar ──────────────────────────────────────────────────────── */}
        <Row className="mb-6">
          <Col>
            <Space wrap>
              <Select
                style={{ width: 140 }}
                value={customRange ? 'custom' : period}
                onChange={(val) => { setPeriod(val); setCustomRange(null); }}
              >
                <Option value="daily">Today</Option>
                <Option value="weekly">Last 7 Days</Option>
                <Option value="monthly">Last 30 Days</Option>
                <Option value="yearly">Last Year</Option>
                {customRange && <Option value="custom">Custom</Option>}
              </Select>

              <RangePicker
                value={customRange ?? periodToDayjsRange(period)}
                onChange={(val) => {
                  if (!val) {
                    setCustomRange(null); // revert to period-driven range
                  } else {
                    setCustomRange(val);
                  }
                }}
                allowClear
              />

              <Button icon={<ReloadOutlined />} onClick={fetchAll} loading={loading}>
                Refresh
              </Button>
              <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport} style={{ backgroundColor: '#dc2626' }}>
                Export
              </Button>
            </Space>
          </Col>
        </Row>

        {/* ── Key Metrics ───────────────────────────────────────────────────── */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Revenue"
                value={stats.totalRevenue}
                precision={2}
                prefix="Rs."
                valueStyle={{ color: '#dc2626' }}
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
                title="Online Orders"
                value={stats.onlineOrders}
                valueStyle={{ color: '#16a34a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="POS Orders"
                value={stats.posOrders}
                valueStyle={{ color: '#ea580c' }}
              />
            </Card>
          </Col>
        </Row>

        {/* ── Charts ───────────────────────────────────────────────────────── */}
        <Row gutter={16} className="mb-6">
          {/* Sales Trend */}
          <Col xs={24} lg={16}>
            <Card title="Sales Trend" loading={loading}>
              {!loading && trendData.length === 0
                ? <EmptyChart />
                : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="left"  tickFormatter={(v) => `Rs.${(v / 1000).toFixed(0)}k`} />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip
                        formatter={(val, name) =>
                          name === 'Revenue' ? fmtRevenue(val) : val
                        }
                      />
                      <Legend />
                      <Line
                        yAxisId="left" type="monotone" dataKey="revenue"
                        stroke="#dc2626" strokeWidth={2} name="Revenue" dot={{ r: 3 }}
                      />
                      <Line
                        yAxisId="right" type="monotone" dataKey="orders"
                        stroke="#2563eb" strokeWidth={2} name="Orders" dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )
              }
            </Card>
          </Col>

          {/* Category Pie */}
          <Col xs={24} lg={8}>
            <Card title="Sales by Category" loading={loading}>
              {!loading && categoryData.length === 0
                ? <EmptyChart />
                : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%" cy="50%" outerRadius={90}
                        dataKey="value"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {categoryData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => fmtRevenue(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                )
              }
            </Card>
          </Col>
        </Row>

        {/* Top 5 Bar Chart */}
        <Row gutter={16} className="mb-6">
          <Col xs={24}>
            <Card title="Top 5 Products by Revenue" loading={loading}>
              {!loading && topProducts.length === 0
                ? <EmptyChart />
                : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={topProducts.slice(0, 5)}
                      margin={{ bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(val, name) =>
                          name === 'Revenue (Rs.)' ? fmtRevenue(val) : val
                        }
                      />
                      <Legend />
                      <Bar dataKey="units_sold" fill="#2563eb" name="Units Sold" />
                      <Bar dataKey="revenue"    fill="#dc2626" name="Revenue (Rs.)" />
                    </BarChart>
                  </ResponsiveContainer>
                )
              }
            </Card>
          </Col>
        </Row>

        {/* Top 10 Table */}
        <Row gutter={16}>
          <Col xs={24}>
            <Card title="Top 10 Best-Selling Products" loading={loading}>
              <Table
                columns={columns}
                dataSource={topProducts}
                rowKey="key"
                pagination={false}
                locale={{
                  emptyText: (
                    <Empty
                      description="No sales data for this period"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ),
                }}
              />
            </Card>
          </Col>
        </Row>

      </div>
    </AdminLayout>
  );
};

export default AdminReports;
