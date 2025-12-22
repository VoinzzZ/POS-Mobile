-- Migration to rename product_stock to product_qty in m_product table
-- Run this manually in your MySQL database

ALTER TABLE `m_product` CHANGE COLUMN `product_stock` `product_qty` INT NOT NULL DEFAULT 0;