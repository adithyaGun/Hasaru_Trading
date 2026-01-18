import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { Badge, Button, Dropdown } from 'antd';
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const userMenuItems = [
    {
      key: 'dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      label: 'Dashboard',
      onClick: () => navigate(`/${user?.role}`),
    },
    {
      key: 'logout',
      icon: <LogOut className="w-4 h-4" />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-red-600">
              Hasaru Trading
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-red-600 font-medium transition">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-red-600 font-medium transition">
              Products
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart">
              <Badge count={cartItemCount} showZero>
                <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-red-600 cursor-pointer transition-colors" />
              </Badge>
            </Link>

            {/* User Menu or Login */}
            {isAuthenticated ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div className="flex items-center space-x-2 cursor-pointer hover:text-red-600">
                  <User className="w-5 h-5" />
                  <span className="font-medium">{user?.name}</span>
                </div>
              </Dropdown>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button type="default">Login</Button>
                </Link>
                <Link to="/register">
                  <Button type="primary">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
