import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartItem, removeFromCart } from '../../store/slices/cartSlice';
import { Button, InputNumber, Table, Empty } from 'antd';
import { DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, summary, loading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  const handleQuantityChange = (productId, quantity) => {
    dispatch(updateCartItem({ product_id: productId, quantity }));
  };

  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (text, record) => (
        <Link to={`/product/${record.product_id}`} className="text-primary-600 hover:text-primary-700">
          {text}
        </Link>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (price) => `Rs. ${parseFloat(price).toFixed(2)}`,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => (
        <InputNumber
          min={1}
          max={record.stock_quantity}
          value={quantity}
          onChange={(value) => handleQuantityChange(record.product_id, value)}
        />
      ),
    },
    {
      title: 'Discount',
      dataIndex: 'discount_amount',
      key: 'discount_amount',
      render: (discount) => discount > 0 ? `-Rs. ${parseFloat(discount).toFixed(2)}` : '-',
    },
    {
      title: 'Total',
      dataIndex: 'final_price',
      key: 'final_price',
      render: (price) => (
        <span className="font-semibold">Rs. {parseFloat(price).toFixed(2)}</span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemove(record.product_id)}
        >
          Remove
        </Button>
      ),
    },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Empty description="Please login to view your cart" />
            <Link to="/login">
              <Button type="primary" size="large" className="mt-4">
                Login
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

          {items.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Empty description="Your cart is empty">
                <Link to="/products">
                  <Button type="primary" size="large" icon={<ShoppingOutlined />}>
                    Continue Shopping
                  </Button>
                </Link>
              </Empty>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Table
                    columns={columns}
                    dataSource={items}
                    rowKey="product_id"
                    loading={loading}
                    pagination={false}
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                  <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>Rs. {parseFloat(summary.subtotal || 0).toFixed(2)}</span>
                    </div>
                    
                    {summary.discount_amount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-Rs. {parseFloat(summary.discount_amount).toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-red-600">
                          Rs. {parseFloat(summary.total || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    className="w-full mb-3"
                    onClick={() => navigate('/checkout')}
                  >
                    Proceed to Checkout
                  </Button>

                  <Link to="/products">
                    <Button size="large" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
