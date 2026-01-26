import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { Badge, Button, Dropdown } from 'antd';
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, Package, Settings, Heart } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setMobileMenuOpen(false);
  };

  const userMenuItems = [
    {
      key: 'dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      label: 'Dashboard',
      onClick: () => {
        navigate(`/${user?.role}`);
        setMobileMenuOpen(false);
      },
    },
    user?.role === 'customer' && {
      key: 'orders',
      icon: <Package className="w-4 h-4" />,
      label: 'My Orders',
      onClick: () => {
        navigate('/customer/orders');
        setMobileMenuOpen(false);
      },
    },
    user?.role === 'customer' && {
      key: 'profile',
      icon: <Settings className="w-4 h-4" />,
      label: 'Profile',
      onClick: () => {
        navigate('/customer/profile');
        setMobileMenuOpen(false);
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogOut className="w-4 h-4" />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ].filter(Boolean);

  return (
    <nav className="bg-gradient-to-r from-black via-red-950 to-black shadow-2xl sticky top-0 z-50 border-b border-red-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo with modern styling */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-red-600 blur-lg opacity-50 group-hover:opacity-75 transition-opacity rounded-full"></div>
              <div className="relative bg-gradient-to-br from-red-600 to-red-800 p-2.5 rounded-xl shadow-lg">
                <Package className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-white via-red-100 to-red-200 bg-clip-text text-transparent">
                Hasaru Trading
              </span>
              <span className="text-xs text-red-300 font-medium tracking-wider">
                AUTO PARTS & TIRES
              </span>
            </div>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className="px-4 py-2 text-white/90 hover:text-white font-medium transition-all duration-200 hover:bg-white/10 rounded-lg relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-600 to-red-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              to="/products" 
              className="px-4 py-2 text-white/90 hover:text-white font-medium transition-all duration-200 hover:bg-white/10 rounded-lg relative group"
            >
              Products
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-600 to-red-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              to="/about" 
              className="px-4 py-2 text-white/90 hover:text-white font-medium transition-all duration-200 hover:bg-white/10 rounded-lg relative group"
            >
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-600 to-red-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              to="/contact" 
              className="px-4 py-2 text-white/90 hover:text-white font-medium transition-all duration-200 hover:bg-white/10 rounded-lg relative group"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-600 to-red-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Cart with modern badge */}
            {isAuthenticated && user?.role === 'customer' && (
              <Link to="/cart" className="relative group">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-600 blur-md opacity-0 group-hover:opacity-50 transition-opacity rounded-full"></div>
                  <div className="relative p-2 hover:bg-white/10 rounded-lg transition-all duration-200">
                    <ShoppingCart className="w-6 h-6 text-white group-hover:scale-110 transition-transform" strokeWidth={2} />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg border-2 border-black">
                        {cartItemCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )}

            {/* User Menu or Login */}
            {isAuthenticated ? (
              <Dropdown 
                menu={{ items: userMenuItems }} 
                placement="bottomRight"
                trigger={['click']}
              >
                <div className="flex items-center space-x-2 px-3 py-2 cursor-pointer bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 group">
                  <div className="bg-gradient-to-br from-red-600 to-red-800 p-1.5 rounded-lg shadow-lg">
                    <User className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="font-medium text-white hidden sm:block">{user?.name?.split(' ')[0]}</span>
                  <div className="w-1 h-1 bg-red-400 rounded-full group-hover:w-2 transition-all duration-200"></div>
                </div>
              </Dropdown>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <button className="px-4 py-2 text-white font-medium hover:bg-white/10 rounded-lg transition-all duration-200 border border-white/20">
                    Login
                  </button>
                </Link>
                <Link to="/register">
                  <button className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-red-600/50 hover:scale-105 transform">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 backdrop-blur-md border-t border-white/10 pt-4 mt-2">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-all"
            >
              Home
            </Link>
            <Link 
              to="/products" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-all"
            >
              Products
            </Link>
            <Link 
              to="/about" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-all"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-all"
            >
              Contact
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
