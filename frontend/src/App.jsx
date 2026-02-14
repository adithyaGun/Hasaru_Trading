import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Public pages
import Home from './pages/public/Home';
import Products from './pages/public/Products';
import ProductDetail from './pages/public/ProductDetail';
import Cart from './pages/public/Cart';
import Checkout from './pages/public/Checkout';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import FAQ from './pages/public/FAQ';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminSuppliers from './pages/admin/Suppliers';
import AdminPurchases from './pages/admin/Purchases';
import AdminReports from './pages/admin/Reports';
import AdminAnalytics from './pages/admin/Analytics';
import AdminAlerts from './pages/admin/Alerts';
import AdminProfile from './pages/admin/Profile';
import AdminUserManagement from './pages/admin/UserManagement';
import AdminPromotions from './pages/admin/Promotions';
import AdminPOSSales from './pages/admin/POSSales';
import AdminOnlineOrders from './pages/admin/OnlineOrders';

// Sales Staff pages
import SalesDashboard from './pages/sales/Dashboard';
import POSSale from './pages/sales/POSSale';
import OnlineOrders from './pages/sales/OnlineOrders';
import SalesHistory from './pages/sales/SalesHistory';

// Customer pages
import MyOrders from './pages/customer/MyOrders';
import Profile from './pages/customer/Profile';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import NotFound from './pages/NotFound';
import Chatbot from './components/Chatbot';

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Map role to correct path
  const getRolePath = (role) => {
    const roleToPath = {
      'admin': '/admin',
      'sales_staff': '/sales',
      'customer': '/customer'
    };
    return roleToPath[role] || `/${role}`;
  };

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
      
      {/* Auth routes - redirect if already logged in */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to={getRolePath(user?.role)} replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/customer" replace /> : <Register />} 
      />

      {/* Admin routes */}
      <Route path="/admin" element={<RoleBasedRoute allowedRoles={['admin']} />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="suppliers" element={<AdminSuppliers />} />
        <Route path="purchases" element={<AdminPurchases />} />
        <Route path="pos-sales" element={<AdminPOSSales />} />
        <Route path="online-orders" element={<AdminOnlineOrders />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="alerts" element={<AdminAlerts />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="users" element={<AdminUserManagement />} />
        <Route path="promotions" element={<AdminPromotions />} />
      </Route>

      {/* Sales Staff routes */}
      <Route path="/sales" element={<RoleBasedRoute allowedRoles={['sales_staff']} />}>
        <Route index element={<SalesDashboard />} />
        <Route path="pos" element={<POSSale />} />
        <Route path="orders" element={<OnlineOrders />} />
        <Route path="history" element={<SalesHistory />} />
      </Route>

      {/* Customer routes */}
      <Route path="/customer" element={<ProtectedRoute />}>
        <Route index element={<Navigate to="/customer/orders" replace />} />
        <Route path="orders" element={<MyOrders />} />
        <Route path="profile" element={<Profile />} />
      </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Chatbot - Available on all pages */}
      <Chatbot />
    </>
  );
}

export default App;
