import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, clearCart } from '../../store/slices/cartSlice';
import { ordersAPI } from '../../api';
import { Button, Form, Input, Radio, Card, Divider, message } from 'antd';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import toast from 'react-hot-toast';

const { TextArea } = Input;

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { items, summary } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        customer_name: user.name,
        customer_email: user.email,
        customer_phone: user.phone,
      });
    }
  }, [user, form]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await ordersAPI.checkout(values);
      
      if (response.data.success) {
        toast.success('Order placed successfully!');
        dispatch(clearCart());
        navigate('/customer/orders');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <Card title="Shipping Information">
                <Form
                  form={form}
                  onFinish={onFinish}
                  layout="vertical"
                  size="large"
                >
                  <Form.Item
                    name="customer_name"
                    label="Full Name"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                  >
                    <Input placeholder="John Doe" />
                  </Form.Item>

                  <Form.Item
                    name="customer_email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Please enter your email' },
                      { type: 'email', message: 'Please enter a valid email' },
                    ]}
                  >
                    <Input placeholder="john@example.com" />
                  </Form.Item>

                  <Form.Item
                    name="customer_phone"
                    label="Phone Number"
                    rules={[{ required: true, message: 'Please enter your phone' }]}
                  >
                    <Input placeholder="+94 XX XXX XXXX" />
                  </Form.Item>

                  <Form.Item
                    name="shipping_address"
                    label="Shipping Address"
                    rules={[{ required: true, message: 'Please enter shipping address' }]}
                  >
                    <TextArea rows={3} placeholder="Street address, City, Postal Code" />
                  </Form.Item>

                  <Divider />

                  <Form.Item
                    name="payment_method"
                    label="Payment Method"
                    rules={[{ required: true, message: 'Please select payment method' }]}
                    initialValue="cash_on_delivery"
                  >
                    <Radio.Group>
                      <Radio value="cash_on_delivery">Cash on Delivery</Radio>
                      <Radio value="bank_transfer">Bank Transfer</Radio>
                      <Radio value="card">Credit/Debit Card</Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    name="notes"
                    label="Order Notes (Optional)"
                  >
                    <TextArea rows={2} placeholder="Any special instructions..." />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      className="w-full"
                      loading={loading}
                    >
                      Place Order
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card title="Order Summary">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.product_id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.product_name} × {item.quantity}
                      </span>
                      <span>Rs. {parseFloat(item.final_price).toFixed(2)}</span>
                    </div>
                  ))}
                  
                  <Divider className="my-4" />
                  
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
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
