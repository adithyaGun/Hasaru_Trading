import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Input, Button } from 'antd';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hello! 👋 Welcome to Hasaru Trading. How can I help you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickReplies = [
    { label: '🔍 Browse Products', value: 'browse' },
    { label: '📦 Order Status', value: 'order' },
    { label: '🚚 Shipping Info', value: 'shipping' },
    { label: '💳 Payment Methods', value: 'payment' },
    { label: '↩️ Returns Policy', value: 'returns' },
    { label: '📞 Contact Us', value: 'contact' },
  ];

  // Knowledge base with multiple responses per topic
  const knowledge = [
    {
      keys: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'sup', 'howdy'],
      responses: [
        "Hello! 👋 Great to see you at Hasaru Trading! How can I assist you today?",
        "Hi there! 😊 Welcome to Hasaru Trading. What can I help you with?",
        "Hey! Thanks for reaching out to Hasaru Trading. What are you looking for today?"
      ]
    },
    {
      keys: ['browse', 'products', 'catalog', 'shop', 'what do you sell', 'what you have', 'inventory'],
      responses: [
        "We carry a wide range of auto parts! 🔧\n\n• **Tires** – All sizes for cars, SUVs & trucks\n• **Batteries** – Amaron, Exide & more brands\n• **Brake Pads & Discs** – Premium quality\n• **Engine Oil & Filters** – All types\n• **Wipers, Spark Plugs & more**\n\nVisit our [Products](/products) page to browse the full catalog!",
        "Great question! Here's what we stock:\n\n🛞 Tires (all vehicle types)\n🔋 Car Batteries\n🛑 Brake Components\n⚙️ Engine & Transmission Parts\n🔌 Electrical Parts\n\nHead to our Products page to see everything with prices!"
      ]
    },
    {
      keys: ['tire', 'tyre', 'wheel', 'rim'],
      responses: [
        "We stock a great selection of tires! 🛞\n\nBrands available: Bridgestone, Apollo, Michelin, MRF & more.\n\nTell me your vehicle type or tire size (e.g. 185/65 R15) and I can help narrow it down. Or browse all tires on our [Products](/products) page!",
        "Tires are one of our top categories! 🛞 We carry:\n\n• Passenger car tires\n• SUV & 4x4 tires\n• Commercial vehicle tires\n\nBrands: Bridgestone, Michelin, Apollo & more. Visit the Products page to shop!"
      ]
    },
    {
      keys: ['battery', 'batteries', 'car battery', 'dead battery'],
      responses: [
        "We stock quality car batteries! 🔋\n\nBrands: Amaron, Exide, Luminous.\n\nPrices start from Rs. 8,000 depending on your vehicle. We can also help you find the right battery for your car's make and model!",
        "Looking for a battery? 🔋 We have great options!\n\n• Amaron (most popular)\n• Exide (reliable & long-lasting)\n\nCheck our Products page or let me know your vehicle model and I'll advise the correct one!"
      ]
    },
    {
      keys: ['brake', 'brake pad', 'disk', 'disc', 'brake disc', 'rotor'],
      responses: [
        "We carry premium brake components! 🛑\n\n• Brake Pads (ceramic & semi-metallic)\n• Brake Discs / Rotors\n• Brake Fluid\n\nBrands: Bosch, Brembo, Toyota Genuine. Check the Products page for availability and pricing!",
      ]
    },
    {
      keys: ['oil', 'engine oil', 'lubricant', 'motor oil', 'castrol', 'mobil'],
      responses: [
        "We stock a range of engine oils and lubricants! 🛢️\n\nBrands: Castrol, Mobil, Shell Helix, Havoline.\n\nAvailable in 5W-30, 10W-40 & more viscosities. Check our Products page for current prices!",
      ]
    },
    {
      keys: ['spark plug', 'ignition', 'filter', 'air filter', 'oil filter', 'wiper', 'wiper blade'],
      responses: [
        "Yes, we stock those! 🔧 Spark plugs, filters (oil, air, fuel), wiper blades and more. Visit our Products page to see full availability and pricing.",
      ]
    },
    {
      keys: ['price', 'cost', 'how much', 'rate', 'pricing', 'cheap', 'affordable', 'discount', 'offer', 'promo'],
      responses: [
        "Our prices are very competitive! 💰\n\nExample pricing:\n• Tires from Rs. 5,000\n• Batteries from Rs. 8,000\n• Brake Pads from Rs. 2,500\n• Engine Oil from Rs. 1,800\n\nWe also run regular promotions! Visit the Products page for live pricing.",
        "We offer great value! 💰 Prices vary by product and brand. Check the Products page for current pricing — we also run regular discounts and promotions for registered members!"
      ]
    },
    {
      keys: ['order', 'my order', 'track', 'tracking', 'order status', 'where is my order', 'order number'],
      responses: [
        "To track your order: 📦\n\n1. Log into your account\n2. Click your name in the top right\n3. Go to **My Orders**\n4. Find your order and check its status\n\nOr contact us at **+94 11 234 5678** with your order number!",
        "Here's how to check your order status: 📦\n\n• Log in → My Orders → find your order\n• Status updates: Processing → Shipped → Delivered\n\nYou'll also receive email notifications at each stage. Need help? Call +94 11 234 5678."
      ]
    },
    {
      keys: ['shipping', 'delivery', 'deliver', 'courier', 'how long', 'how many days', 'dispatch'],
      responses: [
        "Shipping info: 🚚\n\n• **Standard Delivery**: 2–5 business days\n• **Express Delivery**: 1–2 business days\n• Available **island-wide** across Sri Lanka\n\nShipping cost is calculated at checkout based on your location and order weight.",
        "We deliver across all of Sri Lanka! 🚚\n\n📍 Standard: 2–5 business days\n⚡ Express: 1–2 business days\n\nShipping fees are shown at checkout. Free shipping may apply on larger orders — check current promotions!"
      ]
    },
    {
      keys: ['payment', 'pay', 'cash', 'card', 'credit', 'debit', 'bank transfer', 'cod', 'cash on delivery'],
      responses: [
        "We accept these payment methods: 💳\n\n• **Cash on Delivery (COD)** – pay when you receive\n• **Bank Transfer** – transfer to our account\n• **Credit/Debit Card** – Visa & Mastercard\n\nAll online payments are secure and encrypted.",
        "Payment options available: 💳\n\n✅ Cash on Delivery\n✅ Bank Transfer\n✅ Credit/Debit Card\n\nSelect your preferred method at checkout. COD is most popular for local orders!"
      ]
    },
    {
      keys: ['return', 'refund', 'exchange', 'wrong part', 'defective', 'damaged', 'faulty'],
      responses: [
        "Our return policy: ↩️\n\n• **30-day returns** on unused, unopened items\n• **Defective items**: contact us immediately for free replacement\n• Refunds processed within **3–5 business days**\n\nContact support@hasarutrading.com to start a return.",
        "Returns & refunds: ↩️\n\n📦 Unused items: returnable within 30 days\n🔧 Defective/wrong item: we'll replace at no cost\n💰 Refund: 3–5 business days to original payment method\n\nCall +94 11 234 5678 or email support@hasarutrading.com to initiate."
      ]
    },
    {
      keys: ['warranty', 'guarantee', 'warrantee'],
      responses: [
        "All our products come with manufacturer warranties! 🛡️\n\n• **Tires**: 12–24 months\n• **Batteries**: 12–18 months\n• **Brake Pads**: 6–12 months\n\nIf you have a warranty issue, contact us with your order number and we'll handle it quickly.",
      ]
    },
    {
      keys: ['register', 'sign up', 'create account', 'new account', 'account'],
      responses: [
        "Creating an account is easy! 👤\n\n1. Click **Sign Up** in the top right corner\n2. Fill in your name, email & password\n3. Verify your email\n4. Start shopping!\n\nBenefits: order tracking, saved addresses, member discounts.",
      ]
    },
    {
      keys: ['login', 'log in', 'sign in', 'forgot password', 'reset password', 'can\'t login', 'password'],
      responses: [
        "To log in, click the **Login** button at the top right. 🔐\n\nForgot your password? Click **Forgot Password** on the login page and we'll send a reset link to your email.",
      ]
    },
    {
      keys: ['cart', 'add to cart', 'checkout', 'buy', 'purchase', 'how to order', 'how to buy'],
      responses: [
        "Here's how to place an order: 🛒\n\n1. Browse Products and click **Add to Cart**\n2. Review your cart\n3. Click **Checkout**\n4. Fill in shipping details\n5. Select payment method\n6. Confirm your order!\n\nYou'll get an email confirmation instantly.",
      ]
    },
    {
      keys: ['contact', 'support', 'help', 'reach', 'phone', 'email', 'whatsapp', 'call'],
      responses: [
        "You can reach us here: 📞\n\n📧 Email: support@hasarutrading.com\n📞 Phone: +94 11 234 5678\n📱 Mobile: +94 77 123 4567\n⏰ Hours: Mon–Sat, 8AM–6PM\n\nOr visit our [Contact](/contact) page!",
        "Our support team is ready to help! 💬\n\n• Phone: +94 11 234 5678\n• Email: support@hasarutrading.com\n• Available Mon–Sat, 8AM–6PM\n\nYou can also visit us in person at 123 Auto Parts Street, Colombo."
      ]
    },
    {
      keys: ['location', 'address', 'where are you', 'store', 'showroom', 'visit', 'open', 'hours', 'opening'],
      responses: [
        "Find us here: 📍\n\n🏢 123 Auto Parts Street, Colombo 10100\n⏰ Mon–Fri: 8AM–6PM\n⏰ Saturday: 9AM–4PM\n❌ Sunday: Closed\n\nFeel free to visit — our team is happy to help in person!",
      ]
    },
    {
      keys: ['brand', 'brands', 'bridgestone', 'michelin', 'bosch', 'exide', 'amaron', 'castrol', 'apollo'],
      responses: [
        "We carry top brands! 🏆\n\n🛞 Tires: Bridgestone, Michelin, Apollo, MRF\n🔋 Batteries: Amaron, Exide\n🛑 Brakes: Bosch, Brembo\n🛢️ Oils: Castrol, Mobil, Shell\n\nAll products are authentic and sourced from authorized distributors.",
      ]
    },
    {
      keys: ['thank', 'thanks', 'thank you', 'appreciate', 'helpful', 'great', 'awesome', 'good', 'nice'],
      responses: [
        "You're welcome! 😊 Happy to help anytime. Is there anything else I can assist you with?",
        "Glad I could help! 🎉 Feel free to ask if you have more questions. Have a great day!",
        "No problem at all! 👍 Don't hesitate to reach out if you need anything else."
      ]
    },
    {
      keys: ['bye', 'goodbye', 'see you', 'take care', 'cya'],
      responses: [
        "Goodbye! 👋 Thanks for visiting Hasaru Trading. Drive safe!",
        "See you later! 😊 Come back anytime. We're here to help!"
      ]
    },
  ];

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const getBotResponse = (text) => {
    const lower = text.toLowerCase().trim();

    for (const entry of knowledge) {
      if (entry.keys.some(k => lower.includes(k))) {
        return pick(entry.responses);
      }
    }

    // Fallback with suggestions
    return "I'm not sure about that, but here's what I can help with:\n\n• Product info & pricing\n• Order tracking\n• Shipping & delivery\n• Payments & returns\n• Contact & store hours\n\nTry rephrasing your question, or contact us at **+94 11 234 5678**! 😊";
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (messageText = inputMessage, isQuickReply = false) => {
    const text = isQuickReply
      ? quickReplies.find(q => q.value === messageText)?.label?.replace(/^[^\w]+/, '').trim()
      : messageText;

    if (!text?.trim()) return;

    const userMsg = {
      type: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    const delay = 600 + Math.random() * 600;
    setTimeout(() => {
      const lookupText = isQuickReply ? messageText : messageText;
      const botMsg = {
        type: 'bot',
        text: getBotResponse(lookupText),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, delay);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-2xl hover:shadow-red-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        >
          <MessageCircle className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Bot className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Hasaru Assistant</h3>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span>Online – always here to help</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'bot'
                    ? 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {message.type === 'bot' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'} max-w-[78%]`}>
                  <div className={`px-4 py-3 rounded-2xl ${
                    message.type === 'bot'
                      ? 'bg-white border border-gray-200 text-gray-800'
                      : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 px-2">{message.time}</span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl">
                  <div className="flex gap-1 items-center h-5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Replies – show after first bot message only */}
            {messages.length === 1 && !isTyping && (
              <div className="flex flex-wrap gap-2 pt-1">
                {quickReplies.map((reply) => (
                  <button
                    key={reply.value}
                    onClick={() => handleSendMessage(reply.value, true)}
                    className="px-3 py-1.5 bg-white border-2 border-red-200 text-red-600 rounded-full text-xs font-medium hover:bg-red-50 hover:border-red-300 transition-all"
                  >
                    {reply.label}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onPressEnter={() => handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 !rounded-full !h-11 !px-5"
              />
              <Button
                type="primary"
                onClick={() => handleSendMessage()}
                className="!h-11 !w-11 !rounded-full !bg-red-600 hover:!bg-red-700 !p-0 flex items-center justify-center"
                icon={<Send className="w-4 h-4" />}
              />
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              Ask about products, orders, shipping & more
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
