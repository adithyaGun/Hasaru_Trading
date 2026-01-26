-- ============================================
-- SAMPLE DATA FOR DEVELOPMENT
-- ============================================

USE tire_auto_parts_db;

-- ============================================
-- 1. USERS (Password: 'password123' hashed with bcrypt)
-- ============================================
INSERT INTO users (name, email, password, role, phone, address) VALUES
('Admin User', 'admin@hasarutrading.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '0712345678', '123 Main St, Colombo'),
('Sales Staff 1', 'sales1@hasarutrading.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sales_staff', '0723456789', '456 Shop St, Colombo'),
('Sales Staff 2', 'sales2@hasarutrading.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sales_staff', '0734567890', '789 Store Ave, Colombo'),
('John Customer', 'customer1@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer', '0745678901', '321 Customer Rd, Colombo'),
('Jane Doe', 'customer2@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer', '0756789012', '654 Buyer St, Colombo');

-- ============================================
-- 2. SUPPLIERS
-- ============================================
INSERT INTO suppliers (name, email, phone, address, contact_person) VALUES
('Michelin Tire Distributors', 'info@michelin.lk', '0112345678', 'Colombo Industrial Zone', 'Mr. Silva'),
('Bridgestone Lanka', 'sales@bridgestone.lk', '0112345679', 'Galle Road, Colombo', 'Ms. Perera'),
('Auto Parts Global', 'contact@autopartsglobal.lk', '0112345680', 'Negombo Road, Wattala', 'Mr. Fernando'),
('Battery World LK', 'info@batteryworld.lk', '0112345681', 'Kandy Road, Kadawatha', 'Mr. Rajapaksa'),
('Oil & Lubricants Co', 'sales@oillubricants.lk', '0112345682', 'Ratmalana Industrial Estate', 'Ms. Gunasekara');

-- ============================================
-- 3. PRODUCTS
-- ============================================
INSERT INTO products (name, description, sku, barcode, category, brand, unit, purchase_price, selling_price, stock_quantity, reorder_level, minimum_stock_level) VALUES
-- Tires
('Michelin Primacy 4 195/65R15', 'Premium touring tire with excellent grip', 'TIRE-MICH-001', '8901234567890', 'Tires', 'Michelin', 'piece', 12500.00, 18000.00, 45, 15, 8),
('Bridgestone Turanza T005 205/55R16', 'High performance tire for sedans', 'TIRE-BRID-001', '8901234567891', 'Tires', 'Bridgestone', 'piece', 14000.00, 20000.00, 35, 12, 6),
('Yokohama BluEarth 185/60R14', 'Eco-friendly fuel-efficient tire', 'TIRE-YOKO-001', '8901234567892', 'Tires', 'Yokohama', 'piece', 9500.00, 14000.00, 28, 10, 5),
('Goodyear Assurance 215/60R17', 'All-season tire for SUVs', 'TIRE-GOOD-001', '8901234567893', 'Tires', 'Goodyear', 'piece', 16000.00, 23000.00, 18, 8, 4),

-- Batteries
('Amaron Pro 65Ah', '65Ah automotive battery with 48 months warranty', 'BATT-AMAR-001', '8901234567894', 'Batteries', 'Amaron', 'piece', 8500.00, 12500.00, 25, 10, 5),
('Exide EPIQ 70Ah', '70Ah maintenance-free battery', 'BATT-EXID-001', '8901234567895', 'Batteries', 'Exide', 'piece', 9000.00, 13500.00, 20, 8, 4),
('Bosch S4 60Ah', 'German quality 60Ah battery', 'BATT-BOSC-001', '8901234567896', 'Batteries', 'Bosch', 'piece', 10000.00, 15000.00, 15, 6, 3),

-- Engine Oil
('Castrol Edge 5W-30 4L', 'Fully synthetic engine oil', 'OIL-CAST-001', '8901234567897', 'Engine Oil', 'Castrol', 'bottle', 4500.00, 6500.00, 60, 20, 10),
('Mobil 1 10W-40 4L', 'Premium synthetic motor oil', 'OIL-MOBI-001', '8901234567898', 'Engine Oil', 'Mobil', 'bottle', 4800.00, 7000.00, 55, 20, 10),
('Shell Helix Ultra 5W-40 4L', 'Advanced synthetic oil', 'OIL-SHEL-001', '8901234567899', 'Engine Oil', 'Shell', 'bottle', 5000.00, 7200.00, 50, 18, 8),

-- Brake Pads
('Bosch Brake Pads - Toyota Corolla', 'Premium brake pads for Toyota Corolla', 'BRAKE-BOSC-001', '8901234567900', 'Brake Pads', 'Bosch', 'set', 3500.00, 5500.00, 30, 12, 6),
('Bendix Brake Pads - Honda Civic', 'High performance brake pads', 'BRAKE-BEND-001', '8901234567901', 'Brake Pads', 'Bendix', 'set', 3800.00, 6000.00, 25, 10, 5),

-- Air Filters
('Mann Air Filter - Universal', 'High quality air filter', 'FILT-MANN-001', '8901234567902', 'Filters', 'Mann', 'piece', 850.00, 1500.00, 75, 25, 12),
('K&N Air Filter - Performance', 'Reusable performance air filter', 'FILT-KN-001', '8901234567903', 'Filters', 'K&N', 'piece', 4500.00, 7500.00, 20, 8, 4),

-- Spark Plugs
('NGK Iridium Spark Plugs', 'Long-lasting iridium spark plugs', 'SPARK-NGK-001', '8901234567904', 'Spark Plugs', 'NGK', 'set', 2800.00, 4200.00, 40, 15, 8),
('Denso Platinum Spark Plugs', 'Premium platinum spark plugs', 'SPARK-DENS-001', '8901234567905', 'Spark Plugs', 'Denso', 'set', 3200.00, 4800.00, 35, 12, 6),

-- Wipers
('Bosch Aerotwin Wipers 24"', 'Flat blade windscreen wipers', 'WIPER-BOSC-001', '8901234567906', 'Wipers', 'Bosch', 'pair', 1800.00, 2800.00, 50, 20, 10),
('Rain-X Latitude Wipers 22"', 'Water-repelling wiper blades', 'WIPER-RAIN-001', '8901234567907', 'Wipers', 'Rain-X', 'pair', 1500.00, 2500.00, 45, 18, 8),

-- Coolants
('Prestone Coolant 4L', 'All-vehicle antifreeze coolant', 'COOL-PRES-001', '8901234567908', 'Coolants', 'Prestone', 'bottle', 1200.00, 1800.00, 40, 15, 8),
('Valvoline Coolant 4L', 'Extended life coolant', 'COOL-VALV-001', '8901234567909', 'Coolants', 'Valvoline', 'bottle', 1300.00, 2000.00, 35, 12, 6);

-- ============================================
-- 4. PROMOTIONS
-- ============================================
INSERT INTO promotions (name, description, discount_type, discount_value, start_date, end_date, is_active, applicable_to) VALUES
('New Year Sale 2026', '10% off on all tires', 'percentage', 10.00, '2026-01-01 00:00:00', '2026-01-31 23:59:59', TRUE, 'specific'),
('Battery Bundle Deal', 'Rs. 1000 off on batteries', 'fixed', 1000.00, '2026-01-10 00:00:00', '2026-02-28 23:59:59', TRUE, 'specific'),
('Oil Change Special', '15% off on engine oils', 'percentage', 15.00, '2026-01-01 00:00:00', '2026-01-31 23:59:59', TRUE, 'specific');

-- ============================================
-- 5. PRODUCT PROMOTIONS (Link products to promotions)
-- ============================================
INSERT INTO product_promotions (product_id, promotion_id) VALUES
-- New Year Sale - Tires
(1, 1), (2, 1), (3, 1), (4, 1),
-- Battery Bundle Deal
(5, 2), (6, 2), (7, 2),
-- Oil Change Special
(8, 3), (9, 3), (10, 3);

-- ============================================
-- 6. SAMPLE PURCHASE ORDERS
-- ============================================
INSERT INTO purchases (po_number, supplier_id, order_date, expected_delivery_date, status, total_amount, received_date, received_by, approved_by, approved_date) VALUES
('PO-2026-001', 1, '2026-01-05', '2026-01-10', 'received', 250000.00, '2026-01-09 10:30:00', 2, 1, '2026-01-05 14:00:00'),
('PO-2026-002', 2, '2026-01-07', '2026-01-12', 'approved', 180000.00, NULL, NULL, 1, '2026-01-07 16:00:00'),
('PO-2026-003', 3, '2026-01-08', '2026-01-15', 'draft', 95000.00, NULL, NULL, NULL, NULL);

-- Purchase Items for PO-2026-001 (received)
INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_price, total_price) VALUES
(1, 1, 20, 12500.00, 250000.00);

-- Purchase Items for PO-2026-002 (approved, not received yet)
INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_price, total_price) VALUES
(2, 2, 15, 14000.00, 210000.00);

-- ============================================
-- 7. SAMPLE ONLINE SALES
-- ============================================
INSERT INTO online_sales (order_number, customer_id, order_date, status, payment_status, payment_method, subtotal, discount_amount, total_amount, shipping_address, processed_by, processed_date) VALUES
('ONL-2026-001', 4, '2026-01-10 09:15:00', 'delivered', 'paid', 'card', 36000.00, 3600.00, 32400.00, '321 Customer Rd, Colombo', 2, '2026-01-10 10:00:00'),
('ONL-2026-002', 5, '2026-01-11 14:30:00', 'processing', 'paid', 'card', 12500.00, 1250.00, 11250.00, '654 Buyer St, Colombo', 2, '2026-01-11 15:00:00'),
('ONL-2026-003', 4, '2026-01-12 11:00:00', 'pending', 'unpaid', NULL, 28000.00, 0.00, 28000.00, '321 Customer Rd, Colombo', NULL, NULL);

-- Sale Items for online sales
INSERT INTO sale_items (sale_type, sale_id, product_id, quantity, unit_price, discount_amount, total_price) VALUES
('online', 1, 1, 2, 18000.00, 3600.00, 32400.00),
('online', 2, 5, 1, 12500.00, 1250.00, 11250.00),
('online', 3, 2, 1, 20000.00, 0.00, 20000.00),
('online', 3, 8, 1, 6500.00, 0.00, 6500.00);

-- ============================================
-- 8. SAMPLE OTC SALES
-- ============================================
INSERT INTO otc_sales (invoice_number, sales_staff_id, sale_date, customer_name, customer_phone, payment_method, subtotal, discount_amount, total_amount, amount_paid, change_amount) VALUES
('INV-2026-001', 2, '2026-01-10 10:30:00', 'Walk-in Customer 1', '0771234567', 'cash', 14000.00, 0.00, 14000.00, 15000.00, 1000.00),
('INV-2026-002', 3, '2026-01-10 14:00:00', 'Walk-in Customer 2', '0772345678', 'card', 27000.00, 1350.00, 25650.00, 25650.00, 0.00),
('INV-2026-003', 2, '2026-01-11 09:00:00', 'Walk-in Customer 3', '0773456789', 'cash', 13000.00, 0.00, 13000.00, 13000.00, 0.00),
('INV-2026-004', 3, '2026-01-11 16:30:00', NULL, NULL, 'cash', 8400.00, 0.00, 8400.00, 8400.00, 0.00),
('INV-2026-005', 2, '2026-01-12 11:15:00', 'Walk-in Customer 4', '0774567890', 'bank_transfer', 15000.00, 0.00, 15000.00, 15000.00, 0.00);

-- Sale Items for OTC sales
INSERT INTO sale_items (sale_type, sale_id, product_id, quantity, unit_price, discount_amount, total_price) VALUES
('otc', 1, 3, 1, 14000.00, 0.00, 14000.00),
('otc', 2, 2, 1, 20000.00, 1000.00, 19000.00),
('otc', 2, 8, 1, 6500.00, 325.00, 6175.00),
('otc', 3, 5, 1, 12500.00, 0.00, 12500.00),
('otc', 4, 8, 1, 6500.00, 0.00, 6500.00),
('otc', 4, 12, 1, 1500.00, 0.00, 1500.00),
('otc', 5, 7, 1, 15000.00, 0.00, 15000.00);

-- ============================================
-- 9. STOCK LOGS (Audit trail)
-- ============================================
INSERT INTO stock_logs (product_id, transaction_type, reference_id, quantity_change, quantity_before, quantity_after, performed_by) VALUES
-- Purchase received
(1, 'purchase', 1, 20, 25, 45, 2),
-- Online sales
(1, 'online_sale', 1, -2, 45, 43, 2),
(5, 'online_sale', 2, -1, 26, 25, 2),
-- OTC sales
(3, 'otc_sale', 1, -1, 29, 28, 2),
(2, 'otc_sale', 2, -1, 36, 35, 3),
(8, 'otc_sale', 2, -1, 61, 60, 3),
(5, 'otc_sale', 3, -1, 25, 24, 2);

-- ============================================
-- 10. LOW STOCK ALERTS (some products below reorder level)
-- ============================================
-- These will be auto-generated by trigger, but adding some manually for demo
INSERT INTO low_stock_alerts (product_id, current_stock, reorder_level, alert_level, is_acknowledged) VALUES
(4, 18, 8, 'warning', FALSE),
(7, 15, 6, 'warning', FALSE);

-- ============================================
-- END OF SEED DATA
-- ============================================
