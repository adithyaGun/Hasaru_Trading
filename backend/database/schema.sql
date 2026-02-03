-- ============================================
-- HASARU TRADING - TIRE & AUTO PARTS
-- Database Schema - Final Version
-- ============================================

-- Drop and recreate database
DROP DATABASE IF EXISTS tire_auto_parts_db;
CREATE DATABASE tire_auto_parts_db;
USE tire_auto_parts_db;

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'sales_staff', 'customer') NOT NULL DEFAULT 'customer',
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 2. SUPPLIERS TABLE
-- ============================================
CREATE TABLE suppliers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    contact_person VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 3. PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100) UNIQUE,
    category VARCHAR(100),
    brand VARCHAR(100),
    unit VARCHAR(50) DEFAULT 'piece',
    purchase_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    selling_price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    reorder_level INT NOT NULL DEFAULT 10,
    minimum_stock_level INT NOT NULL DEFAULT 5,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sku (sku),
    INDEX idx_barcode (barcode),
    INDEX idx_category (category),
    INDEX idx_stock (stock_quantity),
    INDEX idx_reorder (reorder_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 4. PROMOTIONS/DISCOUNTS TABLE
-- ============================================
CREATE TABLE promotions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    applicable_to ENUM('all', 'specific') DEFAULT 'all',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dates (start_date, end_date),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 5. PRODUCT PROMOTIONS (Many-to-Many)
-- ============================================
CREATE TABLE product_promotions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    promotion_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_promotion (product_id, promotion_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 6. PURCHASES TABLE (Purchase Orders)
-- ============================================
CREATE TABLE purchases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id INT NOT NULL,
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    status ENUM('draft', 'approved', 'received', 'cancelled') NOT NULL DEFAULT 'draft',
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    received_date DATETIME,
    received_by INT,
    approved_by INT,
    approved_date DATETIME,
    auto_receive BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (received_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    INDEX idx_po_number (po_number),
    INDEX idx_status (status),
    INDEX idx_supplier (supplier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 7. PURCHASE ITEMS TABLE
-- ============================================
CREATE TABLE purchase_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    purchase_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_purchase (purchase_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 8. PRODUCT BATCHES TABLE (FIFO Inventory)
-- ============================================
CREATE TABLE product_batches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    supplier_id INT NOT NULL,
    po_id INT,
    batch_number VARCHAR(100) NOT NULL,
    quantity_received INT NOT NULL,
    quantity_remaining INT NOT NULL,
    unit_cost DECIMAL(10, 2) NOT NULL,
    received_date DATETIME NOT NULL,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (po_id) REFERENCES purchases(id) ON DELETE SET NULL,
    INDEX idx_product (product_id),
    INDEX idx_supplier (supplier_id),
    INDEX idx_po (po_id),
    INDEX idx_received_date (received_date),
    INDEX idx_active (is_active),
    INDEX idx_product_active (product_id, is_active),
    UNIQUE KEY unique_batch_number (batch_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 9. UNIFIED SALES TABLE (Online + POS)
-- ============================================
CREATE TABLE sales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    channel ENUM('online', 'pos') NOT NULL,
    sale_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
    status ENUM('reserved', 'processing', 'shipped', 'completed', 'returned', 'cancelled') NOT NULL DEFAULT 'reserved',
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_channel (channel),
    INDEX idx_customer (customer_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_sale_date (sale_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 10. SALES ITEMS TABLE (with Batch Traceability)
-- ============================================
CREATE TABLE sales_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sale_id INT NOT NULL,
    batch_id INT,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES product_batches(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_sale (sale_id),
    INDEX idx_batch (batch_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 11. STOCK MOVEMENTS TABLE (Enhanced Audit Trail)
-- ============================================
CREATE TABLE stock_movements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    batch_id INT,
    product_id INT NOT NULL,
    movement_type ENUM('purchase', 'sale', 'return', 'adjustment') NOT NULL,
    quantity INT NOT NULL,
    reference_id INT,
    reference_type VARCHAR(50),
    notes TEXT,
    performed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES product_batches(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (performed_by) REFERENCES users(id),
    INDEX idx_batch (batch_id),
    INDEX idx_product (product_id),
    INDEX idx_movement_type (movement_type),
    INDEX idx_created_at (created_at),
    INDEX idx_reference (reference_type, reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 12. STOCK LOGS TABLE (Audit Trail)
-- ============================================
CREATE TABLE stock_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    transaction_type ENUM('purchase', 'online_sale', 'otc_sale', 'pos_sale', 'adjustment', 'return') NOT NULL,
    reference_id INT,
    quantity_change INT NOT NULL,
    quantity_before INT NOT NULL,
    quantity_after INT NOT NULL,
    performed_by INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (performed_by) REFERENCES users(id),
    INDEX idx_product (product_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 13. LOW STOCK ALERTS TABLE
-- ============================================
CREATE TABLE low_stock_alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    current_stock INT NOT NULL,
    reorder_level INT NOT NULL,
    alert_level ENUM('warning', 'critical') NOT NULL,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by INT,
    acknowledged_at DATETIME,
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (acknowledged_by) REFERENCES users(id),
    INDEX idx_product (product_id),
    INDEX idx_acknowledged (is_acknowledged),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 14. SHOPPING CART TABLE (for online sales)
-- ============================================
CREATE TABLE cart (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_item (customer_id, product_id),
    INDEX idx_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to check and create low stock alert after product update
DELIMITER $$
CREATE TRIGGER after_product_stock_update
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
    IF NEW.stock_quantity <= NEW.reorder_level AND NEW.is_active = TRUE THEN
        -- Determine alert level
        SET @alert_level = IF(NEW.stock_quantity <= NEW.minimum_stock_level, 'critical', 'warning');
        
        -- Check if alert already exists and not acknowledged
        IF NOT EXISTS (
            SELECT 1 FROM low_stock_alerts 
            WHERE product_id = NEW.id 
            AND is_acknowledged = FALSE
            AND DATE(created_at) = CURDATE()
        ) THEN
            INSERT INTO low_stock_alerts (
                product_id, 
                current_stock, 
                reorder_level, 
                alert_level
            ) VALUES (
                NEW.id, 
                NEW.stock_quantity, 
                NEW.reorder_level, 
                @alert_level
            );
        END IF;
    END IF;
END$$
DELIMITER ;

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- View: Current Stock Status
CREATE VIEW v_stock_status AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.category,
    p.stock_quantity,
    p.reorder_level,
    p.minimum_stock_level,
    p.selling_price,
    p.purchase_price,
    (p.stock_quantity * p.purchase_price) AS stock_value,
    CASE 
        WHEN p.stock_quantity <= p.minimum_stock_level THEN 'Critical'
        WHEN p.stock_quantity <= p.reorder_level THEN 'Low'
        ELSE 'Normal'
    END AS stock_status
FROM products p
WHERE p.is_active = TRUE;

-- View: Sales Summary (Unified)
CREATE VIEW v_sales_summary AS
SELECT 
    channel AS sale_type,
    DATE(sale_date) AS sale_date,
    COUNT(*) AS transaction_count,
    SUM(total_amount) AS total_sales,
    SUM(discount) AS total_discounts
FROM sales
WHERE status != 'cancelled'
GROUP BY channel, DATE(sale_date);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Additional composite indexes for reporting
CREATE INDEX idx_sales_date_channel ON sales(sale_date, channel);
CREATE INDEX idx_sales_date_status ON sales(sale_date, status);
CREATE INDEX idx_sales_items_composite ON sales_items(sale_id, product_id);
CREATE INDEX idx_purchase_items_composite ON purchase_items(purchase_id, product_id);

-- ============================================
-- END OF SCHEMA
-- ============================================
