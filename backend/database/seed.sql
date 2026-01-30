-- ============================================
-- HASARU TRADING - TIRE & AUTO PARTS
-- Sample Data for Development
-- ============================================

USE tire_auto_parts_db;

-- ============================================
-- 1. USERS
-- Password for all: 'password123'
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
('Michelin Primacy 4 195/65R15', 'Premium touring tire with excellent grip', 'TIRE-MICH-001', '8901234567890', 'Tires', 'Michelin', 'piece', 12500.00, 18000.00, 43, 15, 8),
('Bridgestone Turanza T005 205/55R16', 'High performance tire for sedans', 'TIRE-BRID-001', '8901234567891', 'Tires', 'Bridgestone', 'piece', 14000.00, 20000.00, 34, 12, 6),
('Yokohama BluEarth 185/60R14', 'Eco-friendly fuel-efficient tire', 'TIRE-YOKO-001', '8901234567892', 'Tires', 'Yokohama', 'piece', 9500.00, 14000.00, 27, 10, 5),
('Goodyear Assurance 215/60R17', 'All-season tire for SUVs', 'TIRE-GOOD-001', '8901234567893', 'Tires', 'Goodyear', 'piece', 16000.00, 23000.00, 18, 8, 4),
-- Batteries
('Amaron Pro 65Ah', '65Ah automotive battery with 48 months warranty', 'BATT-AMAR-001', '8901234567894', 'Batteries', 'Amaron', 'piece', 8500.00, 12500.00, 23, 10, 5),
('Exide EPIQ 70Ah', '70Ah maintenance-free battery', 'BATT-EXID-001', '8901234567895', 'Batteries', 'Exide', 'piece', 9000.00, 13500.00, 20, 8, 4),
('Bosch S4 60Ah', 'German quality 60Ah battery', 'BATT-BOSC-001', '8901234567896', 'Batteries', 'Bosch', 'piece', 10000.00, 15000.00, 15, 6, 3),
-- Engine Oil
('Castrol Edge 5W-30 4L', 'Fully synthetic engine oil', 'OIL-CAST-001', '8901234567897', 'Engine Oil', 'Castrol', 'bottle', 4500.00, 6500.00, 58, 20, 10),
('Mobil 1 10W-40 4L', 'Premium synthetic motor oil', 'OIL-MOBI-001', '8901234567898', 'Engine Oil', 'Mobil', 'bottle', 4800.00, 7000.00, 55, 20, 10),
('Shell Helix Ultra 5W-40 4L', 'Advanced synthetic oil', 'OIL-SHEL-001', '8901234567899', 'Engine Oil', 'Shell', 'bottle', 5000.00, 7200.00, 50, 18, 8),
-- Brake Pads
('Bosch Brake Pads - Toyota Corolla', 'Premium brake pads for Toyota Corolla', 'BRAKE-BOSC-001', '8901234567900', 'Brake Pads', 'Bosch', 'set', 3500.00, 5500.00, 30, 12, 6),
('Bendix Brake Pads - Honda Civic', 'High performance brake pads', 'BRAKE-BEND-001', '8901234567901', 'Brake Pads', 'Bendix', 'set', 3800.00, 6000.00, 25, 10, 5),
-- Air Filters
('Mann Air Filter - Universal', 'High quality air filter', 'FILT-MANN-001', '8901234567902', 'Filters', 'Mann', 'piece', 850.00, 1500.00, 75, 25, 12),
('K&N Air Filter - Performance', 'Reusable performance air filter', 'FILT-KN-001', '8901234567903', 'Filters', 'K&N', 'piece', 4500.00, 7500.00, 20, 8, 4),
-- Spark Plugs
('NGK Iridium Spark Plugs', 'Long-lasting iridium spark plugs', 'SPARK-NGK-001', '8901234567904', 'Spark Plugs', 'NGK', 'set', 2800.00, 4200.00, 39, 15, 8),
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
-- 5. PRODUCT PROMOTIONS
-- ============================================
INSERT INTO product_promotions (product_id, promotion_id) VALUES
-- New Year Sale - Tires
(1, 1), (2, 1), (3, 1), (4, 1),
-- Battery Bundle Deal
(5, 2), (6, 2), (7, 2),
-- Oil Change Special
(8, 3), (9, 3), (10, 3);

-- ============================================
-- 6. PURCHASE ORDERS
-- ============================================
INSERT INTO purchases (po_number, supplier_id, order_date, expected_delivery_date, status, total_amount, received_date, received_by, approved_by, approved_date, auto_receive) VALUES
('PO-2026-001', 1, '2026-01-05', '2026-01-10', 'received', 250000.00, '2026-01-09 10:30:00', 2, 1, '2026-01-05 14:00:00', TRUE),
('PO-2026-002', 2, '2026-01-07', '2026-01-12', 'approved', 210000.00, NULL, NULL, 1, '2026-01-07 16:00:00', TRUE),
('PO-2026-003', 3, '2026-01-08', '2026-01-15', 'draft', 95000.00, NULL, NULL, NULL, NULL, FALSE);

INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_price, total_price) VALUES
(1, 1, 20, 12500.00, 250000.00),
(2, 2, 15, 14000.00, 210000.00),
(3, 3, 10, 9500.00, 95000.00);

-- ============================================
-- 7. PRODUCT BATCHES (FIFO Tracking)
-- ============================================
-- Batch from received PO
INSERT INTO product_batches (product_id, supplier_id, po_id, batch_number, quantity_received, quantity_remaining, unit_cost, received_date) VALUES
(1, 1, 1, 'BATCH-2026-001', 20, 17, 12500.00, '2026-01-09 10:30:00');

-- Initial stock batches
INSERT INTO product_batches (product_id, supplier_id, po_id, batch_number, quantity_received, quantity_remaining, unit_cost, received_date) VALUES
(2, 2, NULL, 'INIT-TIRE-002', 34, 34, 14000.00, '2025-12-01 10:00:00'),
(3, 2, NULL, 'INIT-TIRE-003', 27, 27, 9500.00, '2025-12-05 10:00:00'),
(4, 1, NULL, 'INIT-TIRE-004', 18, 18, 16000.00, '2025-12-10 10:00:00'),
(5, 4, NULL, 'INIT-BATT-005', 23, 23, 8500.00, '2025-11-20 10:00:00'),
(6, 4, NULL, 'INIT-BATT-006', 20, 20, 9000.00, '2025-11-25 10:00:00'),
(7, 4, NULL, 'INIT-BATT-007', 15, 15, 10000.00, '2025-12-01 10:00:00'),
(8, 5, NULL, 'INIT-OIL-008', 58, 58, 4500.00, '2025-12-15 10:00:00'),
(9, 5, NULL, 'INIT-OIL-009', 55, 55, 4800.00, '2025-12-15 10:00:00'),
(10, 5, NULL, 'INIT-OIL-010', 50, 50, 5000.00, '2025-12-15 10:00:00'),
(11, 3, NULL, 'INIT-BRAKE-011', 30, 30, 3500.00, '2025-11-30 10:00:00'),
(12, 3, NULL, 'INIT-BRAKE-012', 25, 25, 3800.00, '2025-11-30 10:00:00'),
(13, 3, NULL, 'INIT-FILT-013', 75, 75, 850.00, '2025-12-20 10:00:00'),
(14, 3, NULL, 'INIT-FILT-014', 20, 20, 4500.00, '2025-12-20 10:00:00'),
(15, 3, NULL, 'INIT-SPARK-015', 39, 39, 2800.00, '2025-12-10 10:00:00'),
(16, 3, NULL, 'INIT-SPARK-016', 35, 35, 3200.00, '2025-12-10 10:00:00'),
(17, 3, NULL, 'INIT-WIPER-017', 50, 50, 1800.00, '2025-12-12 10:00:00'),
(18, 3, NULL, 'INIT-WIPER-018', 45, 45, 1500.00, '2025-12-12 10:00:00'),
(19, 5, NULL, 'INIT-COOL-019', 40, 40, 1200.00, '2025-12-18 10:00:00'),
(20, 5, NULL, 'INIT-COOL-020', 35, 35, 1300.00, '2025-12-18 10:00:00');

-- ============================================
-- 8. UNIFIED SALES (Online + POS)
-- ============================================

-- POS Sales (Walk-in customers)
INSERT INTO sales (customer_id, channel, sale_date, subtotal, discount, total_amount, payment_method, payment_status, status, created_by, notes) VALUES
(NULL, 'pos', '2026-01-10 10:30:00', 14000.00, 0.00, 14000.00, 'cash', 'completed', 'completed', 2, 'Customer: Walk-in | Phone: 0771234567\nPaid: Rs. 14000 | Change: Rs. 0'),
(NULL, 'pos', '2026-01-10 14:00:00', 27000.00, 1350.00, 25650.00, 'card', 'completed', 'completed', 3, 'Customer: Mr. Perera | Phone: 0772345678\nPaid: Rs. 25650 | Change: Rs. 0'),
(NULL, 'pos', '2026-01-11 09:00:00', 12500.00, 0.00, 12500.00, 'cash', 'completed', 'completed', 2, 'Customer: Walk-in\nPaid: Rs. 15000 | Change: Rs. 2500'),
(NULL, 'pos', '2026-01-11 16:30:00', 10700.00, 0.00, 10700.00, 'cash', 'completed', 'completed', 3, 'Customer: Ms. Silva | Phone: 0773456789\nPaid: Rs. 11000 | Change: Rs. 300');

-- Online Sales (Registered customers)
INSERT INTO sales (customer_id, channel, sale_date, subtotal, discount, total_amount, payment_method, payment_status, status, created_by, notes) VALUES
(4, 'online', '2026-01-10 09:15:00', 36000.00, 3600.00, 32400.00, 'card', 'completed', 'completed', 2, 'Shipping Address: 321 Customer Rd, Colombo\n\nNotes: Please deliver between 9AM-5PM'),
(5, 'online', '2026-01-11 14:30:00', 12500.00, 0.00, 12500.00, 'card', 'completed', 'completed', 2, 'Shipping Address: 654 Buyer St, Colombo'),
(4, 'online', '2026-01-12 11:00:00', 26500.00, 0.00, 26500.00, 'cash_on_delivery', 'pending', 'reserved', NULL, 'Shipping Address: 321 Customer Rd, Colombo\n\nNotes: Cash on delivery');

-- ============================================
-- 9. SALES ITEMS (with Batch Tracking)
-- ============================================

-- Sale #1 (POS) - Yokohama Tire
INSERT INTO sales_items (sale_id, product_id, batch_id, quantity, unit_price, subtotal) VALUES
(1, 3, 3, 1, 14000.00, 14000.00);

-- Sale #2 (POS) - Bridgestone Tire + Castrol Oil
INSERT INTO sales_items (sale_id, product_id, batch_id, quantity, unit_price, subtotal) VALUES
(2, 2, 2, 1, 20000.00, 20000.00),
(2, 8, 8, 1, 6500.00, 6500.00);

-- Sale #3 (POS) - Amaron Battery
INSERT INTO sales_items (sale_id, product_id, batch_id, quantity, unit_price, subtotal) VALUES
(3, 5, 5, 1, 12500.00, 12500.00);

-- Sale #4 (POS) - Castrol Oil + NGK Spark Plugs
INSERT INTO sales_items (sale_id, product_id, batch_id, quantity, unit_price, subtotal) VALUES
(4, 8, 8, 1, 6500.00, 6500.00),
(4, 15, 15, 1, 4200.00, 4200.00);

-- Sale #5 (Online) - 2x Michelin Tires (with 10% discount)
INSERT INTO sales_items (sale_id, product_id, batch_id, quantity, unit_price, subtotal) VALUES
(5, 1, 1, 2, 18000.00, 36000.00);

-- Sale #6 (Online) - Amaron Battery
INSERT INTO sales_items (sale_id, product_id, batch_id, quantity, unit_price, subtotal) VALUES
(6, 5, 5, 1, 12500.00, 12500.00);

-- Sale #7 (Online) - Bridgestone Tire + Castrol Oil (Reserved)
INSERT INTO sales_items (sale_id, product_id, batch_id, quantity, unit_price, subtotal) VALUES
(7, 2, 2, 1, 20000.00, 20000.00),
(7, 8, 8, 1, 6500.00, 6500.00);

-- ============================================
-- 10. STOCK MOVEMENTS
-- ============================================

-- Purchase received
INSERT INTO stock_movements (product_id, batch_id, movement_type, reference_type, reference_id, quantity, performed_by, notes) VALUES
(1, 1, 'purchase', 'purchase', 1, 20, 2, 'PO-2026-001 received');

-- Sales (stock deductions)
INSERT INTO stock_movements (product_id, batch_id, movement_type, reference_type, reference_id, quantity, performed_by) VALUES
(1, 1, 'sale', 'sale', 5, -2, 2),
(3, 3, 'sale', 'sale', 1, -1, 2),
(2, 2, 'sale', 'sale', 2, -1, 3),
(8, 8, 'sale', 'sale', 2, -1, 3),
(5, 5, 'sale', 'sale', 3, -1, 2),
(5, 5, 'sale', 'sale', 6, -1, 2),
(8, 8, 'sale', 'sale', 4, -1, 3),
(15, 15, 'sale', 'sale', 4, -1, 3),
(2, 2, 'sale', 'sale', 7, -1, NULL),
(8, 8, 'sale', 'sale', 7, -1, NULL);

-- ============================================
-- 11. LOW STOCK ALERTS
-- ============================================
INSERT INTO low_stock_alerts (product_id, current_stock, reorder_level, alert_level, is_acknowledged) VALUES
(4, 18, 8, 'warning', FALSE),
(7, 15, 6, 'warning', FALSE);

-- ============================================
-- END OF SEED DATA
-- ============================================
