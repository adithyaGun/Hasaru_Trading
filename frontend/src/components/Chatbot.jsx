import { useState } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Input, Button } from 'antd';

const { TextArea } = Input;

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

  const quickReplies = [
    { label: 'Product Inquiry', value: 'product' },
    { label: 'Order Status', value: 'order' },
    { label: 'Shipping Info', value: 'shipping' },
    { label: 'Contact Support', value: 'support' }
  ];

  const botResponses = {
    product: "I'd be happy to help you find the right auto parts! You can browse our extensive catalog at the Products page, or tell me what specific part you're looking for (e.g., tires, batteries, brake pads).",
    order: "To check your order status, please log in to your account and visit 'My Orders'. You can also contact our support team at +94 11 234 5678 with your order number.",
    shipping: "We offer nationwide delivery across Sri Lanka! Standard delivery takes 2-5 business days. Express delivery (1-2 days) is also available. Shipping costs are calculated at checkout based on your location.",
    support: "You can reach our customer support team:\n📧 Email: support@hasarutrading.com\n📞 Phone: +94 11 234 5678\n⏰ Hours: Mon-Sat, 8 AM - 6 PM\nOr visit our Contact page for more options!",
    default: "Thank you for your message! For specific inquiries, please contact our support team at support@hasarutrading.com or call +94 11 234 5678. We're here to help!"
  };

  const getKeywords = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('product') || lower.includes('tire') || lower.includes('battery') || lower.includes('part')) return 'product';
    if (lower.includes('order') || lower.includes('track') || lower.includes('status')) return 'order';
    if (lower.includes('ship') || lower.includes('deliver') || lower.includes('courier')) return 'shipping';
    if (lower.includes('contact') || lower.includes('support') || lower.includes('help')) return 'support';
    return 'default';
  };

  const handleSendMessage = (messageText = inputMessage, isQuickReply = false) => {
    if (!messageText.trim()) return;

    const newUserMessage = {
      type: 'user',
      text: isQuickReply ? quickReplies.find(q => q.value === messageText)?.label : messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');

    // Simulate bot response
    setTimeout(() => {
      const responseKey = isQuickReply ? messageText : getKeywords(messageText);
      const botMessage = {
        type: 'bot',
        text: botResponses[responseKey] || botResponses.default,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
    }, 800);
  };

  const handleQuickReply = (value) => {
    handleSendMessage(value, true);
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
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Bot className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Hasaru Assistant</h3>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span>Online</span>
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
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
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
                <div className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'} max-w-[75%]`}>
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

            {/* Quick Replies */}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {quickReplies.map((reply) => (
                  <button
                    key={reply.value}
                    onClick={() => handleQuickReply(reply.value)}
                    className="px-4 py-2 bg-white border-2 border-red-200 text-red-600 rounded-full text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-all"
                  >
                    {reply.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onPressEnter={() => handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 !rounded-full !h-12 !px-6"
              />
              <Button
                type="primary"
                onClick={() => handleSendMessage()}
                className="!h-12 !w-12 !rounded-full !bg-red-600 hover:!bg-red-700 !p-0 flex items-center justify-center"
                icon={<Send className="w-5 h-5" />}
              />
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              Powered by Hasaru Trading AI Assistant
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
