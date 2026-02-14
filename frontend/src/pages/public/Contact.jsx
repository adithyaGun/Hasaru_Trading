import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  MessageCircle,
  HeadphonesIcon
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const { TextArea } = Input;

const Contact = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Message sent successfully! We\'ll get back to you soon.');
      form.resetFields();
    } catch (error) {
      message.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-black via-red-950 to-red-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGg3djFoLTd2LTF6bS0yLTFoMXYyaC0xdi0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-red-600/20 backdrop-blur-sm border border-red-500/30 rounded-full px-4 py-2 mb-8">
              <MessageCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-100">Get In Touch</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              Contact
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
                Hasaru Trading
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 leading-relaxed">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  Whether you have a question about products, pricing, delivery, or anything else, 
                  our team is ready to answer all your questions.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4 p-6 rounded-2xl bg-white border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                      <MapPin className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Address</h3>
                    <p className="text-gray-600 leading-relaxed">
                      123 Auto Parts Street<br />
                      Colombo, Sri Lanka<br />
                      10100
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-6 rounded-2xl bg-white border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                      <Phone className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Phone</h3>
                    <p className="text-gray-600">
                      <a href="tel:+94112345678" className="hover:text-red-600 transition">
                        +94 11 234 5678
                      </a>
                    </p>
                    <p className="text-gray-600">
                      <a href="tel:+94771234567" className="hover:text-red-600 transition">
                        +94 77 123 4567
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-6 rounded-2xl bg-white border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                      <Mail className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Email</h3>
                    <p className="text-gray-600">
                      <a href="mailto:info@hasarutrading.com" className="hover:text-red-600 transition">
                        info@hasarutrading.com
                      </a>
                    </p>
                    <p className="text-gray-600">
                      <a href="mailto:support@hasarutrading.com" className="hover:text-red-600 transition">
                        support@hasarutrading.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-6 rounded-2xl bg-white border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Business Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Saturday: 9:00 AM - 4:00 PM</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 rounded-3xl border-2 border-gray-200 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Send us a Message</h3>
                  <p className="text-gray-500">We'll get back to you within 24 hours</p>
                </div>
              </div>

              <Form
                form={form}
                onFinish={onFinish}
                layout="vertical"
                size="large"
              >
                <Form.Item
                  name="name"
                  label="Full Name"
                  rules={[{ required: true, message: 'Please enter your name' }]}
                >
                  <Input placeholder="John Doe" />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input placeholder="john@example.com" />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[{ required: true, message: 'Please enter your phone number' }]}
                >
                  <Input placeholder="+94 XX XXX XXXX" />
                </Form.Item>

                <Form.Item
                  name="subject"
                  label="Subject"
                  rules={[{ required: true, message: 'Please enter a subject' }]}
                >
                  <Input placeholder="How can we help you?" />
                </Form.Item>

                <Form.Item
                  name="message"
                  label="Message"
                  rules={[{ required: true, message: 'Please enter your message' }]}
                >
                  <TextArea 
                    rows={5} 
                    placeholder="Tell us more about your inquiry..." 
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    className="w-full !h-12 !bg-red-600 hover:!bg-red-700"
                    icon={<Send className="w-4 h-4" />}
                  >
                    Send Message
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-0">
        <div className="w-full h-96 bg-gray-200 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
              <MapPin className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Find Us Here</h3>
              <p className="text-gray-600">123 Auto Parts Street, Colombo, Sri Lanka</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
