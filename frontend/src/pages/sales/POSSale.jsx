import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  Row, 
  Col, 
  Card, 
  Input,
  Button,
  Table,
  InputNumber,
  Select,
  Modal,
  Form,
  Space,
  message,
  Tag,
  Divider,
  Typography,
  Empty
} from 'antd';
import {
  SearchOutlined,
  DeleteOutlined,
  BarcodeOutlined,
  DollarOutlined,
  PrinterOutlined,
  ClearOutlined,
  UserOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import api from '../../api/axios';

const { Option } = Select;
const { Text } = Typography;

const POSSale = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchText) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchText, products]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      // Backend returns { success, message, data: { products, pagination } }
      const productsData = response.data?.data?.products || [];
      const activeProducts = productsData.filter(p => p.status === 'active' && p.stock_quantity > 0);
      setProducts(activeProducts);
    } catch (error) {
      message.error('Failed to load products');
      console.error('Error fetching products:', error);
    }
  };

  const handleProductSelect = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock_quantity) {
        message.warning('Not enough stock available');
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: parseFloat(product.selling_price),
        quantity: 1,
        stock: product.stock_quantity
      }]);
    }
    
    setSearchText('');
    setFilteredProducts([]);
    searchInputRef.current?.focus();
  };

  const handleQuantityChange = (productId, newQuantity) => {
    const product = cart.find(item => item.id === productId);
    
    if (newQuantity > product.stock) {
      message.warning('Not enough stock available');
      return;
    }
    
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    
    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const handleRemoveItem = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const handleClearCart = () => {
    Modal.confirm({
      title: 'Clear Cart',
      content: 'Are you sure you want to clear all items from the cart?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        setCart([]);
        message.success('Cart cleared');
      }
    });
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = (subtotal) => {
    return subtotal * 0.08; // 8% tax
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    return subtotal + tax;
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      message.warning('Cart is empty');
      return;
    }
    form.resetFields();
    setPaymentModalVisible(true);
  };

  const handlePayment = async (values) => {
    setLoading(true);
    try {
      const subtotal = calculateSubtotal();
      const tax = calculateTax(subtotal);
      const total = calculateTotal();

      const orderData = {
        customer_name: values.customer_name,
        customer_phone: values.customer_phone,
        payment_method: values.payment_method,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal,
        tax,
        total_amount: total,
        paid_amount: values.paid_amount,
        change_amount: values.paid_amount - total,
        sale_type: 'otc'
      };

      await api.post('/sales/otc', orderData);
      
      message.success('Sale completed successfully!');
      setPaymentModalVisible(false);
      setCart([]);
      form.resetFields();
      
      // Print receipt (optional)
      if (values.print_receipt) {
        handlePrintReceipt(orderData);
      }
      
      fetchProducts(); // Refresh product stock
    } catch (error) {
      message.error('Failed to complete sale');
      console.error('Error processing sale:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = (orderData) => {
    message.info('Printing receipt...');
    // Implement receipt printing logic
  };

  const cartColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <div>{name}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.sku}</Text>
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (quantity, record) => (
        <InputNumber
          min={1}
          max={record.stock}
          value={quantity}
          onChange={(value) => handleQuantityChange(record.id, value)}
          size="small"
        />
      ),
    },
    {
      title: 'Total',
      key: 'total',
      width: 100,
      render: (_, record) => `$${(record.price * record.quantity).toFixed(2)}`,
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button 
          type="link" 
          danger 
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.id)}
        />
      ),
    },
  ];

  return (
    <AdminLayout>
      <div style={{ minHeight: 'calc(100vh - 140px)' }}>
        <h1 className="text-2xl font-bold mb-4">Point of Sale - Over the Counter</h1>

        <Row gutter={16}>
          {/* Left Side - Product Search & Cart */}
          <Col xs={24} lg={16}>
            <Card className="mb-4">
              <Input
                ref={searchInputRef}
                size="large"
                placeholder="Search product by name or scan barcode..."
                prefix={<SearchOutlined />}
                suffix={<BarcodeOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                autoFocus
              />
              
              {/* Product Search Results */}
              {filteredProducts.length > 0 && (
                <div style={{ 
                  marginTop: '10px', 
                  maxHeight: '200px', 
                  overflowY: 'auto',
                  border: '1px solid #f0f0f0',
                  borderRadius: '4px'
                }}>
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      style={{
                        padding: '10px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f0f0f0',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div><strong>{product.name}</strong></div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            SKU: {product.sku} | Stock: {product.stock_quantity}
                          </Text>
                        </div>
                        <div>
                          <Text style={{ fontSize: '16px', fontWeight: 'bold', color: '#dc2626' }}>
                            ${parseFloat(product.selling_price).toFixed(2)}
                          </Text>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Cart */}
            <Card 
              title={
                <Space>
                  <ShoppingCartOutlined />
                  Cart Items ({cart.length})
                </Space>
              }
              extra={
                <Button 
                  icon={<ClearOutlined />} 
                  onClick={handleClearCart}
                  disabled={cart.length === 0}
                  danger
                >
                  Clear Cart
                </Button>
              }
            >
              {cart.length === 0 ? (
                <Empty description="Cart is empty" />
              ) : (
                <Table
                  columns={cartColumns}
                  dataSource={cart}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              )}
            </Card>
          </Col>

          {/* Right Side - Order Summary & Payment */}
          <Col xs={24} lg={8}>
            <Card 
              title="Order Summary"
              style={{ position: 'sticky', top: '80px' }}
            >
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <Text>Subtotal:</Text>
                  <Text strong>${calculateSubtotal().toFixed(2)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <Text>Tax (8%):</Text>
                  <Text strong>${calculateTax(calculateSubtotal()).toFixed(2)}</Text>
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <Text style={{ fontSize: '18px', fontWeight: 'bold' }}>Total:</Text>
                  <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
                    ${calculateTotal().toFixed(2)}
                  </Text>
                </div>
              </div>

              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<DollarOutlined />}
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  style={{ 
                    height: '50px',
                    fontSize: '16px',
                    backgroundColor: '#dc2626',
                    borderColor: '#dc2626'
                  }}
                >
                  Proceed to Payment
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Payment Modal */}
      <Modal
        title="Complete Payment"
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePayment}
          initialValues={{
            payment_method: 'cash',
            print_receipt: true
          }}
        >
          <Card style={{ marginBottom: '20px', background: '#f5f5f5' }}>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">Total Amount</Text>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc2626' }}>
                ${calculateTotal().toFixed(2)}
              </div>
            </div>
          </Card>

          <Form.Item
            name="customer_name"
            label="Customer Name"
            rules={[{ required: true, message: 'Please enter customer name' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter customer name" />
          </Form.Item>

          <Form.Item
            name="customer_phone"
            label="Customer Phone"
          >
            <Input placeholder="Enter phone number (optional)" />
          </Form.Item>

          <Form.Item
            name="payment_method"
            label="Payment Method"
            rules={[{ required: true, message: 'Please select payment method' }]}
          >
            <Select>
              <Option value="cash">Cash</Option>
              <Option value="card">Card</Option>
              <Option value="mobile">Mobile Payment</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="paid_amount"
            label="Amount Paid"
            rules={[
              { required: true, message: 'Please enter amount paid' },
              {
                validator: (_, value) => {
                  if (value >= calculateTotal()) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Amount paid cannot be less than total'));
                }
              }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={0.01}
              prefix="$"
              placeholder="0.00"
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.paid_amount !== currentValues.paid_amount
            }
          >
            {({ getFieldValue }) => {
              const paidAmount = getFieldValue('paid_amount') || 0;
              const change = paidAmount - calculateTotal();
              
              return change >= 0 ? (
                <div style={{ 
                  padding: '12px', 
                  background: '#f6ffed', 
                  border: '1px solid #b7eb8f',
                  borderRadius: '4px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>Change:</Text>
                    <Text strong style={{ fontSize: '18px', color: '#16a34a' }}>
                      ${change.toFixed(2)}
                    </Text>
                  </div>
                </div>
              ) : null;
            }}
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Button onClick={() => setPaymentModalVisible(false)}>
                Cancel
              </Button>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<DollarOutlined />}
                  style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
                >
                  Complete Sale
                </Button>
              </Space>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default POSSale;
