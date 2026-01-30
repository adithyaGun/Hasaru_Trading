# Hasaru Trading - Database Setup

## Database Structure

This directory contains the finalized database schema and seed data for the Hasaru Trading tire and auto parts management system.

### Files

- **`schema.sql`** - Complete database schema with all tables, indexes, triggers, and views
- **`seed.sql`** - Sample data for development and testing

## Database Setup

### Initial Setup

1. **Create Database and Tables**
   ```bash
   mysql -u root -p < schema.sql
   ```

2. **Load Sample Data** (Optional - for development)
   ```bash
   mysql -u root -p tire_auto_parts_db < seed.sql
   ```

### Quick Setup (One Command)
```bash
mysql -u root -p < schema.sql && mysql -u root -p tire_auto_parts_db < seed.sql
```

## Database Schema Overview

### Core Tables

#### User Management
- **`users`** - System users (admin, sales_staff, customer)

#### Inventory
- **`products`** - Product catalog
- **`product_batches`** - FIFO batch tracking
- **`suppliers`** - Supplier information
- **`purchases`** - Purchase orders
- **`purchase_items`** - Purchase order line items

#### Sales (Unified System)
- **`sales`** - All sales transactions (online + POS) with channel='online'/'pos'
  - Status workflow: `reserved` → `processing` → `shipped` → `completed`
  - Also supports: `returned`, `cancelled`
- **`sales_items`** - Sale line items with batch traceability
- **`cart`** - Shopping cart for online orders

#### Promotions
- **`promotions`** - Discount campaigns
- **`product_promotions`** - Products linked to promotions

#### Stock Management
- **`stock_movements`** - Detailed stock movement audit
- **`stock_logs`** - Stock transaction history
- **`low_stock_alerts`** - Automated low stock notifications

### Key Features

#### Sales Status Workflow
```
Online Orders:
reserved → processing → shipped → completed
                    ↓
                cancelled / returned

POS Sales:
completed (immediate)
```

#### FIFO Stock Management
- Each product batch tracks quantity received and remaining
- Sales automatically deduct from oldest batches first
- Full traceability from purchase to sale

#### Payment Statuses
- `pending` - Awaiting payment
- `completed` - Payment received
- `failed` - Payment failed

#### Payment Methods
- `cash` - Cash payment
- `card` - Card payment
- `bank_transfer` - Bank transfer
- `cash_on_delivery` - COD for online orders

## Sample Data

The seed.sql includes:
- 5 users (1 admin, 2 sales staff, 2 customers)
- 5 suppliers
- 20 products across categories (tires, batteries, oils, etc.)
- 3 active promotions
- 3 purchase orders (various statuses)
- 20 product batches (FIFO tracking)
- 7 sample sales (4 POS, 3 online)
- Stock movement history
- Low stock alerts

### Default Login Credentials

All users have password: `password123`

- **Admin**: admin@hasarutrading.com
- **Sales Staff 1**: sales1@hasarutrading.com
- **Sales Staff 2**: sales2@hasarutrading.com
- **Customer 1**: customer1@email.com
- **Customer 2**: customer2@email.com

## Views

### `v_stock_status`
Real-time stock status for all active products with:
- Current stock levels
- Reorder points
- Stock value
- Status classification (Normal/Low/Critical)

### `v_sales_summary`
Daily sales summary by channel (online/pos) with:
- Transaction count
- Total sales
- Total discounts

## Triggers

### `after_product_stock_update`
Automatically creates low stock alerts when:
- Stock falls below reorder level
- Generates warning or critical alerts
- Prevents duplicate alerts for same day

## Indexes

Optimized indexes for:
- Fast user lookups (email, role)
- Product searches (SKU, barcode, category)
- Sales queries (channel, date, status, customer)
- Batch tracking (product, supplier, PO, date)
- Reporting aggregations

## Notes

- All monetary values use DECIMAL(10,2) or DECIMAL(12,2) for precision
- Timestamps auto-update on record changes
- Foreign keys maintain referential integrity
- Cascading deletes protect data consistency
- UTF8MB4 charset supports all languages and emojis
