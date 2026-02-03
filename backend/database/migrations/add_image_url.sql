-- Migration to add image_url column to products table
-- Run this if you already have an existing database

USE tire_auto_parts_db;

-- Add image_url column to products table
ALTER TABLE products 
ADD COLUMN image_url VARCHAR(500) AFTER description;

-- Verify the change
DESCRIBE products;
