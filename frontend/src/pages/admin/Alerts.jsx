import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, Table, Tag, Button, Space, Statistic, Row, Col, message, Modal } from 'antd';
import {
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  BellOutlined
} from '@ant-design/icons';
import { alertsAPI } from '../../api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const AdminAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total_alerts: 0,
    critical_alerts: 0,
    active_alerts: 0,
    acknowledged_alerts: 0
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    fetchAlerts();
    fetchStats();
  }, [pagination.current]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await alertsAPI.getAll({
        page: pagination.current,
        limit: pagination.pageSize
      });
      
      const data = response.data.data || {};
      setAlerts(data.alerts || []);
      setPagination(prev => ({
        ...prev,
        total: data.total || 0
      }));
    } catch (error) {
      console.error('Error fetching alerts:', error);
      message.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await alertsAPI.getStatistics();
      setStats(response.data.data || {
        total_alerts: 0,
        critical_alerts: 0,
        active_alerts: 0,
        acknowledged_alerts: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAcknowledge = (id) => {
    Modal.confirm({
      title: 'Acknowledge Alert',
      content: 'Mark this alert as acknowledged?',
      okText: 'Yes',
      okButtonProps: { style: { backgroundColor: '#dc2626', borderColor: '#dc2626' } },
      onOk: async () => {
        try {
          await alertsAPI.acknowledge(id);
          message.success('Alert acknowledged successfully');
          fetchAlerts();
          fetchStats();
        } catch (error) {
          console.error('Error acknowledging alert:', error);
          message.error('Failed to acknowledge alert');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (text) => <span style={{ fontWeight: '500' }}>{text}</span>,
      width: '25%'
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: '12%'
    },
    {
      title: 'Current Stock',
      dataIndex: 'current_stock',
      key: 'current_stock',
      render: (stock) => (
        <Tag color={stock < 5 ? 'red' : stock < 15 ? 'orange' : 'green'}>
          {stock} units
        </Tag>
      ),
      sorter: (a, b) => a.current_stock - b.current_stock,
      width: '12%'
    },
    {
      title: 'Reorder Level',
      dataIndex: 'reorder_level',
      key: 'reorder_level',
      width: '12%'
    },
    {
      title: 'Priority',
      key: 'priority',
      render: (_, record) => {
        const diff = record.reorder_level - record.current_stock;
        if (diff >= 15) return <Tag color="red">CRITICAL</Tag>;
        if (diff >= 5) return <Tag color="orange">HIGH</Tag>;
        return <Tag color="yellow">MEDIUM</Tag>;
      },
      sorter: (a, b) => (b.reorder_level - b.current_stock) - (a.reorder_level - a.current_stock),
      width: '10%'
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).fromNow(),
      width: '12%'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'red' : 'gray'}>
          {status?.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Acknowledged', value: 'acknowledged' }
      ],
      onFilter: (value, record) => record.status === value,
      width: '12%'
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        record.status === 'active' ? (
          <Button 
            type="primary" 
            size="small"
            onClick={() => handleAcknowledge(record.id)}
            style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
          >
            Acknowledge
          </Button>
        ) : (
          <Tag color="green">Acknowledged</Tag>
        )
      ),
      width: '12%'
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        {/* Header */}
        <Row justify="space-between" align="middle" className="mb-6">
          <Col>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              <BellOutlined style={{ marginRight: '8px', color: '#dc2626' }} />
              Stock Alerts Management
            </h2>
            <p style={{ margin: '4px 0 0', color: '#666' }}>
              Monitor and manage low stock alerts
            </p>
          </Col>
          <Col>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => {
                fetchAlerts();
                fetchStats();
              }} 
              loading={loading}
            >
              Refresh
            </Button>
          </Col>
        </Row>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: '12px' }}>
              <Statistic
                title="Total Alerts"
                value={stats.total_alerts}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#2563eb' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: '12px' }}>
              <Statistic
                title="Critical Alerts"
                value={stats.critical_alerts}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#dc2626' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: '12px' }}>
              <Statistic
                title="Active Alerts"
                value={stats.active_alerts}
                prefix={<BellOutlined />}
                valueStyle={{ color: '#ea580c' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: '12px' }}>
              <Statistic
                title="Acknowledged"
                value={stats.acknowledged_alerts}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#16a34a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Alerts Table */}
        <Card 
          title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Low Stock Alerts</span>}
          style={{ borderRadius: '16px' }}
        >
          <Table
            columns={columns}
            dataSource={alerts}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              onChange: (page) => setPagination(prev => ({ ...prev, current: page })),
              showTotal: (total) => `Total ${total} alerts`,
              showSizeChanger: false
            }}
            rowClassName={(record) => 
              record.status === 'active' && (record.reorder_level - record.current_stock) >= 15 
                ? 'critical-row' 
                : ''
            }
          />
        </Card>
      </div>
      
      <style>{`
        .critical-row {
          background-color: #fef2f2;
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminAlerts;

