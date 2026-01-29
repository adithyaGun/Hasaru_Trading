import { useState, useEffect, useRef } from 'react';
import SalesLayout from '../../components/sales/SalesLayout';
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
  Empty,
  Checkbox,
  Tooltip
} from 'antd';
import {
  SearchOutlined,
  DeleteOutlined,
  BarcodeOutlined,
  DollarOutlined,
  PrinterOutlined,
  ClearOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  PercentageOutlined,
  InfoCircleOutlined,
  InboxOutlined
} from '@ant-design/icons';
import api from '../../api/axios';
import ReceiptPrint from '../../components/pos/ReceiptPrint';

const { Option } = Select;
const { Text } = Typography;

const POSSale = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('fixed'); // 'fixed' or 'percentage'
  const [lastSaleData, setLastSaleData] = useState(null);
  const [isWalkIn, setIsWalkIn] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [form] = Form.useForm();
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    let filtered = products.filter(p => p.is_active === 1 && p.stock_quantity > 0);
    
    // Filter by category first
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category?.toString() === selectedCategory.toString());
    }
    
    // Then filter by search text if provided
    if (searchText) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // Show filtered products (by category or search or both)
    setFilteredProducts(filtered);
  }, [searchText, products, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories');
      const categoriesData = response.data?.data || [];
      // Transform array of strings to array of objects
      const categoriesWithId = categoriesData.map((name, index) => ({
        id: index + 1,
        name: name
      }));
      setCategories(categoriesWithId);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      // Backend returns { success, message, data: { products, pagination } }
      const productsData = response.data?.data?.products || [];
      const activeProducts = productsData.filter(p => p.is_active === 1 && p.stock_quantity > 0);
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

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === 'percentage') {
      return (subtotal * discount) / 100;
    }
    return discount;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscount();
    return Math.max(0, subtotal - discountAmount);
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
      const discountAmount = calculateDiscount();
      const total = calculateTotal();

      const orderData = {
        channel: 'pos',
        customer_id: isWalkIn ? null : values.customer_id,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        discount: discountAmount,
        payment_method: values.payment_method || 'cash',
        notes: isWalkIn 
          ? `Walk-in customer${values.customer_name ? ': ' + values.customer_name : ''}`
          : values.notes
      };

      const response = await api.post('/sales', orderData);
      const sale_id = response.data?.data?.sale_id;
      
      // Confirm payment immediately for POS sales
      if (sale_id) {
        await api.post(`/sales/${sale_id}/payment`, {
          payment_status: 'completed'
        });
      }

      // Store sale data for receipt
      setLastSaleData({
        sale_id,
        customer_name: isWalkIn ? (values.customer_name || 'Walk-in Customer') : values.customer_name,
        customer_phone: values.customer_phone,
        payment_method: values.payment_method || 'cash',
        items: cart,
        subtotal,
        discount: discountAmount,
        total,
        sale_date: new Date().toLocaleString()
      });
      
      message.success('Sale completed successfully!');
      setPaymentModalVisible(false);
      setCart([]);
      setDiscount(0);
      setDiscountType('fixed');
      form.resetFields();
      
      // Show receipt modal
      setReceiptModalVisible(true);
      
      fetchProducts(); // Refresh product stock
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to complete sale');
      console.error('Error processing sale:', error);
    } finally {
      setLoading(false);
    }
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
      render: (price) => `Rs. ${price.toFixed(2)}`,
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
      render: (_, record) => `Rs. ${(record.price * record.quantity).toFixed(2)}`,
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
    <SalesLayout>
      <div style={{ minHeight: 'calc(100vh - 140px)', background: '#f5f7fa', padding: '20px', marginLeft: '-20px', marginRight: '-20px', marginTop: '-20px' }}>
        <div style={{ marginBottom: '20px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <Input
            ref={searchInputRef}
            size="large"
            placeholder="Search product by name, SKU or scan barcode..."
            prefix={<SearchOutlined style={{ fontSize: '18px', color: '#dc2626' }} />}
            suffix={<BarcodeOutlined style={{ fontSize: '18px', color: '#dc2626' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            autoFocus
            style={{ 
              borderRadius: '8px', 
              border: '2px solid #fee2e2',
              fontSize: '16px',
              height: '48px'
            }}
          />
        </div>

        <Row gutter={20}>
          {/* Left Side - Products */}
          <Col xs={24} lg={16}>
            {/* Category Tabs */}
            <div style={{ marginBottom: '16px' }}>
              <Space wrap size="small">
                <Button
                  type={selectedCategory === 'all' ? 'primary' : 'default'}
                  onClick={() => setSelectedCategory('all')}
                  style={{
                    borderRadius: '20px',
                    fontWeight: selectedCategory === 'all' ? 'bold' : 'normal',
                    background: selectedCategory === 'all' ? '#dc2626' : 'white',
                    color: selectedCategory === 'all' ? 'white' : 'inherit',
                    border: selectedCategory === 'all' ? 'none' : '1px solid #d9d9d9'
                  }}
                >
                  All Products
                </Button>
                {categories.map(cat => (
                  <Button
                    key={cat.name}
                    type={selectedCategory === cat.name ? 'primary' : 'default'}
                    onClick={() => setSelectedCategory(cat.name)}
                    style={{
                      borderRadius: '20px',
                      fontWeight: selectedCategory === cat.name ? 'bold' : 'normal',
                      background: selectedCategory === cat.name ? '#dc2626' : 'white',
                      color: selectedCategory === cat.name ? 'white' : 'inherit',
                      border: selectedCategory === cat.name ? 'none' : '1px solid #d9d9d9'
                    }}
                  >
                    {cat.name}
                  </Button>
                ))}
              </Space>
            </div>

            {/* Products Grid */}
            <div style={{ 
              background: 'white', 
              borderRadius: '12px', 
              padding: '20px',
              minHeight: '500px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              {filteredProducts.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {filteredProducts.map(product => (
                    <Col key={product.id} xs={12} sm={8} md={6} lg={6}>
                      <Card
                        hoverable
                        onClick={() => handleProductSelect(product)}
                        style={{
                          borderRadius: '12px',
                          border: '1px solid #fee2e2',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          height: '100%'
                        }}
                        bodyStyle={{ padding: '12px' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 8px 16px rgba(220, 38, 38, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 12px',
                            background: '#fee2e2',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            color: '#dc2626'
                          }}>
                            <InboxOutlined />
                          </div>
                          <div style={{ 
                            fontSize: '14px', 
                            fontWeight: '600',
                            marginBottom: '4px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {product.name}
                          </div>
                          <div style={{ 
                            fontSize: '11px', 
                            color: '#999',
                            marginBottom: '8px'
                          }}>
                            Stock: {product.stock_quantity}
                          </div>
                          <div style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#dc2626'
                          }}>
                            Rs. {parseFloat(product.selling_price).toFixed(2)}
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty 
                  description={
                    <span style={{ color: '#999' }}>
                      {searchText || selectedCategory !== 'all' ? 'No products found' : 'No products available'}
                    </span>
                  }
                  style={{ marginTop: '100px' }}
                />
              )}
            </div>
          </Col>

          {/* Right Side - Cart & Payment */}
          <Col xs={24} lg={8}>
            <div style={{ position: 'sticky', top: '80px' }}>
              {/* Cart */}
              <Card 
                title={
                  <Space>
                    <ShoppingCartOutlined style={{ color: '#dc2626' }} />
                    <span>Cart ({cart.length} items)</span>
                  </Space>
                }
                extra={
                  cart.length > 0 && (
                    <Button 
                      type="text"
                      icon={<ClearOutlined />} 
                      onClick={handleClearCart}
                      danger
                      size="small"
                    >
                      Clear
                    </Button>
                  )
                }
                style={{ 
                  marginBottom: '16px',
                  borderRadius: '12px',
                  border: '1px solid #fee2e2',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                {cart.length === 0 ? (
                  <Empty 
                    description="Cart is empty"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {cart.map(item => (
                      <div key={item.id} style={{
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        background: '#fef2f2',
                        border: '1px solid #fee2e2'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>{item.name}</div>
                            <div style={{ fontSize: '12px', color: '#999' }}>Rs. {item.price.toFixed(2)} each</div>
                          </div>
                          <Button 
                            type="text" 
                            danger 
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveItem(item.id)}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <InputNumber
                            min={1}
                            max={item.stock}
                            value={item.quantity}
                            onChange={(value) => handleQuantityChange(item.id, value)}
                            size="small"
                            style={{ width: '80px' }}
                          />
                          <div style={{ 
                            fontWeight: 'bold',
                            fontSize: '16px',
                            color: '#dc2626'
                          }}>
                            Rs. {(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Order Summary */}
              <Card 
                style={{ 
                  borderRadius: '12px',
                  border: '1px solid #fee2e2',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  background: '#fef2f2'
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  {/* Subtotal */}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: '15px' }}>Subtotal:</Text>
                    <Text strong style={{ fontSize: '15px' }}>Rs. {calculateSubtotal().toFixed(2)}</Text>
                  </div>
                  
                  {/* Discount Section */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <Text strong style={{ fontSize: '15px' }}>
                        <PercentageOutlined style={{ marginRight: '6px', color: '#dc2626' }} />
                        Discount
                      </Text>
                      {discount > 0 && (
                        <Button 
                          type="link" 
                          size="small" 
                          danger
                          onClick={() => {
                            setDiscount(0);
                            setDiscountType('fixed');
                          }}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    
                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                      {/* Quick Buttons */}
                      <Row gutter={8}>
                        <Col span={8}>
                          <Button
                            block
                            type={discountType === 'percentage' && discount === 5 ? 'primary' : 'default'}
                            onClick={() => {
                              setDiscountType('percentage');
                              setDiscount(5);
                            }}
                            disabled={cart.length === 0}
                            style={{
                              borderRadius: '8px',
                              fontWeight: '600',
                              background: discountType === 'percentage' && discount === 5 ? '#dc2626' : 'white',
                              color: discountType === 'percentage' && discount === 5 ? 'white' : 'inherit',
                              border: discountType === 'percentage' && discount === 5 ? 'none' : '1px solid #d9d9d9'
                            }}
                          >
                            5%
                          </Button>
                        </Col>
                        <Col span={8}>
                          <Button
                            block
                            type={discountType === 'percentage' && discount === 10 ? 'primary' : 'default'}
                            onClick={() => {
                              setDiscountType('percentage');
                              setDiscount(10);
                            }}
                            disabled={cart.length === 0}
                            style={{
                              borderRadius: '8px',
                              fontWeight: '600',
                              background: discountType === 'percentage' && discount === 10 ? '#dc2626' : 'white',
                              color: discountType === 'percentage' && discount === 10 ? 'white' : 'inherit',
                              border: discountType === 'percentage' && discount === 10 ? 'none' : '1px solid #d9d9d9'
                            }}
                          >
                            10%
                          </Button>
                        </Col>
                        <Col span={8}>
                          <Button
                            block
                            type={discountType === 'percentage' && discount === 15 ? 'primary' : 'default'}
                            onClick={() => {
                              setDiscountType('percentage');
                              setDiscount(15);
                            }}
                            disabled={cart.length === 0}
                            style={{
                              borderRadius: '8px',
                              fontWeight: '600',
                              background: discountType === 'percentage' && discount === 15 ? '#dc2626' : 'white',
                              color: discountType === 'percentage' && discount === 15 ? 'white' : 'inherit',
                              border: discountType === 'percentage' && discount === 15 ? 'none' : '1px solid #d9d9d9'
                            }}
                          >
                            15%
                          </Button>
                        </Col>
                      </Row>
                      
                      {/* Custom Discount Input */}
                      <Space.Compact style={{ width: '100%' }}>
                        <Select
                          value={discountType}
                          onChange={setDiscountType}
                          style={{ width: '90px' }}
                          disabled={cart.length === 0}
                        >
                          <Option value="percentage">
                            <PercentageOutlined /> %
                          </Option>
                          <Option value="fixed">Rs.</Option>
                        </Select>
                        <InputNumber
                          min={0}
                          max={discountType === 'percentage' ? 100 : calculateSubtotal()}
                          value={discount}
                          onChange={setDiscount}
                          style={{ width: 'calc(100% - 90px)' }}
                          placeholder="Custom discount"
                          disabled={cart.length === 0}
                        />
                      </Space.Compact>
                    </Space>
                    
                    {discount > 0 && (
                      <div style={{ 
                        marginTop: '12px', 
                        padding: '10px 14px', 
                        background: '#fff1f0', 
                        borderRadius: '8px',
                        border: '1px solid #ffccc7'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text type="secondary" style={{ fontSize: '13px' }}>
                            {discountType === 'percentage' ? `${discount}% discount` : `Rs. ${discount} off`}
                          </Text>
                          <Text type="danger" strong style={{ fontSize: '14px' }}>
                            - Rs. {calculateDiscount().toFixed(2)}
                          </Text>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Divider style={{ margin: '4px 0' }} />
                  
                  {/* Total */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: 'white',
                    borderRadius: '8px',
                    border: '2px solid #fee2e2'
                  }}>
                    <Text style={{ fontSize: '18px', fontWeight: 'bold' }}>Total:</Text>
                    <Text style={{ 
                      fontSize: '28px', 
                      fontWeight: 'bold',
                      color: '#dc2626'
                    }}>
                      Rs. {calculateTotal().toFixed(2)}
                    </Text>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<DollarOutlined />}
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    style={{ 
                      height: '56px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      borderRadius: '12px',
                      background: '#dc2626',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                    }}
                  >
                    Proceed to Payment
                  </Button>
                </Space>
              </Card>
            </div>
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
            is_walk_in: true
          }}
        >
          <Card style={{ marginBottom: '20px', background: '#f5f5f5' }}>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">Total Amount</Text>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc2626' }}>
                Rs. {calculateTotal().toFixed(2)}
              </div>
              {discount > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <Tag color="red">Discount: Rs. {calculateDiscount().toFixed(2)}</Tag>
                </div>
              )}
            </div>
          </Card>

          <Form.Item>
            <Checkbox 
              checked={isWalkIn} 
              onChange={(e) => setIsWalkIn(e.target.checked)}
            >
              Walk-in Customer (No account)
            </Checkbox>
          </Form.Item>

          <Form.Item
            name="customer_name"
            label="Customer Name"
            rules={[{ required: false }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder={isWalkIn ? "Optional" : "Enter customer name"} 
            />
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

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Button onClick={() => setPaymentModalVisible(false)}>
                Cancel
              </Button>
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
          </Form.Item>
        </Form>
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
            onClick={() => window.print()}
            style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
          >
            Print Receipt
          </Button>
        ]}
        width={400}
      >
        {lastSaleData && <ReceiptPrint saleData={lastSaleData} />}
      </Modal>
    </SalesLayout>
  );
};

export default POSSale;
