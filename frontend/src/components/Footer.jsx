import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white text-2xl font-bold mb-4">Hasaru Trading</h3>
            <p className="text-gray-400 mb-4">
              Your trusted partner for quality tires and auto parts. We provide comprehensive solutions for all your automotive needs.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+94 XX XXX XXXX</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>info@hasarutrading.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Colombo, Sri Lanka</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-red-400 transition">Home</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-red-400 transition">Products</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-red-400 transition">Cart</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/customer" className="hover:text-red-400 transition">My Account</Link>
              </li>
              <li>
                <Link to="/customer/orders" className="hover:text-red-400 transition">Order History</Link>
              </li>
              <li>
                <a href="#" className="hover:text-red-400 transition">Help & Support</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
          <p>&copy; 2024 Hasaru Trading. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
