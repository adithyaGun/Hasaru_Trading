# Tire & Auto Parts Management System - Frontend

Modern React-based frontend for the Tire & Auto Parts Management System.

## Tech Stack

- **Framework**: React 18 with Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **UI Components**: 
  - Ant Design (Dashboards)
  - Tailwind CSS (Landing Pages)
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Notifications**: React Hot Toast

## Project Structure

```
frontend/
├── src/
│   ├── api/                    # API service layer
│   │   ├── axios.js           # Axios configuration with interceptors
│   │   └── index.js           # API endpoints
│   ├── components/             # Reusable components
│   │   ├── admin/             # Admin-specific components
│   │   ├── Navbar.jsx         # Main navigation
│   │   ├── Footer.jsx         # Footer component
│   │   ├── ProtectedRoute.jsx # Auth guard
│   │   └── RoleBasedRoute.jsx # Role-based access control
│   ├── pages/                  # Page components
│   │   ├── public/            # Public pages (Home, Products, Cart)
│   │   ├── auth/              # Authentication pages
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── sales/             # Sales staff pages
│   │   └── customer/          # Customer pages
│   ├── store/                  # Redux store
│   │   ├── slices/            # Redux slices
│   │   └── store.js           # Store configuration
│   ├── App.jsx                # Main app component with routes
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── index.html                  # HTML template
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind configuration
├── postcss.config.js          # PostCSS configuration
└── package.json               # Dependencies

```

## Features

### Public Features
- **Home Page**: Hero section, featured products, categories
- **Product Listing**: Search, filters by category/brand, pagination
- **Product Details**: Full product information, add to cart
- **Shopping Cart**: View items, update quantities, apply discounts
- **Checkout**: Shipping information, payment method selection
- **Authentication**: Login and registration

### Customer Features
- **Dashboard**: Order overview and account summary
- **My Orders**: View order history with status tracking
- **Profile Management**: Update personal information

### Sales Staff Features
- **Dashboard**: Sales overview and statistics
- **POS System**: Quick product search, instant sales
- **Online Orders**: Manage customer orders
- **Sales History**: View past transactions

### Admin Features
- **Dashboard**: Overview with key metrics and alerts
- **Product Management**: CRUD operations for products
- **Supplier Management**: Manage supplier information
- **Purchase Orders**: Create and approve POs
- **Reports**: Sales and inventory reports
- **Analytics**: Business insights and trends
- **Stock Alerts**: Monitor low stock items
- **User Management**: Manage system users
- **Promotions**: Create and manage discounts

## Setup Instructions

### Prerequisites
- Node.js v20.x or higher
- npm or yarn
- Backend API running on http://localhost:5000

### Installation

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your backend URL:
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   The app will be available at http://localhost:5173

4. **Build for Production**
   ```bash
   npm run build
   ```
   
   Build output will be in the `dist/` directory.

5. **Preview Production Build**
   ```bash
   npm run preview
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The frontend communicates with the backend through Axios with the following features:

- **Base URL**: Configured via environment variable
- **Authentication**: JWT token automatically attached to requests
- **Error Handling**: Global error interceptor with toast notifications
- **Token Management**: Auto-logout on 401 responses

### API Services

Located in `src/api/index.js`:

- `authAPI` - Authentication (login, register, profile)
- `productsAPI` - Product operations
- `cartAPI` - Shopping cart management
- `ordersAPI` - Order operations
- `otcSalesAPI` - Over-the-counter sales
- `suppliersAPI` - Supplier management
- `purchasesAPI` - Purchase orders
- `reportsAPI` - Sales and inventory reports
- `analyticsAPI` - Business analytics
- `alertsAPI` - Stock alerts
- `promotionsAPI` - Promotions and discounts

## State Management

Redux Toolkit slices:

### Auth Slice
```javascript
{
  user: { id, name, email, role },
  token: "jwt_token",
  isAuthenticated: boolean,
  loading: boolean
}
```

### Cart Slice
```javascript
{
  items: [...],
  summary: {
    subtotal: number,
    discount_amount: number,
    total: number
  }
}
```

### Products Slice
```javascript
{
  products: [...],
  product: {...},
  categories: [...],
  brands: [...],
  pagination: {...}
}
```

## Routing

### Public Routes
- `/` - Home
- `/products` - Product listing
- `/product/:id` - Product details
- `/cart` - Shopping cart
- `/checkout` - Checkout
- `/login` - Login
- `/register` - Registration

### Protected Routes (Role-based)
- `/admin/*` - Admin dashboard (admin only)
- `/sales/*` - Sales dashboard (sales_staff only)
- `/customer/*` - Customer dashboard (authenticated users)

## Styling

### Tailwind CSS
Used for landing pages and public-facing components:
- Custom primary color palette
- Responsive utilities
- Custom animations
- Scrollbar styling

### Ant Design
Used for dashboard interfaces:
- Table components
- Form components
- Layout components
- Data visualization

## Environment Variables

```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Tips

1. **Hot Module Replacement**: Vite provides instant HMR for fast development
2. **Path Aliases**: Use `@/` for imports from `src/` directory
3. **API Proxy**: Vite proxy configured to forward `/api` requests to backend
4. **State Debugging**: Redux DevTools extension supported

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The `dist/` folder can be deployed to:
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages
- Any static file server

### Environment Configuration
Set `VITE_API_BASE_URL` to your production API URL before building.

## Troubleshooting

### CORS Issues
Ensure backend CORS is configured to allow `http://localhost:5173` in development.

### API Connection
Verify backend is running on the configured `VITE_API_BASE_URL`.

### Build Errors
Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Contributing

1. Follow component structure conventions
2. Use TypeScript for type safety (future enhancement)
3. Write meaningful commit messages
4. Test authentication flows
5. Ensure responsive design

## License

Proprietary - Hasaru Trading

## Support

For issues and questions, contact the development team.
