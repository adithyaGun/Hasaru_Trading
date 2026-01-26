import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table } from 'antd';
import { 
  DollarOutlined, 
  ShoppingCartOutlined, 
  WarningOutlined, 
  UserOutlined 
} from '@ant-design/icons';
import AdminLayout from '../../components/admin/AdminLayout';
import { reportsAPI, alertsAPI } from '../../api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    lowStockItems: 0,
    totalCustomers: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const alertColumns = [
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: 'Current Stock',
      dataIndex: 'current_stock',
      key: 'current_stock',
    },
    {
      title: 'Reorder Level',
      dataIndex: 'reorder_level',
      key: 'reorder_level',
    },
  ];

  return (
    <AdminLayout>
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Today's Sales"
              value={stats.totalSales}
              precision={2}
              prefix="Rs."
              valueStyle={{ color: '#3f8600' }}
              icon={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Low Stock Alerts"
              value={stats.lowStockItems}
              valueStyle={{ color: '#cf1322' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Customers"
              value={stats.totalCustomers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Recent Low Stock Alerts" className="mb-6">
        <Table
          columns={alertColumns}
          dataSource={recentAlerts}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboard;
