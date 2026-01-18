# Backend Setup Guide

## Prerequisites
- Node.js v20.x or higher
- MySQL 8.0 or higher
- npm

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup MySQL Database
```bash
# Login to MySQL
mysql -u root -p

# Create database and import schema
CREATE DATABASE tire_auto_parts_db;
USE tire_auto_parts_db;
source database/schema.sql;

# Optional: Import sample data
source database/seed.sql;
```

### 3. Configure Environment
```bash
# Copy example environment file
copy .env.example .env

# Edit .env file with your configuration
# - Update DB credentials
# - Set JWT secret
# - Configure email settings
```

### 4. Start Development Server
```bash
npm run dev
```

Server will start on `http://localhost:5000`

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected endpoints require Bearer token:
```
Authorization: Bearer <your_jwt_token>
```

### Available Endpoints

#### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /profile` - Get user profile (Protected)
- `PUT /profile` - Update profile (Protected)
- `PUT /change-password` - Change password (Protected)

#### Products (`/api/products`)
- `GET /` - Get all products (with filters)
- `GET /:id` - Get product by ID
- `GET /code/:code` - Get product by SKU/barcode
- `GET /categories` - Get all categories
- `GET /brands` - Get all brands
- `GET /low-stock` - Get low stock products (Staff)
- `GET /stock-status` - Get stock status (Staff)
- `POST /` - Create product (Admin)
- `PUT /:id` - Update product (Admin)
- `DELETE /:id` - Delete product (Admin)

#### Suppliers (`/api/suppliers`) - Admin Only
- `GET /` - Get all suppliers
- `GET /:id` - Get supplier by ID
- `POST /` - Create supplier
- `PUT /:id` - Update supplier
- `DELETE /:id` - Delete supplier

#### Purchases (`/api/purchases`)
- `GET /` - Get all purchase orders (Staff)
- `GET /:id` - Get PO by ID (Staff)
- `POST /` - Create PO (Admin)
- `PUT /:id/approve` - Approve PO (Admin)
- `PUT /:id/receive` - Receive goods (Staff)

#### Online Sales (`/api/sales/online`)
Cart:
- `POST /cart` - Add to cart (Customer)
- `GET /cart` - Get cart (Customer)
- `PUT /cart` - Update cart item (Customer)
- `DELETE /cart/:productId` - Remove from cart (Customer)

Orders:
- `POST /checkout` - Checkout (Customer)
- `GET /my-orders` - Get my orders (Customer)
- `GET /orders` - Get all orders (Staff)
- `GET /orders/:id` - Get order by ID (Staff)
- `PUT /orders/:id/status` - Update order status (Staff)

#### OTC Sales (`/api/sales/otc`) - Staff Only
- `GET /search?q=<term>` - Search products
- `POST /` - Create OTC sale
- `GET /` - Get all OTC sales
- `GET /:id` - Get sale by ID
- `GET /:id/invoice` - Generate invoice

#### Reports (`/api/reports`)
- `GET /sales` - Sales report (Staff)
- `GET /sales/category` - Sales by category (Staff)
- `GET /sales/trend` - Daily sales trend (Staff)
- `GET /inventory-value` - Inventory value (Staff)
- `GET /profit` - Profit report (Admin only)

Query params: `period=daily|weekly|monthly`, `start_date`, `end_date`

#### Analytics (`/api/analytics`)
- `GET /top-selling` - Top selling products (Staff)
- `GET /fast-moving` - Fast moving items (Staff)
- `GET /slow-moving` - Slow moving items (Staff)
- `GET /inventory-turnover` - Inventory turnover (Staff)
- `GET /customers` - Customer analytics (Admin)

Query params: `limit`, `period`, `start_date`, `end_date`

#### Alerts (`/api/alerts`)
- `GET /` - Get low stock alerts (Staff)
- `GET /statistics` - Get alert statistics (Staff)
- `GET /dashboard` - Get dashboard notifications (Staff)
- `PUT /:id/acknowledge` - Acknowledge alert (Admin)

#### Promotions (`/api/promotions`)
- `GET /` - Get all promotions (Public)
- `GET /:id` - Get promotion by ID (Public)
- `GET /product/:productId` - Get product promotions (Public)
- `POST /` - Create promotion (Admin)
- `PUT /:id` - Update promotion (Admin)
- `DELETE /:id` - Delete promotion (Admin)

## Testing

### Default Users (from seed data)
```
Admin:
- Email: admin@hasarutrading.com
- Password: password123
- Role: admin

Sales Staff:
- Email: sales1@hasarutrading.com
- Password: password123
- Role: sales_staff

Customer:
- Email: customer1@email.com
- Password: password123
- Role: customer
```

### Test API with cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@hasarutrading.com\",\"password\":\"password123\"}"
```

**Get Products:**
```bash
curl http://localhost:5000/api/products
```

## Project Structure
```
backend/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Helper functions
├── database/        # SQL files
├── logs/            # Application logs
└── server.js        # Entry point
```

## Environment Variables

```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tire_auto_parts_db
DB_PORT=3306

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_password
ADMIN_EMAIL=admin@yourcompany.com

FRONTEND_URL=http://localhost:5173

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check DB credentials in `.env`
- Ensure database exists

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3000
```

### Email Not Sending
- Check email credentials
- For Gmail: Enable "Less secure app access"
- Or use App Password

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT_SECRET
3. Configure proper CORS origin
4. Use environment-specific database
5. Enable HTTPS
6. Set up process manager (PM2)
7. Configure reverse proxy (Nginx)

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start server.js --name hasaru-backend

# Monitor
pm2 monit

# View logs
pm2 logs hasaru-backend
```

## Support

For issues or questions, contact the development team.
