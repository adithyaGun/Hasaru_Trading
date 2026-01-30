import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartItem, removeFromCart } from '../../store/slices/cartSlice';
import { Button, Empty, Card, Divider, Spin } from 'antd';
import { DeleteOutlined, ShoppingOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
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
    if (quantity >= 1) {
      dispatch(updateCartItem({ product_id: productId, quantity }));
    }
  };

  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Empty 
              description={
                <div className="py-4">
                  <p className="text-base text-gray-900 mb-1">Please login to continue</p>
                  <p className="text-sm text-gray-500">Sign in to view your cart</p>
                </div>
              }
            />
            <Link to="/login">
              <Button 
                type="primary" 
                size="large" 
                className="mt-4" 
                style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
              >
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

      <div className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-light text-gray-900">Shopping Cart</h1>
            {items.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </p>
            )}
          </div>

          {loading && !items.length ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <Empty 
                description={
                  <div className="py-4">
                    <p className="text-base text-gray-900 mb-1">Your cart is empty</p>
                    <p className="text-sm text-gray-500">Add items to get started</p>
                  </div>
                }
              >
                <Link to="/products">
                  <Button 
                    type="primary" 
                    size="large" 
                    icon={<ShoppingOutlined />} 
                    style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
                    className="mt-4"
                  >
                    Browse Products
                  </Button>
                </Link>
              </Empty>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {items.map((item) => (
                    <div 
                      key={item.product_id} 
                      className="pb-6 border-b border-gray-200 last:border-0"
                    >
                      <div className="flex gap-6">
                        {/* Product Details */}
                        <div className="flex-1">
                          <Link 
                            to={`/product/${item.product_id}`} 
                            className="text-base font-medium text-gray-900 hover:text-gray-600 transition-colors"
                          >
                            {item.product_name}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">{item.sku}</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {item.stock_quantity} in stock
                          </p>

                          {/* Mobile Price */}
                          <div className="mt-4 lg:hidden">
                            <p className="text-lg font-medium text-gray-900">
                              Rs. {parseFloat(item.final_price || 0).toFixed(2)}
                            </p>
                            {item.discount > 0 && (
                              <p className="text-sm text-gray-500 mt-1">
                                Save Rs. {parseFloat(item.discount || 0).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Quantity & Price */}
                        <div className="flex flex-col items-end gap-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <MinusOutlined className="text-xs" />
                            </button>
                            <span className="text-sm font-medium min-w-[30px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock_quantity}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <PlusOutlined className="text-xs" />
                            </button>
                          </div>

                          {/* Desktop Price */}
                          <div className="hidden lg:block text-right">
                            <p className="text-base font-medium text-gray-900">
                              Rs. {parseFloat(item.final_price || 0).toFixed(2)}
                            </p>
                            {item.discount > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                -Rs. {parseFloat(item.discount || 0).toFixed(2)}
                              </p>
                            )}
                          </div>

                          {/* Remove */}
                          <button
                            onClick={() => handleRemove(item.product_id)}
                            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Continue Shopping */}
                <Link to="/products">
                  <Button 
                    size="large" 
                    className="mt-8 w-full lg:w-auto"
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="border border-gray-200 rounded p-6 sticky top-24">
                  <h2 className="text-lg font-medium mb-6 text-gray-900">Summary</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">
                        Rs. {parseFloat(summary.subtotal || 0).toFixed(2)}
                      </span>
                    </div>
                    
                    {summary.discount_amount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount</span>
                        <span className="text-gray-900">
                          -Rs. {parseFloat(summary.discount_amount || 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    <Divider className="my-4" />
                    
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">Total</span>
                      <span className="font-medium text-gray-900 text-xl">
                        Rs. {parseFloat(summary.total || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    className="w-full mb-3"
                    onClick={() => navigate('/checkout')}
                    style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
                  >
                    Checkout
                  </Button>

                  <p className="text-xs text-gray-400 text-center mt-4">
                    Shipping calculated at checkout
                  </p>
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
