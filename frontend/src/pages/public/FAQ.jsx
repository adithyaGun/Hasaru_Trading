import { useState } from 'react';
import { Collapse } from 'antd';
import { 
  HelpCircle, 
  Package, 
  Truck, 
  CreditCard, 
  RefreshCw, 
  Shield,
  ChevronDown
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const { Panel } = Collapse;

const FAQ = () => {
  const faqCategories = [
    {
      icon: Package,
      title: 'Products & Inventory',
      color: 'from-red-500 to-red-600',
      faqs: [
        {
          question: 'What types of products do you sell?',
          answer: 'We offer a comprehensive range of automotive parts including tires, batteries, brake pads, filters, engine parts, transmission components, suspension parts, and various accessories. Our inventory includes products for cars, trucks, SUVs, and commercial vehicles.'
        },
        {
          question: 'Are your products genuine or aftermarket?',
          answer: 'We offer both genuine OEM (Original Equipment Manufacturer) parts and high-quality aftermarket alternatives. All products come from reputable suppliers and meet or exceed industry standards. Product descriptions clearly indicate whether items are OEM or aftermarket.'
        },
        {
          question: 'Do you have products in stock?',
          answer: 'Most of our listed products are in stock and ready for immediate dispatch. Stock availability is shown on each product page. If an item is out of stock, you can contact us for expected restock dates or alternative options.'
        },
        {
          question: 'Can you help me find the right part for my vehicle?',
          answer: 'Absolutely! Our expert team can help you identify the correct parts for your specific vehicle make and model. Contact us with your vehicle details (year, make, model) and we\'ll guide you to the right products.'
        }
      ]
    },
    {
      icon: CreditCard,
      title: 'Orders & Payment',
      color: 'from-blue-500 to-blue-600',
      faqs: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept multiple payment methods including Cash on Delivery (COD), Bank Transfer, and Credit/Debit Cards. All online transactions are secure and encrypted for your safety.'
        },
        {
          question: 'How do I place an order?',
          answer: 'Simply browse our products, add items to your cart, and proceed to checkout. You\'ll need to provide shipping information and select a payment method. Once confirmed, you\'ll receive an order confirmation email with tracking details.'
        },
        {
          question: 'Can I modify or cancel my order?',
          answer: 'You can modify or cancel your order within 2 hours of placement by contacting our customer service. Once the order is being processed or shipped, modifications may not be possible.'
        },
        {
          question: 'Do you offer bulk discounts?',
          answer: 'Yes! We offer special pricing for bulk orders and wholesale customers. Contact our sales team with your requirements for a customized quote.'
        }
      ]
    },
    {
      icon: Truck,
      title: 'Shipping & Delivery',
      color: 'from-green-500 to-green-600',
      faqs: [
        {
          question: 'What are your delivery times?',
          answer: 'Standard delivery typically takes 2-5 business days depending on your location. Express delivery (1-2 days) is available for urgent orders. Delivery times are estimated and may vary based on stock availability and destination.'
        },
        {
          question: 'Do you ship nationwide?',
          answer: 'Yes, we deliver to all regions across Sri Lanka. Shipping costs are calculated based on your location and order weight at checkout.'
        },
        {
          question: 'How can I track my order?',
          answer: 'Once your order is shipped, you\'ll receive a tracking number via email. You can also track your order status by logging into your account and visiting the "My Orders" section.'
        },
        {
          question: 'What if I\'m not home during delivery?',
          answer: 'Our delivery partner will attempt to contact you. If you\'re unavailable, they\'ll either leave a notice or attempt redelivery. You can also arrange to pick up from a nearby collection point.'
        }
      ]
    },
    {
      icon: RefreshCw,
      title: 'Returns & Exchanges',
      color: 'from-orange-500 to-orange-600',
      faqs: [
        {
          question: 'What is your return policy?',
          answer: 'We offer a 30-day return policy for unused, unopened products in their original packaging. Certain items like electrical components may have specific return conditions. Please check the product page or contact us for details.'
        },
        {
          question: 'How do I return a product?',
          answer: 'Contact our customer service team to initiate a return. We\'ll provide you with return instructions and a return authorization number. Once we receive and inspect the returned item, we\'ll process your refund or exchange.'
        },
        {
          question: 'What if I receive a defective product?',
          answer: 'We\'re sorry if you received a defective item! Contact us immediately with photos of the defect. We\'ll arrange for a replacement or full refund at no additional cost to you, including return shipping.'
        },
        {
          question: 'How long does it take to process a refund?',
          answer: 'Refunds are typically processed within 3-5 business days after we receive and inspect the returned item. The refund will be credited to your original payment method.'
        }
      ]
    },
    {
      icon: Shield,
      title: 'Warranty & Quality',
      color: 'from-purple-500 to-purple-600',
      faqs: [
        {
          question: 'Do your products come with warranties?',
          answer: 'Yes, most of our products come with manufacturer warranties ranging from 6 months to 2 years depending on the product type. Warranty details are specified on each product page.'
        },
        {
          question: 'How do I claim warranty?',
          answer: 'To claim warranty, contact us with your order number and details of the issue. We\'ll guide you through the warranty claim process with the manufacturer. Keep your purchase receipt as proof of purchase.'
        },
        {
          question: 'Are your products quality tested?',
          answer: 'Yes, all products undergo quality checks before shipping. We source from reputable manufacturers and authorized distributors to ensure authenticity and quality.'
        },
        {
          question: 'What if the product doesn\'t fit my vehicle?',
          answer: 'If you purchased the wrong part, contact us within 7 days. We offer exchanges for the correct part (subject to stock availability) or a refund. The product must be unused and in original packaging.'
        }
      ]
    },
    {
      icon: HelpCircle,
      title: 'Account & Support',
      color: 'from-gray-700 to-gray-900',
      faqs: [
        {
          question: 'Do I need an account to place an order?',
          answer: 'While you can browse products without an account, we recommend creating one for easier checkout, order tracking, and access to exclusive deals and promotions.'
        },
        {
          question: 'How do I reset my password?',
          answer: 'Click on "Forgot Password" on the login page and enter your registered email. You\'ll receive a password reset link. If you don\'t receive it, check your spam folder or contact support.'
        },
        {
          question: 'Is my personal information secure?',
          answer: 'Absolutely! We use industry-standard encryption and security measures to protect your personal and payment information. We never share your data with third parties without your consent.'
        },
        {
          question: 'How can I contact customer support?',
          answer: 'You can reach us via email at support@hasarutrading.com, call us at +94 11 234 5678, or use the contact form on our website. Our support team is available Monday-Saturday, 8 AM - 6 PM.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-black via-red-950 to-red-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGg3djFoLTd2LTF6bS0yLTFoMXYyaC0xdi0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-red-600/20 backdrop-blur-sm border border-red-500/30 rounded-full px-4 py-2 mb-8">
              <HelpCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-100">Frequently Asked Questions</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              How Can We
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
                Help You?
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 leading-relaxed">
              Find answers to commonly asked questions about our products, services, and policies.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-3xl shadow-lg overflow-hidden">
                <div className={`bg-gradient-to-r ${category.color} p-8 text-white`}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <category.icon className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold">{category.title}</h2>
                  </div>
                </div>

                <div className="p-8">
                  <Collapse
                    bordered={false}
                    className="bg-white"
                    expandIcon={({ isActive }) => (
                      <ChevronDown 
                        className={`w-5 h-5 text-red-600 transition-transform ${isActive ? 'rotate-180' : ''}`}
                      />
                    )}
                    expandIconPosition="end"
                  >
                    {category.faqs.map((faq, faqIndex) => (
                      <Panel
                        key={faqIndex}
                        header={
                          <span className="text-lg font-semibold text-gray-800">
                            {faq.question}
                          </span>
                        }
                        className="mb-4 !border-2 !border-gray-100 hover:!border-red-200 !rounded-xl overflow-hidden transition-all"
                      >
                        <p className="text-gray-600 leading-relaxed pl-4">
                          {faq.answer}
                        </p>
                      </Panel>
                    ))}
                  </Collapse>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-20 bg-gradient-to-br from-black via-red-950 to-red-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <HelpCircle className="w-20 h-20 mx-auto mb-6 text-red-400" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Still Have Questions?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Can't find the answer you're looking for? Our customer support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact">
              <button className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl">
                Contact Support
              </button>
            </a>
            <a href="tel:+94112345678">
              <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border-2 border-white/20 backdrop-blur-sm transition-all">
                Call Us Now
              </button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
