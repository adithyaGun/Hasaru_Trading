# Tire & Auto Parts Management System - Backend API

A comprehensive backend system for managing tire and auto parts inventory, sales (online & OTC), purchasing, and analytics.

## Features

- **Dual Sales System**: Online sales & Over-the-counter (OTC) sales
- **Inventory Management**: Real-time stock tracking with auto-updates
- **Purchase Orders**: Complete PO workflow with supplier management
- **Low Stock Alerts**: Email notifications and dashboard alerts
- **Sales Reports**: Daily, weekly, monthly reports with profit calculations
- **Analytics**: Top selling items, fast/slow moving items analysis
- **Promotions**: Discount management system
- **Role-based Access**: Admin, Sales Staff, Customer roles

## Tech Stack

- Node.js (v20.x)
- Express.js
- MySQL
- JWT Authentication
- Nodemailer

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE tire_auto_parts_db;

# Import schema
mysql -u root -p tire_auto_parts_db < database/schema.sql

# Insert sample data (optional)
mysql -u root -p tire_auto_parts_db < database/seed.sql
```

### 3. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Run the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `GET /api/products/low-stock` - Get low stock products (Admin/Staff)

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create supplier (Admin)
- `PUT /api/suppliers/:id` - Update supplier (Admin)

### Purchases
- `GET /api/purchases` - Get all purchase orders
- `POST /api/purchases` - Create purchase order (Admin)
- `PUT /api/purchases/:id/approve` - Approve PO (Admin)
- `PUT /api/purchases/:id/receive` - Receive goods (Admin/Staff)

### Online Sales
- `POST /api/sales/online/cart` - Add to cart (Customer)
- `GET /api/sales/online/cart` - Get cart (Customer)
- `POST /api/sales/online/checkout` - Checkout (Customer)
- `GET /api/sales/online/orders` - Get customer orders (Customer)
- `PUT /api/sales/online/orders/:id/status` - Update order status (Admin/Staff)

### OTC Sales
- `POST /api/sales/otc` - Create OTC sale (Staff)
- `GET /api/sales/otc` - Get all OTC sales (Staff/Admin)
- `GET /api/sales/otc/:id/invoice` - Generate invoice (Staff/Admin)

### Reports
- `GET /api/reports/sales/daily` - Daily sales report
- `GET /api/reports/sales/weekly` - Weekly sales report
- `GET /api/reports/sales/monthly` - Monthly sales report
- `GET /api/reports/profit` - Profit report (Admin)

### Analytics
- `GET /api/analytics/top-selling` - Top selling items
- `GET /api/analytics/fast-moving` - Fast moving items
- `GET /api/analytics/slow-moving` - Slow moving items

### Alerts
- `GET /api/alerts/low-stock` - Get low stock alerts (Admin)
- `PUT /api/alerts/:id/acknowledge` - Acknowledge alert (Admin)

### Promotions
- `GET /api/promotions` - Get active promotions
- `POST /api/promotions` - Create promotion (Admin)
- `PUT /api/promotions/:id` - Update promotion (Admin)
- `DELETE /api/promotions/:id` - Delete promotion (Admin)

## Project Structure

```
backend/
├── config/
│   ├── db.js              # Database connection
│   ├── email.js           # Email configuration
│   └── constants.js       # App constants
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── supplierController.js
│   ├── purchaseController.js
│   ├── onlineSalesController.js
│   ├── otcSalesController.js
│   ├── reportController.js
│   ├── analyticsController.js
│   ├── alertController.js
│   └── promotionController.js
├── middleware/
│   ├── auth.js            # JWT authentication
│   ├── roleCheck.js       # Role-based access
│   ├── errorHandler.js    # Error handling
│   └── validator.js       # Input validation
├── models/
│   └── db/                # Raw SQL queries
├── routes/
│   ├── auth.js
│   ├── products.js
│   ├── suppliers.js
│   ├── purchases.js
│   ├── onlineSales.js
│   ├── otcSales.js
│   ├── reports.js
│   ├── analytics.js
│   ├── alerts.js
│   └── promotions.js
├── services/
│   ├── authService.js
│   ├── productService.js
│   ├── supplierService.js
│   ├── purchaseService.js
│   ├── salesService.js
│   ├── stockService.js
│   ├── reportService.js
│   ├── analyticsService.js
│   ├── alertService.js
│   ├── emailService.js
│   └── promotionService.js
├── utils/
│   ├── logger.js          # Winston logger
│   └── helpers.js         # Helper functions
├── database/
│   ├── schema.sql         # Database schema
│   └── seed.sql           # Sample data
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── README.md
```

## Database Schema

See `database/schema.sql` for complete database structure.

## Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- Role-based access control
- Rate limiting on API endpoints
- Helmet.js security headers
- CORS protection
- Input validation and sanitization

## License

ISC
