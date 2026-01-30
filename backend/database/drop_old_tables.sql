-- ============================================
-- DROP OLD TABLES - Execute AFTER verifying all data is migrated
-- ============================================

-- WARNING: This will permanently delete data!
-- Make sure to backup first if needed:
-- mysqldump -u root -p hasaru_trading online_sales otc_sales sale_items > backup_old_tables.sql

-- Step 1: Drop foreign key constraints first
ALTER TABLE sale_items DROP FOREIGN KEY IF EXISTS sale_items_ibfk_1;

-- Step 2: Drop old tables
DROP TABLE IF EXISTS sale_items;
DROP TABLE IF EXISTS online_sales;
DROP TABLE IF EXISTS otc_sales;

-- ============================================
-- VERIFICATION
-- ============================================
-- Run these queries to verify unified tables are working:

-- Check sales by channel
SELECT channel, COUNT(*) as count, SUM(total_amount) as total 
FROM sales 
GROUP BY channel;

-- Check sales items
SELECT COUNT(*) as total_items, SUM(subtotal) as total_revenue
FROM sales_items;

-- Check if old constants/enums are still referenced
-- Search codebase for: SALE_TYPES.ONLINE, SALE_TYPES.OTC, online_sales, otc_sales, sale_items
