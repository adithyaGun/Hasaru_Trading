import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Input, 
  Select, 
  DatePicker, 
  Modal, 
  Descriptions,
  message,
  Row,
  Col,
  Statistic,
  Divider
} from 'antd';
import {
  EyeOutlined,
  PrinterOutlined,
  SearchOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  DollarOutlined
} from '@ant-design/icons';
import api from '../../api/axios';
import ReceiptPrint from '../../components/pos/ReceiptPrint';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminPOSSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    channel: 'pos', // Filter to POS only
    status: '',
    payment_status: '',
    start_date: '',
    end_date: ''
  });
  const [stats, setStats] = useState({
    total_sales: 0,
    total_transactions: 0,
    avg_transaction: 0
  });

  useEffect(() => {
    fetchSales();
  }, [filters]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await api.get(`/sales?${params.toString()}`);
      const salesData = response.data?.data || [];
      setSales(salesData);

      // Calculate stats
      const total = salesData.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);
      const count = salesData.length;
      const avg = count > 0 ? total / count : 0;

      setStats({
        total_sales: total,
        total_transactions: count,
        avg_transaction: avg
      });
    } catch (error) {
      message.error('Failed to load POS sales');
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (saleId) => {
    try {
      const response = await api.get(`/sales/${saleId}`);
      setSelectedSale(response.data?.data);
      setDetailsModalVisible(true);
    } catch (error) {
      message.error('Failed to load sale details');
      console.error('Error fetching sale details:', error);
    }
  };

  const handlePrintReceipt = async (saleId) => {
    try {
      const response = await api.get(`/sales/${saleId}`);
      const saleData = response.data?.data;
      
      if (!saleData) {
        throw new Error('No sale data found');
      }
      
      const items = Array.isArray(saleData.items) ? saleData.items : [];
      
      setSelectedSale({
        sale_id: saleData.id,
        customer_name: saleData.customer_name || 'Walk-in Customer',
        customer_phone: saleData.customer_phone,
        payment_method: saleData.payment_method,
        items: items.map(item => ({
          name: item.product_name,
          sku: item.product_sku || item.sku,
          quantity: item.quantity,
          price: parseFloat(item.unit_price || item.price || 0)
        })),
        subtotal: parseFloat(saleData.subtotal || 0),
        discount: parseFloat(saleData.discount || 0),
        total: parseFloat(saleData.total_amount || 0),
        sale_date: dayjs(saleData.sale_date).format('YYYY-MM-DD HH:mm:ss')
      });
      
      setTimeout(() => {
        setReceiptModalVisible(true);
      }, 100);
    } catch (error) {
      message.error('Failed to load receipt: ' + (error.message || 'Unknown error'));
      console.error('Error fetching receipt:', error);
    }
  };

  const handleDateRangeChange = (dates) => {
    if (dates) {
      setFilters({
        ...filters,
        start_date: dates[0].format('YYYY-MM-DD'),
        end_date: dates[1].format('YYYY-MM-DD')
      });
    } else {
      setFilters({
        ...filters,
        start_date: '',
        end_date: ''
      });
    }
  };

  const columns = [
    {
      title: 'Sale ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id) => `#${id}`
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
      width: 150,
      render: (name) => name || 'Walk-in'
    },
    {
      title: 'Date',
      dataIndex: 'sale_date',
      key: 'sale_date',
      width: 160,
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: 'Items',
      dataIndex: 'item_count',
      key: 'item_count',
      width: 70,
      align: 'center'
    },
    {
      title: 'Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 120,
      render: (amount) => (
        <span style={{ fontWeight: 'bold', color: '#dc2626' }}>
          Rs. {parseFloat(amount).toFixed(2)}
        </span>
      )
    },
    {
      title: 'Payment',
      dataIndex: 'payment_status',
      key: 'payment_status',
      width: 100,
      render: (status) => (
        <Tag color={
          status === 'completed' ? 'green' :
          status === 'pending' ? 'orange' : 'red'
        }>
          {status?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const displayStatus = (!status || status === 'reserved') ? 'PENDING' : status.toUpperCase();
        return (
          <Tag color={
            status === 'completed' ? 'success' :
            (!status || status === 'reserved') ? 'processing' :
            status === 'returned' ? 'warning' : 'default'
          }>
            {displayStatus}
          </Tag>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record.id)}
          >
            View
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={<PrinterOutlined />}
            onClick={() => handlePrintReceipt(record.id)}
          >
            Print
          </Button>
        </Space>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        {/* Statistics Cards */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Sales"
                value={stats.total_sales}
                precision={2}
                prefix="Rs."
                valueStyle={{ color: '#dc2626' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Transactions"
                value={stats.total_transactions}
                valueStyle={{ color: '#2563eb' }}
                suffix={<ShopOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Avg Transaction"
                value={stats.avg_transaction}
                precision={2}
                prefix="Rs."
                valueStyle={{ color: '#16a34a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="mb-4">
          <Space wrap>
            <RangePicker 
              onChange={handleDateRangeChange}
              format="YYYY-MM-DD"
            />
            <Select
              placeholder="Payment Status"
              style={{ width: 150 }}
              value={filters.payment_status || undefined}
              onChange={(value) => setFilters({ ...filters, payment_status: value })}
              allowClear
            >
              <Option value="completed">Completed</Option>
              <Option value="pending">Pending</Option>
              <Option value="failed">Failed</Option>
            </Select>
            <Select
              placeholder="Status"
              style={{ width: 130 }}
              value={filters.status || undefined}
              onChange={(value) => setFilters({ ...filters, status: value })}
              allowClear
            >
              <Option value="completed">Completed</Option>
              <Option value="reserved">Reserved</Option>
              <Option value="returned">Returned</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchSales}
            >
              Refresh
            </Button>
          </Space>
        </Card>

        {/* Sales Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={sales}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1100 }}
            size="small"
            pagination={{
              pageSize: 15,
              showTotal: (total) => `Total ${total} sales`,
              showSizeChanger: true,
              pageSizeOptions: ['10', '15', '20', '50']
            }}
          />
        </Card>
      </div>

      {/* Sale Details Modal */}
      <Modal
        title={`Sale Details - #${selectedSale?.id}`}
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>,
          <Button 
            key="print" 
            type="primary" 
            icon={<PrinterOutlined />}
            onClick={() => {
              setDetailsModalVisible(false);
              handlePrintReceipt(selectedSale?.id);
            }}
            style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
          >
            Print Receipt
          </Button>
        ]}
        width={700}
      >
        {selectedSale && (
          <>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Channel">
                <Tag color="blue">POS</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {dayjs(selectedSale.sale_date).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                {selectedSale.customer_name || 'Walk-in Customer'}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {selectedSale.customer_phone || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {selectedSale.payment_method || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Status">
                <Tag color={selectedSale.payment_status === 'completed' ? 'green' : 'orange'}>
                  {selectedSale.payment_status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status" span={2}>
                <Tag color={
                  selectedSale.status === 'completed' ? 'success' :
                  (!selectedSale.status || selectedSale.status === 'reserved') ? 'processing' : 'default'
                }>
                  {(!selectedSale.status || selectedSale.status === 'reserved') ? 'PENDING' : selectedSale.status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider>Items</Divider>

            <Table
              dataSource={selectedSale.items}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Product',
                  dataIndex: 'product_name',
                  key: 'product_name',
                  render: (name, record) => (
                    <div>
                      <div>{name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        SKU: {record.product_sku}
                        {record.batch_number && ` | Batch: ${record.batch_number}`}
                      </div>
                    </div>
                  )
                },
                {
                  title: 'Qty',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  width: 60,
                  align: 'center'
                },
                {
                  title: 'Price',
                  dataIndex: 'unit_price',
                  key: 'unit_price',
                  width: 100,
                  render: (price) => `Rs. ${parseFloat(price).toFixed(2)}`
                },
                {
                  title: 'Total',
                  dataIndex: 'subtotal',
                  key: 'subtotal',
                  width: 120,
                  render: (subtotal) => (
                    <strong>Rs. {parseFloat(subtotal).toFixed(2)}</strong>
                  )
                }
              ]}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3} align="right">
                      <strong>Subtotal:</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <strong>Rs. {parseFloat(selectedSale.subtotal).toFixed(2)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  {selectedSale.discount > 0 && (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3} align="right">
                        <strong>Discount:</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong style={{ color: '#dc2626' }}>
                          - Rs. {parseFloat(selectedSale.discount).toFixed(2)}
                        </strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3} align="right">
                      <strong style={{ fontSize: '16px' }}>TOTAL:</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <strong style={{ fontSize: '16px', color: '#dc2626' }}>
                        Rs. {parseFloat(selectedSale.total_amount).toFixed(2)}
                      </strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </>
        )}
      </Modal>

      {/* Receipt Modal */}
      <Modal
        title="Sale Receipt"
        open={receiptModalVisible}
        onCancel={() => setReceiptModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setReceiptModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => {
              const printWindow = window.open('', '_blank');
              const receiptContent = document.querySelector('.receipt-print-content');
              if (receiptContent && printWindow) {
                printWindow.document.write(`
                  <html>
                    <head>
                      <title>Receipt - #${selectedSale?.sale_id || selectedSale?.id}</title>
                      <style>
                        body { font-family: monospace; margin: 20px; }
                        @media print {
                          body { margin: 0; }
                          .no-print { display: none; }
                        }
                      </style>
                    </head>
                    <body>
                      ${receiptContent.innerHTML}
                    </body>
                  </html>
                `);
                printWindow.document.close();
                printWindow.print();
              }
            }}
            style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
          >
            Print Receipt
          </Button>
        ]}
        width={400}
      >
        {selectedSale && <ReceiptPrint saleData={selectedSale} />}
      </Modal>
    </AdminLayout>
  );
};

export default AdminPOSSales;
