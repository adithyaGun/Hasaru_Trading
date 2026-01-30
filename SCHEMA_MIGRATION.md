# Schema Migration - Unified Sales System

## Old Schema (OBSOLETE - To Be Dropped)
- `online_sales` - Online orders table
- `otc_sales` - Over-the-counter sales table  
- `sale_items` - Sale items with `sale_type` and `sale_id` columns

## New Unified Schema (CURRENT)
- `sales` - All sales (online, pos, otc) with `channel` column
- `sales_items` - All sale items with `sale_id` and `batch_id` for FIFO tracking

## Tables to DROP After Migration
```sql
-- Backup data first if needed!
-- DROP TABLE IF EXISTS sale_items;
-- DROP TABLE IF EXISTS online_sales;
-- DROP TABLE IF EXISTS otc_sales;
```

## Migration Status
✅ Online Sales Service - Migrated to `sales` table
✅ Sales Controller - Uses unified `sales` table
✅ Analytics Service - Uses unified `sales_items` and `sales` tables
🔄 OTC Sales Service - **IN PROGRESS**
🔄 Report Service - **IN PROGRESS**
🔄 Alert Service - **IN PROGRESS**

## Field Mapping
### Old -> New
- `online_sales.order_number` -> `sales.id` (auto-increment)
- `online_sales.order_date` -> `sales.sale_date`
- `online_sales.status` -> `sales.status` (reserved/completed/returned/cancelled)
- `online_sales.payment_status` -> `sales.payment_status`
- `otc_sales.invoice_number` -> `sales.id` (auto-increment)
- `otc_sales.sale_date` -> `sales.sale_date`
- `sale_items.sale_type` -> **REMOVED** (use JOIN with sales.channel instead)
- `sale_items.total_price` -> `sales_items.subtotal`
- **NEW**: `sales.channel` - 'online' or 'pos'
- **NEW**: `sales_items.batch_id` - FIFO batch tracking
