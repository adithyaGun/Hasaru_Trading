# Tire & Auto Parts Management System
## Complete Full-Stack Application

---

## Project Overview

A comprehensive Tire & Auto Parts Management System built with Node.js/Express backend and React/Vite frontend, featuring dual sales interfaces (online + OTC), inventory management, purchasing module, and role-based dashboards.

---

## System Architecture

### Backend (Node.js + Express + MySQL)
- **Location**: `backend/`
- **Port**: 5000
- **Database**: MySQL 8.0+
- **Architecture**: MVC with Service Layer

### Frontend (React + Vite)
- **Location**: `frontend/`
- **Port**: 5173
- **UI Libraries**: Ant Design (dashboards) + Tailwind CSS (landing pages)
- **State Management**: Redux Toolkit

---

## Quick Start Guide

### Prerequisites
- Node.js v20.x or higher
- MySQL 8.0 or higher
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your settings:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=hasaru_trading
   DB_PORT=3306
   
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=24h
   
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   EMAIL_FROM=noreply@hasarutrading.com
   
   NODE_ENV=development
   PORT=5000
   ```

4. **Create database and run schema**
   ```bash
   # Create database
   mysql -u root -p -e "CREATE DATABASE hasaru_trading;"
   
   # Run schema
   mysql -u root -p hasaru_trading < database/schema.sql
   
   # (Optional) Load sample data
   mysql -u root -p hasaru_trading < database/seed.sql
   ```

5. **Start backend server**
   ```bash
   npm start
   ```
   
   Backend will run on http://localhost:5000

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env`:
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   Frontend will run on http://localhost:5173

---

## Default Users (After Running seed.sql)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hasaru.com | Admin@123 |
| Sales Staff | sales@hasaru.com | Sales@123 |
| Customer | customer@hasaru.com | Customer@123 |

---

## System Features

### 1. Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Sales Staff, Customer)
- Secure password hashing with bcrypt
- Token refresh and session management

### 2. Product Management
- Complete CRUD operations for products
- Categories and brands organization
- Stock level tracking (quantity, reorder level, minimum stock)
- Product search by name, code, category, brand
- Low stock alert system

### 3. Inventory Management
- Real-time stock tracking
- Stock adjustment with audit logs
- Automatic low stock alerts via email
- Stock status reports
- Multi-location support (future enhancement)

### 4. Supplier Management
- Supplier CRUD operations
- Contact information management
- Supplier performance tracking
- Purchase history by supplier

### 5. Purchasing Module
- Purchase order creation
- Three-stage workflow: Draft → Approved → Received
- PO approval system (admin only)
- Goods receipt with automatic stock update
- Purchase history and reports

### 6. Online Sales (E-commerce)
- Shopping cart with session management
- Automatic promotion/discount application
- Order placement and tracking
- Order status workflow: Pending → Paid → Processing → Delivered
- Email notifications for order confirmation
- Customer order history

### 7. Over-the-Counter (OTC) Sales
- Quick product search (by name, code, barcode)
- Instant sales processing
- Invoice generation with unique numbers
- Cash handling and change calculation
- Daily sales reports
- Walk-in customer transactions

### 8. Promotions & Discounts
- Create promotions with percentage or fixed amount discounts
- Date-based activation (start_date to end_date)
- Product-specific or category-wide promotions
- Automatic application at checkout
- Active/inactive status management

### 9. Reports & Analytics
- **Sales Reports**: Daily, weekly, monthly aggregations
- **Profit Reports**: Revenue vs. cost analysis
- **Inventory Value**: Total stock valuation
- **Sales by Category**: Performance breakdown
- **Daily Sales Trend**: Time series data
- **Top Selling Products**: Best performers by quantity/revenue
- **Fast Moving Items**: High turnover products
- **Slow Moving Items**: Low turnover with recommendations
- **Inventory Turnover**: Efficiency metrics
- **Customer Analytics**: Purchase patterns

### 10. Alerts & Notifications
- Automatic low stock email alerts
- Alert dashboard with statistics
- Acknowledgment system
- Email notification for critical events

### 11. User Management
- User CRUD operations (admin only)
- Role assignment
- Profile management
- Password change functionality

---

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile (authenticated)
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/code/:code` - Get product by code
- `GET /api/products/categories` - Get all categories
- `GET /api/products/brands` - Get all brands
- `GET /api/products/low-stock` - Get low stock products
- `POST /api/products` - Create product (admin/staff)
- `PUT /api/products/:id` - Update product (admin/staff)
- `DELETE /api/products/:id` - Delete product (admin only)

### Shopping Cart
- `GET /api/sales/online/cart` - Get cart (customer)
- `POST /api/sales/online/cart` - Add to cart
- `PUT /api/sales/online/cart` - Update cart item
- `DELETE /api/sales/online/cart/:productId` - Remove from cart

### Online Orders
- `POST /api/sales/online/checkout` - Checkout (customer)
- `GET /api/sales/online/my-orders` - Get my orders (customer)
- `GET /api/sales/online/orders` - Get all orders (admin/staff)
- `GET /api/sales/online/orders/:id` - Get order details
- `PUT /api/sales/online/orders/:id/status` - Update order status (admin/staff)

### OTC Sales
- `GET /api/sales/otc/search` - Search products for POS
- `POST /api/sales/otc` - Create OTC sale (staff)
- `GET /api/sales/otc` - Get OTC sales (staff)
- `GET /api/sales/otc/:id` - Get sale details

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/:id` - Get supplier by ID
- `POST /api/suppliers` - Create supplier (admin/staff)
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier (admin only)

### Purchases
- `GET /api/purchases` - Get all purchase orders
- `GET /api/purchases/:id` - Get PO details
- `POST /api/purchases` - Create purchase order (admin/staff)
- `PUT /api/purchases/:id/approve` - Approve PO (admin only)
- `PUT /api/purchases/:id/receive` - Receive goods (admin/staff)

### Reports
- `GET /api/reports/sales` - Sales report (with period filter)
- `GET /api/reports/profit` - Profit report (admin only)
- `GET /api/reports/inventory-value` - Inventory valuation
- `GET /api/reports/sales/category` - Sales by category
- `GET /api/reports/sales/trend` - Daily sales trend

### Analytics
- `GET /api/analytics/top-selling` - Top selling products
- `GET /api/analytics/fast-moving` - Fast moving items
- `GET /api/analytics/slow-moving` - Slow moving items
- `GET /api/analytics/customers` - Customer analytics (admin only)
- `GET /api/analytics/inventory-turnover` - Inventory turnover

### Alerts
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/statistics` - Alert statistics
- `GET /api/alerts/dashboard` - Alert dashboard
- `PUT /api/alerts/:id/acknowledge` - Acknowledge alert

### Promotions
- `GET /api/promotions` - Get all promotions
- `GET /api/promotions/:id` - Get promotion details
- `GET /api/promotions/product/:productId` - Get promotions for product
- `POST /api/promotions` - Create promotion (admin only)
- `PUT /api/promotions/:id` - Update promotion (admin only)
- `DELETE /api/promotions/:id` - Delete promotion (admin only)

---

## Frontend Routes

### Public Routes
- `/` - Home page
- `/products` - Product listing
- `/product/:id` - Product details
- `/cart` - Shopping cart
- `/checkout` - Checkout
- `/login` - Login
- `/register` - Registration

### Customer Routes (Authenticated)
- `/customer` - Customer dashboard
- `/customer/orders` - Order history
- `/customer/profile` - Profile management

### Sales Staff Routes (sales_staff role)
- `/sales` - Sales dashboard
- `/sales/pos` - POS system for OTC sales
- `/sales/orders` - Manage online orders
- `/sales/history` - Sales history

### Admin Routes (admin role)
- `/admin` - Admin dashboard
- `/admin/products` - Product management
- `/admin/suppliers` - Supplier management
- `/admin/purchases` - Purchase order management
- `/admin/reports` - Reports
- `/admin/analytics` - Analytics
- `/admin/alerts` - Low stock alerts
- `/admin/users` - User management
- `/admin/promotions` - Promotion management

---

## Database Schema

### Core Tables (13 total)

1. **users** - System users (admin, sales_staff, customer)
2. **products** - Product catalog with stock information
3. **suppliers** - Supplier information
4. **purchases** - Purchase order headers
5. **purchase_items** - PO line items
6. **online_sales** - Online order headers
7. **otc_sales** - Over-the-counter sale headers
8. **sale_items** - Sale line items (shared by online and OTC)
9. **stock_logs** - Stock movement audit trail
10. **low_stock_alerts** - Low stock notifications
11. **cart** - Shopping cart items
12. **promotions** - Promotion definitions
13. **product_promotions** - Product-promotion relationships

### Key Database Features
- Foreign key constraints for referential integrity
- Composite indexes for query optimization
- Triggers for automatic low stock alert generation
- Views for common reporting queries

---

## Technology Stack

### Backend
- **Runtime**: Node.js v20.x
- **Framework**: Express.js 4.18
- **Database**: MySQL 8.0+ with mysql2 driver
- **Authentication**: JWT with bcryptjs
- **Validation**: express-validator
- **Email**: nodemailer
- **Logging**: Winston + Morgan
- **Security**: Helmet, CORS, express-rate-limit

### Frontend
- **Framework**: React 18.2
- **Build Tool**: Vite 5.0
- **State Management**: Redux Toolkit 2.0
- **Routing**: React Router v6.21
- **UI Components**: Ant Design 5.12 (dashboards)
- **Styling**: Tailwind CSS 3.4 (landing pages)
- **HTTP Client**: Axios 1.6
- **Charts**: Recharts 2.10
- **Notifications**: React Hot Toast 2.4
- **Date Handling**: dayjs 1.11

---

## Security Features

1. **Authentication**
   - JWT tokens with 24-hour expiration
   - Secure password hashing (bcrypt, 10 salt rounds)
   - Token-based session management

2. **Authorization**
   - Role-based middleware (adminOnly, staffOnly, customerOnly)
   - Route-level access control
   - Resource ownership validation

3. **API Security**
   - Helmet for security headers
   - CORS with whitelist
   - Rate limiting (100 requests/15 minutes)
   - Input validation and sanitization
   - SQL injection prevention (parameterized queries)

4. **Data Protection**
   - Password fields excluded from API responses
   - Sensitive data encryption in transit (HTTPS in production)
   - Environment variable protection

---

## Development Workflow

### Backend Development
```bash
cd backend
npm install
npm run dev    # Development with nodemon
npm start      # Production
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev    # Development with HMR
npm run build  # Production build
npm run preview # Preview production build
```

### Database Management
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE hasaru_trading;"

# Run schema
mysql -u root -p hasaru_trading < backend/database/schema.sql

# Seed data
mysql -u root -p hasaru_trading < backend/database/seed.sql

# Backup
mysqldump -u root -p hasaru_trading > backup.sql

# Restore
mysql -u root -p hasaru_trading < backup.sql
```

---

## Production Deployment

### Backend Deployment

1. **Set production environment variables**
2. **Use process manager** (PM2 recommended)
   ```bash
   npm install -g pm2
   pm2 start server.js --name "hasaru-backend"
   pm2 save
   pm2 startup
   ```
3. **Configure reverse proxy** (Nginx/Apache)
4. **Enable HTTPS** (Let's Encrypt)
5. **Database optimization** (connection pooling, indexes)

### Frontend Deployment

1. **Build for production**
   ```bash
   npm run build
   ```
2. **Deploy dist/ folder** to static hosting (Netlify, Vercel, S3)
3. **Configure API URL** in environment variables
4. **Set up CDN** for static assets

---

## Testing

### Backend Testing (Manual)
- Use Postman collection (can be generated from backend/README.md)
- Test authentication flow
- Verify role-based access
- Test stock deduction logic
- Validate low stock alert generation

### Frontend Testing
- Test user registration and login
- Verify cart functionality
- Test checkout process
- Validate role-based routing
- Check responsive design

---

## Project File Count

### Backend
- **Total Files**: 50+
- **Services**: 12 service files
- **Controllers**: 10 controller files
- **Routes**: 10 route files
- **Middleware**: 4 middleware files
- **Database**: 2 SQL files (schema + seed)

### Frontend
- **Total Files**: 40+
- **Pages**: 20+ page components
- **Components**: 10+ reusable components
- **Redux Slices**: 3 slices (auth, cart, products)
- **API Services**: 10 API service modules

---

## Performance Optimization

### Backend
- Connection pooling (10 connections)
- Query optimization with indexes
- Caching strategies (future enhancement)
- Rate limiting to prevent abuse

### Frontend
- Code splitting with React.lazy
- Vite's fast HMR
- Image optimization (future enhancement)
- Bundle size optimization

---

## Future Enhancements

1. **Backend**
   - Add unit tests (Jest)
   - Implement caching (Redis)
   - Add WebSocket for real-time notifications
   - Multi-warehouse support
   - Advanced reporting with PDF export
   - Barcode printing

2. **Frontend**
   - Add TypeScript for type safety
   - Implement E2E tests (Cypress)
   - PWA support for offline functionality
   - Advanced search with filters
   - Product image upload
   - Invoice PDF generation
   - Real-time stock updates

3. **Features**
   - Payment gateway integration
   - SMS notifications
   - Mobile app (React Native)
   - Advanced analytics dashboard
   - Customer loyalty program
   - Return/refund management

---

## Troubleshooting

### Backend Issues

**Database Connection Error**
- Verify MySQL is running
- Check credentials in `.env`
- Ensure database exists

**Port Already in Use**
- Change PORT in `.env`
- Kill process using port 5000

**JWT Token Invalid**
- Clear localStorage in browser
- Login again to get new token

### Frontend Issues

**CORS Error**
- Verify backend CORS allows `http://localhost:5173`
- Check API URL in `.env`

**API Not Found**
- Ensure backend is running on port 5000
- Check Vite proxy configuration

**Build Error**
- Clear `node_modules` and reinstall
- Check for syntax errors in components

---

## Support & Maintenance

### Logging
- Backend logs stored in `logs/` directory
- Winston for structured logging
- Morgan for HTTP request logging

### Monitoring
- Check `logs/error.log` for errors
- Monitor database connection pool
- Track API response times

### Backup Strategy
- Daily database backups
- Weekly full system backups
- Version control for code (Git)

---

## License

Proprietary - Hasaru Trading

---

## Contact

For technical support or inquiries:
- Email: dev@hasarutrading.com
- Phone: +94 XX XXX XXXX

---

## Version History

- **v1.0.0** (Current)
  - Initial release
  - Complete backend with 10 modules
  - Frontend with public pages and dashboards
  - Authentication and authorization
  - Dual sales system (online + OTC)
  - Inventory management
  - Reporting and analytics
  - Promotion system

---

**Built with ❤️ for Hasaru Trading**
