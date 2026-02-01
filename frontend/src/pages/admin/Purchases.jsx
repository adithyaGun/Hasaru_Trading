import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Space, 
  Tag, 
  Popconfirm, 
  message,
  Row,
  Col,
  Card,
  Statistic,
  Descriptions,
  Divider,
  Checkbox,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import api from '../../api/axios';

const { Option } = Select;
const { TextArea } = Input;

const AdminPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [receiveModalVisible, setReceiveModalVisible] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [viewingPurchase, setViewingPurchase] = useState(null);
  const [receivingPurchase, setReceivingPurchase] = useState(null);
  const [form] = Form.useForm();
  const [receiveForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [receivedItems, setReceivedItems] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    approved: 0,
    received: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchPurchases();
    fetchSuppliers();
    fetchProducts();
  }, []);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const response = await api.get('/purchases');
      // Backend returns { success, message, data: { purchases, pagination } }
      const purchasesData = response.data?.data?.purchases || [];
      setPurchases(purchasesData);
      calculateStats(purchasesData);
      message.success('Purchase orders loaded successfully');
    } catch (error) {
      message.error('Failed to load purchase orders');
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      // Backend returns { success, message, data: { suppliers, pagination } }
      const suppliersData = response.data?.data?.suppliers || [];
      setSuppliers(suppliersData.filter(s => s.is_active === 1 || s.is_active === true));
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      // Backend returns { success, message, data: { products, pagination } }
      const productsData = response.data?.data?.products || [];
      setProducts(productsData.filter(p => p.is_active === 1));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const calculateStats = (purchasesData) => {
    if (!Array.isArray(purchasesData)) {
      setStats({ total: 0, draft: 0, approved: 0, received: 0, cancelled: 0 });
      return;
    }
    const total = purchasesData.length;
    const draft = purchasesData.filter(p => p.status === 'draft').length;
    const approved = purchasesData.filter(p => p.status === 'approved').length;
    const received = purchasesData.filter(p => p.status === 'received').length;
    const cancelled = purchasesData.filter(p => p.status === 'cancelled').length;
    setStats({ total, draft, approved, received, cancelled });
  };

  const handleAdd = () => {
    setEditingPurchase(null);
    form.resetFields();
    setPurchaseItems([]);
    setModalVisible(true);
  };

  const handleEdit = async (record) => {
    setEditingPurchase(record);
    form.setFieldsValue({
      supplier_id: record.supplier_id,
      order_date: record.order_date?.split('T')[0],
      expected_date: record.expected_delivery_date?.split('T')[0],
      notes: record.notes,
      status: record.status,
      auto_receive: record.auto_receive !== undefined ? record.auto_receive : true
    });
    // Load purchase items
    await fetchPurchaseItems(record.id);
    setModalVisible(true);
  };

  const fetchPurchaseItems = async (purchaseId) => {
    try {
      const response = await api.get(`/purchases/${purchaseId}`);
      const purchaseData = response.data?.data;
      if (purchaseData && purchaseData.items) {
        setPurchaseItems(purchaseData.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price)
        })));
      }
    } catch (error) {
      console.error('Error fetching purchase items:', error);
      message.error('Failed to load purchase items');
    }
  };

  const handleView = async (record) => {
    try {
      const response = await api.get(`/purchases/${record.id}`);
      const purchaseData = response.data?.data || record;
      setViewingPurchase(purchaseData);
      setDetailsModalVisible(true);
    } catch (error) {
      message.error('Failed to load purchase details');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/purchases/${id}`);
      message.success('Purchase order deleted successfully');
      fetchPurchases();
    } catch (error) {
      message.error('Failed to delete purchase order');
      console.error('Error deleting purchase:', error);
    }
  };

  const handleUpdateStatus = async (id, status, purchase) => {
    try {
      if (status === 'completed') {
        // Check if auto_receive is disabled - show manual receive modal
        if (purchase && purchase.auto_receive === 0) {
          // Fetch purchase details with items
          const response = await api.get(`/purchases/${id}`);
          const purchaseData = response.data?.data || purchase;
          
          setReceivingPurchase(purchaseData);
          // Initialize received items with ordered quantities
          const initialItems = (purchaseData.items || []).map(item => ({
            product_id: item.product_id,
            product_name: item.product_name,
            ordered_quantity: item.quantity,
            received_quantity: item.quantity,
            unit_price: item.unit_price
          }));
          setReceivedItems(initialItems);
          setReceiveModalVisible(true);
        } else {
          // Auto-receive - call the receive endpoint which updates stock
          await api.put(`/purchases/${id}/receive`);
          message.success('Purchase order received and stock updated successfully');
          fetchPurchases();
        }
      } else if (status === 'cancelled') {
        await api.put(`/purchases/${id}`, { status: 'cancelled' });
        message.success('Purchase order cancelled');
        fetchPurchases();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update status');
      console.error('Error updating status:', error);
    }
  };

  const handleConfirmReceive = async () => {
    try {
      const items = receivedItems.map(item => ({
        product_id: item.product_id,
        quantity: parseFloat(item.received_quantity) || 0,
        unit_price: parseFloat(item.unit_price) || 0
      }));

      await api.post(`/purchases/${receivingPurchase.id}/confirm-receive`, { items });
      message.success('Goods received and stock updated successfully');
      setReceiveModalVisible(false);
      setReceivingPurchase(null);
      setReceivedItems([]);
      fetchPurchases();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to confirm receipt');
      console.error('Error confirming receipt:', error);
    }
  };

  const handleReceivedQuantityChange = (index, value) => {
    const newItems = [...receivedItems];
    newItems[index].received_quantity = value;
    setReceivedItems(newItems);
  };

  const handleAddItem = () => {
    setPurchaseItems([...purchaseItems, {
      product_id: null,
      quantity: 1,
      unit_price: 0
    }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...purchaseItems];
    newItems.splice(index, 1);
    setPurchaseItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...purchaseItems];
    newItems[index][field] = value;
    
    // Auto-fill price when product is selected
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].unit_price = parseFloat(product.purchase_price || 0);
      }
    }
    
    setPurchaseItems(newItems);
  };

  const calculateTotal = () => {
    return purchaseItems.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unit_price) || 0;
      return sum + (quantity * unitPrice);
    }, 0);
  };

  const handleSubmit = async (values) => {
    if (purchaseItems.length === 0) {
      message.error('Please add at least one item to the purchase order');
      return;
    }

    const purchaseData = {
      supplier_id: values.supplier_id,
      order_date: values.order_date,
      expected_delivery_date: values.expected_date,
      notes: values.notes,
      auto_receive: values.auto_receive !== undefined ? values.auto_receive : true,
      items: purchaseItems,
      total_amount: calculateTotal()
    };

    try {
      if (editingPurchase) {
        await api.put(`/purchases/${editingPurchase.id}`, purchaseData);
        message.success('Purchase order updated successfully');
      } else {
        await api.post('/purchases', purchaseData);
        message.success('Purchase order created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setPurchaseItems([]);
      fetchPurchases();
    } catch (error) {
      message.error(editingPurchase ? 'Failed to update purchase order' : 'Failed to create purchase order');
      console.error('Error saving purchase:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'default';
      case 'approved': return 'blue';
      case 'received': return 'green';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  const filteredPurchases = (Array.isArray(purchases) ? purchases : []).filter(purchase => {
    const matchesSearch = purchase.supplier_name?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = filterStatus === 'all' || purchase.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: 'Order #',
      dataIndex: 'id',
      key: 'id',
      width: 90,
      render: (id) => `PO-${id}`,
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier_name',
      key: 'supplier_name',
      width: 180,
    },
    {
      title: 'Order Date',
      dataIndex: 'order_date',
      key: 'order_date',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Expected Date',
      dataIndex: 'expected_date',
      key: 'expected_date',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 120,
      render: (amount) => `Rs. ${parseFloat(amount).toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status?.toUpperCase() || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 280,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleView(record)}
          >
            View
          </Button>
          {(record.status === 'draft' || record.status === 'approved') && (
            <>
              <Button 
                type="link" 
                icon={<EditOutlined />} 
                onClick={() => handleEdit(record)}
              >
                Edit
              </Button>
              {record.status === 'approved' && (
                <Popconfirm
                  title="Receive goods and update stock?"
                  description="This will update product stock quantities."
                  onConfirm={() => handleUpdateStatus(record.id, 'completed', record)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="link" icon={<CheckCircleOutlined />} style={{ color: '#52c41a' }}>
                    Receive
                  </Button>
                </Popconfirm>
              )}
              {record.status === 'draft' && (
                <Popconfirm
                  title="Approve this purchase order?"
                  onConfirm={async () => {
                    try {
                      await api.put(`/purchases/${record.id}/approve`);
                      message.success('Purchase order approved');
                      fetchPurchases();
                    } catch (error) {
                      message.error('Failed to approve purchase order');
                    }
                  }}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="link" icon={<CheckCircleOutlined />} style={{ color: '#1890ff' }}>
                    Approve
                  </Button>
                </Popconfirm>
              )}
              {record.status !== 'received' && record.status !== 'cancelled' && (
                <Popconfirm
                  title="Cancel this order?"
                  onConfirm={() => handleUpdateStatus(record.id, 'cancelled')}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="link" danger icon={<CloseCircleOutlined />}>
                    Cancel
                  </Button>
                </Popconfirm>
              )}
            </>
          )}
          {(record.status === 'draft' || record.status === 'cancelled') && (
            <Popconfirm
              title="Are you sure you want to delete this purchase order?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        {/* Statistics Cards */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="Total Orders" 
                value={stats.total}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="Draft" 
                value={stats.draft}
                valueStyle={{ color: '#8c8c8c' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="Approved" 
                value={stats.approved}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="Received" 
                value={stats.received}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="Cancelled" 
                value={stats.cancelled}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters and Actions */}
        <Card className="mb-4">
          <Row gutter={16} align="middle">
            <Col xs={24} md={10}>
              <Input
                placeholder="Search by supplier name"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by Status"
                value={filterStatus}
                onChange={setFilterStatus}
              >
                <Option value="all">All Status</Option>
                <Option value="draft">Draft</Option>
                <Option value="approved">Approved</Option>
                <Option value="received">Received</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Col>
            <Col xs={24} md={8} className="text-right">
              <Space>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={fetchPurchases}
                >
                  Refresh
                </Button>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                  style={{ backgroundColor: '#dc2626' }}
                >
                  New Purchase Order
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Purchases Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={filteredPurchases}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} orders`,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      </div>

      {/* Add/Edit Purchase Order Modal */}
      <Modal
        title={editingPurchase ? 'Edit Purchase Order' : 'New Purchase Order'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setPurchaseItems([]);
        }}
        onOk={() => form.submit()}
        width={900}
        okText={editingPurchase ? 'Update' : 'Create'}
        okButtonProps={{ style: { backgroundColor: '#dc2626', borderColor: '#dc2626' } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="supplier_id"
                label="Supplier"
                rules={[{ required: true, message: 'Please select supplier' }]}
              >
                <Select placeholder="Select supplier">
                  {suppliers.map(supplier => (
                    <Option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
                initialValue="draft"
              >
                <Select>
                  <Option value="draft">Draft</Option>
                  <Option value="approved">Approved</Option>
                  <Option value="received">Received</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="order_date"
                label="Order Date"
                rules={[{ required: true, message: 'Please select order date' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="expected_date"
                label="Expected Delivery Date"
              >
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea rows={2} placeholder="Enter any additional notes" />
          </Form.Item>

          <Form.Item
            name="auto_receive"
            label={
              <span>
                Auto-receive Stock{' '}
                <Tooltip title="When enabled, stock batches will be automatically created when this order is marked as 'received'. Disable for manual batch confirmation with quantity adjustments.">
                  <InfoCircleOutlined style={{ color: '#1890ff' }} />
                </Tooltip>
              </span>
            }
            valuePropName="checked"
            initialValue={true}
          >
            <Checkbox>
              Automatically create stock batches when order is received
            </Checkbox>
          </Form.Item>

          <Divider>Order Items</Divider>

          {purchaseItems.map((item, index) => (
            <Row key={index} gutter={16} align="middle" className="mb-2">
              <Col xs={24} md={10}>
                <Select
                  placeholder="Select product"
                  value={item.product_id}
                  onChange={(value) => handleItemChange(index, 'product_id', value)}
                  style={{ width: '100%' }}
                >
                  {products.map(product => (
                    <Option key={product.id} value={product.id}>
                      {product.name} - Rs. {parseFloat(product.purchase_price || 0).toFixed(2)}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={12} md={5}>
                <InputNumber
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(value) => handleItemChange(index, 'quantity', value)}
                  min={1}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={12} md={6}>
                <InputNumber
                  placeholder="Unit Price"
                  value={item.unit_price}
                  onChange={(value) => handleItemChange(index, 'unit_price', value)}
                  min={0}
                  step={0.01}
                  prefix="Rs."
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24} md={3}>
                <Button type="link" danger onClick={() => handleRemoveItem(index)}>
                  Remove
                </Button>
              </Col>
            </Row>
          ))}

          <Button type="dashed" onClick={handleAddItem} block icon={<PlusOutlined />} className="mb-4">
            Add Item
          </Button>

          <Row justify="end">
            <Col>
              <Statistic 
                title="Total Amount" 
                value={calculateTotal()}
                precision={2}
                prefix="Rs."
                valueStyle={{ color: '#dc2626', fontWeight: 'bold' }}
              />
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* View Purchase Details Modal */}
      <Modal
        title="Purchase Order Details"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {viewingPurchase && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Order #" span={2}>
                PO-{viewingPurchase.id}
              </Descriptions.Item>
              <Descriptions.Item label="Supplier">
                {viewingPurchase.supplier_name}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(viewingPurchase.status)}>
                  {viewingPurchase.status?.toUpperCase() || 'N/A'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Order Date">
                {new Date(viewingPurchase.order_date).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Expected Date">
                {viewingPurchase.expected_date ? new Date(viewingPurchase.expected_date).toLocaleDateString() : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Notes" span={2}>
                {viewingPurchase.notes || 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Order Items</Divider>

            <Table
              dataSource={viewingPurchase.items || []}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: 'Product',
                  dataIndex: 'product_name',
                  key: 'product_name',
                },
                {
                  title: 'Quantity',
                  dataIndex: 'quantity',
                  key: 'quantity',
                },
                {
                  title: 'Unit Price',
                  dataIndex: 'unit_price',
                  key: 'unit_price',
                  render: (price) => `Rs. ${parseFloat(price).toFixed(2)}`,
                },
                {
                  title: 'Total',
                  key: 'total',
                  render: (_, record) => `Rs. ${(record.quantity * record.unit_price).toFixed(2)}`,
                },
              ]}
              summary={(pageData) => {
                const total = pageData.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
                return (
                  <Table.Summary>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3}>
                        <strong>Total Amount</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong style={{ color: '#dc2626' }}>Rs. {total.toFixed(2)}</strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          </>
        )}
      </Modal>

      {/* Receive Confirmation Modal */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <span>Confirm Goods Receipt</span>
          </Space>
        }
        open={receiveModalVisible}
        onCancel={() => {
          setReceiveModalVisible(false);
          setReceivingPurchase(null);
          setReceivedItems([]);
        }}
        onOk={handleConfirmReceive}
        width={800}
        okText="Confirm Receipt"
        okButtonProps={{ style: { backgroundColor: '#52c41a', borderColor: '#52c41a' } }}
      >
        {receivingPurchase && (
          <>
            <Descriptions bordered column={2} size="small" className="mb-4">
              <Descriptions.Item label="Purchase Order">
                PO-{receivingPurchase.id}
              </Descriptions.Item>
              <Descriptions.Item label="Supplier">
                {receivingPurchase.supplier_name}
              </Descriptions.Item>
              <Descriptions.Item label="Order Date">
                {new Date(receivingPurchase.order_date).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Expected Date">
                {receivingPurchase.expected_date 
                  ? new Date(receivingPurchase.expected_date).toLocaleDateString() 
                  : 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Received Items - Enter Actual Quantities</Divider>

            <Table
              dataSource={receivedItems}
              rowKey="product_id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Product',
                  dataIndex: 'product_name',
                  key: 'product_name',
                  width: '35%',
                },
                {
                  title: 'Ordered Qty',
                  dataIndex: 'ordered_quantity',
                  key: 'ordered_quantity',
                  width: '15%',
                  align: 'center',
                  render: (qty) => <strong>{qty}</strong>
                },
                {
                  title: 'Received Qty',
                  key: 'received_quantity',
                  width: '25%',
                  render: (_, record, index) => (
                    <InputNumber
                      value={record.received_quantity}
                      onChange={(value) => handleReceivedQuantityChange(index, value)}
                      min={0}
                      max={record.ordered_quantity * 1.1} // Allow 10% overage
                      style={{ width: '100%' }}
                      status={record.received_quantity !== record.ordered_quantity ? 'warning' : ''}
                    />
                  ),
                },
                {
                  title: 'Unit Price',
                  dataIndex: 'unit_price',
                  key: 'unit_price',
                  width: '15%',
                  render: (price) => `Rs. ${parseFloat(price).toFixed(2)}`,
                },
                {
                  title: 'Total',
                  key: 'total',
                  width: '10%',
                  align: 'right',
                  render: (_, record) => (
                    <span style={{ fontWeight: record.received_quantity !== record.ordered_quantity ? 'bold' : 'normal', color: record.received_quantity !== record.ordered_quantity ? '#faad14' : 'inherit' }}>
                      Rs. {((record.received_quantity || 0) * record.unit_price).toFixed(2)}
                    </span>
                  ),
                },
              ]}
              summary={(pageData) => {
                const orderedTotal = pageData.reduce((sum, item) => sum + (item.ordered_quantity * item.unit_price), 0);
                const receivedTotal = pageData.reduce((sum, item) => sum + ((item.received_quantity || 0) * item.unit_price), 0);
                const hasDiscrepancies = pageData.some(item => item.received_quantity !== item.ordered_quantity);
                
                return (
                  <>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={1}>
                        <strong>Ordered Total</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} colSpan={3} />
                      <Table.Summary.Cell index={2} align="right">
                        <strong>Rs. {orderedTotal.toFixed(2)}</strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={1}>
                        <strong style={{ color: hasDiscrepancies ? '#faad14' : '#52c41a' }}>
                          Received Total
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} colSpan={3} />
                      <Table.Summary.Cell index={2} align="right">
                        <strong style={{ color: hasDiscrepancies ? '#faad14' : '#52c41a' }}>
                          Rs. {receivedTotal.toFixed(2)}
                        </strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </>
                );
              }}
            />

            {receivedItems.some(item => item.received_quantity !== item.ordered_quantity) && (
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '4px' }}>
                <Space>
                  <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                  <span style={{ color: '#ad6800' }}>
                    <strong>Notice:</strong> Received quantities differ from ordered quantities. 
                    Please verify the discrepancies before confirming.
                  </span>
                </Space>
              </div>
            )}
          </>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default AdminPurchases;
