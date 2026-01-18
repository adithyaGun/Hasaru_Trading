# Tire & Auto Parts Management System

A comprehensive full-stack management system for tire and auto parts retail business, featuring dual sales interfaces (online e-commerce + over-the-counter POS), inventory management, purchasing module, and role-based dashboards.

## 🚀 Quick Start

### Prerequisites
- Node.js v20.x or higher
- MySQL 8.0 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Hasaru_Trading
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Create database and run schema
   mysql -u root -p -e "CREATE DATABASE hasaru_trading;"
   mysql -u root -p hasaru_trading < database/schema.sql
   mysql -u root -p hasaru_trading < database/seed.sql
   
   npm start
   ```
   Backend will run on http://localhost:5000

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env if needed (default: http://localhost:5000/api)
   
   npm run dev
   ```
   Frontend will run on http://localhost:5173

4. **Login with default credentials**
   - **Admin**: admin@hasaru.com / Admin@123
   - **Sales Staff**: sales@hasaru.com / Sales@123
   - **Customer**: customer@hasaru.com / Customer@123

## 📋 Features

### Core Functionality
- ✅ User authentication & role-based authorization (Admin, Sales Staff, Customer)
- ✅ Product catalog with categories, brands, and stock management
- ✅ Dual sales interfaces:
  - **Online Sales**: E-commerce with cart, checkout, order tracking
  - **OTC Sales**: Point-of-sale for walk-in customers
- ✅ Supplier management
- ✅ Purchase order workflow (Draft → Approved → Received)
- ✅ Automatic low stock alerts via email
- ✅ Promotions and discounts system
- ✅ Comprehensive reporting and analytics
- ✅ Stock audit trail

### Dashboard Features

**Admin Dashboard**
- Sales overview and key metrics
- Product, supplier, and purchase management
- Sales and profit reports
- Business analytics (top selling, fast/slow moving items)
- Low stock alerts monitoring
- User and promotion management

**Sales Staff Dashboard**
- Quick POS for over-the-counter sales
- Online order management
- Sales history and reporting

**Customer Dashboard**
- Order history and tracking
- Profile management
- Shopping cart and checkout

## 🏗️ Architecture

### Backend
- **Framework**: Node.js + Express.js
- **Database**: MySQL 8.0+
- **Architecture**: MVC with Service Layer
- **Authentication**: JWT with bcrypt
- **API**: RESTful with role-based middleware

### Frontend
- **Framework**: React 18 + Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **UI**: Ant Design (dashboards) + Tailwind CSS (landing pages)
- **HTTP**: Axios with interceptors

## 📁 Project Structure

```
Hasaru_Trading/
├── backend/                    # Node.js/Express backend
│   ├── config/                # Configuration files
│   ├── controllers/           # Route controllers
│   ├── database/              # SQL schema and seed data
│   ├── middleware/            # Custom middleware
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   ├── utils/                 # Utilities and helpers
│   ├── server.js              # Entry point
│   └── package.json
│
├── frontend/                   # React/Vite frontend
│   ├── src/
│   │   ├── api/               # API service layer
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── store/             # Redux store and slices
│   │   ├── App.jsx            # Main app with routes
│   │   └── main.jsx           # Entry point
│   ├── index.html
│   └── package.json
│
└── PROJECT_OVERVIEW.md        # Comprehensive documentation
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin/staff)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product (admin)

### Shopping & Orders
- `GET /api/sales/online/cart` - Get cart
- `POST /api/sales/online/cart` - Add to cart
- `POST /api/sales/online/checkout` - Checkout
- `GET /api/sales/online/my-orders` - Get my orders

### OTC Sales
- `GET /api/sales/otc/search` - Search products for POS
- `POST /api/sales/otc` - Create OTC sale

### Reports & Analytics
- `GET /api/reports/sales` - Sales report
- `GET /api/reports/profit` - Profit report (admin)
- `GET /api/analytics/top-selling` - Top products
- `GET /api/analytics/fast-moving` - Fast moving items

*For complete API documentation, see [backend/README.md](backend/README.md)*

## 🗄️ Database Schema

**13 Tables:**
- users, products, suppliers
- purchases, purchase_items
- online_sales, otc_sales, sale_items
- stock_logs, low_stock_alerts
- cart, promotions, product_promotions

**Key Features:**
- Foreign key constraints
- Composite indexes for performance
- Triggers for automatic alerts
- Views for reporting

## 🔐 Security

- JWT authentication with 24h expiration
- Bcrypt password hashing
- Role-based access control
- Rate limiting (100 req/15min)
- Helmet security headers
- CORS protection
- Input validation & sanitization

## 📊 Technology Stack

| Layer | Technologies |
|-------|-------------|
| Backend | Node.js, Express.js, MySQL, JWT, bcrypt |
| Frontend | React, Redux, Ant Design, Tailwind CSS, Vite |
| Authentication | JWT tokens, bcrypt hashing |
| Email | Nodemailer |
| Logging | Winston, Morgan |
| Validation | express-validator |

## 📝 Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hasaru_trading
JWT_SECRET=your_secret_key
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
PORT=5000
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 🧪 Testing

### Manual Testing
1. Register a new customer account
2. Browse products and add to cart
3. Complete checkout process
4. Login as sales staff and create OTC sale
5. Login as admin and view reports

### API Testing
Use Postman or similar tool to test endpoints with JWT authentication.

## 🚀 Deployment

### Backend
1. Set production environment variables
2. Use PM2 for process management
3. Configure reverse proxy (Nginx)
4. Enable HTTPS with Let's Encrypt

### Frontend
1. Build: `npm run build`
2. Deploy `dist/` folder to static hosting
3. Configure API URL for production

## 📚 Documentation

- **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Complete system documentation
- **[backend/README.md](backend/README.md)** - Backend API documentation
- **[frontend/README.md](frontend/README.md)** - Frontend setup guide
- **[backend/SETUP.md](backend/SETUP.md)** - Detailed setup instructions

## 🐛 Troubleshooting

### Database Connection Error
- Verify MySQL is running
- Check credentials in `.env`
- Ensure database exists

### CORS Issues
- Verify backend allows frontend URL in CORS
- Check API proxy in `vite.config.js`

### Port Conflicts
- Change PORT in backend `.env`
- Change port in frontend `vite.config.js`

## 📈 Future Enhancements

- Payment gateway integration (Stripe, PayPal)
- Product image uploads with cloud storage
- Advanced analytics with data visualization
- Mobile app (React Native)
- Barcode scanning for POS
- Invoice PDF generation
- SMS notifications
- Multi-warehouse support
- Return/refund management

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Proprietary - Hasaru Trading

## 👥 Support

For support or inquiries:
- Email: dev@hasarutrading.com
- Documentation: See PROJECT_OVERVIEW.md

## 🎉 Credits

Built with modern web technologies for efficient retail management.

---

**Version 1.0.0** - Initial Release
