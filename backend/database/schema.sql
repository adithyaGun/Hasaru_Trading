-- ============================================
-- TIRE & AUTO PARTS MANAGEMENT SYSTEM
-- Database Schema
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS tire_auto_parts_db;
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
-- 8. ONLINE SALES TABLE
-- ============================================
CREATE TABLE online_sales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'paid', 'processing', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
    payment_status ENUM('unpaid', 'paid', 'refunded') NOT NULL DEFAULT 'unpaid',
    payment_method VARCHAR(50),
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    shipping_address TEXT,
    notes TEXT,
    processed_by INT,
    processed_date DATETIME,
    delivered_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (processed_by) REFERENCES users(id),
    INDEX idx_order_number (order_number),
    INDEX idx_customer (customer_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_order_date (order_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 9. OTC SALES TABLE (Over-the-Counter)
-- ============================================
CREATE TABLE otc_sales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    sales_staff_id INT NOT NULL,
    sale_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    payment_method ENUM('cash', 'card', 'bank_transfer') NOT NULL DEFAULT 'cash',
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    amount_paid DECIMAL(12, 2) NOT NULL,
    change_amount DECIMAL(10, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sales_staff_id) REFERENCES users(id),
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_sales_staff (sales_staff_id),
    INDEX idx_sale_date (sale_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 10. SALE ITEMS TABLE (for both online and OTC)
-- ============================================
CREATE TABLE sale_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sale_type ENUM('online', 'otc') NOT NULL,
    sale_id INT NOT NULL, -- References either online_sales.id or otc_sales.id
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_price DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_sale (sale_type, sale_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 11. STOCK LOGS TABLE (Audit Trail)
-- ============================================
CREATE TABLE stock_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    transaction_type ENUM('purchase', 'online_sale', 'otc_sale', 'adjustment', 'return') NOT NULL,
    reference_id INT, -- ID of the related transaction
    quantity_change INT NOT NULL, -- Positive for additions, negative for deductions
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
-- 12. LOW STOCK ALERTS TABLE
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
-- 13. SHOPPING CART TABLE (for online sales)
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

-- View: Sales Summary (Combined Online + OTC)
CREATE VIEW v_sales_summary AS
SELECT 
    'online' AS sale_type,
    DATE(order_date) AS sale_date,
    COUNT(*) AS transaction_count,
    SUM(total_amount) AS total_sales,
    SUM(discount_amount) AS total_discounts
FROM online_sales
WHERE status != 'cancelled'
GROUP BY DATE(order_date)
UNION ALL
SELECT 
    'otc' AS sale_type,
    DATE(sale_date) AS sale_date,
    COUNT(*) AS transaction_count,
    SUM(total_amount) AS total_sales,
    SUM(discount_amount) AS total_discounts
FROM otc_sales
GROUP BY DATE(sale_date);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Additional indexes for reporting queries
CREATE INDEX idx_online_sales_date_status ON online_sales(order_date, status);
CREATE INDEX idx_otc_sales_date ON otc_sales(sale_date);
CREATE INDEX idx_sale_items_composite ON sale_items(sale_type, sale_id, product_id);
CREATE INDEX idx_purchase_items_composite ON purchase_items(purchase_id, product_id);

-- ============================================
-- END OF SCHEMA
-- ============================================
