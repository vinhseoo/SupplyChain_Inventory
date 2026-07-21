-- =============================================
-- V15: Seed Sample Data for Analytics & Materialized Views
-- =============================================

-- 1. Insert additional products with varied categories and stock levels
INSERT INTO products (code, name, sku, barcode, category_id, uom_id, description, minimum_stock, maximum_stock, price, properties, is_active, created_at, created_by, version)
SELECT 'PROD-004', 'Chuột không dây Magic Mouse 2', 'SKU-APPLE-MM2', '8930123456704', c.id, u.id, 'Chuột Apple Magic Mouse 2 màu trắng', 5, 50, 2190000, '{"color": "White"}'::jsonb, TRUE, CURRENT_TIMESTAMP - INTERVAL '95 days', 'system', 0
FROM categories c, units_of_measure u WHERE c.code = 'MOBILE' AND u.code = 'PCS'
ON CONFLICT (code) DO NOTHING;

INSERT INTO products (code, name, sku, barcode, category_id, uom_id, description, minimum_stock, maximum_stock, price, properties, is_active, created_at, created_by, version)
SELECT 'PROD-005', 'Bàn phím cơ Logitech MX Keys', 'SKU-LOGI-MX', '8930123456705', c.id, u.id, 'Bàn phím không dây cao cấp Logitech MX Keys', 5, 50, 2990000, '{"color": "Graphite"}'::jsonb, TRUE, CURRENT_TIMESTAMP - INTERVAL '75 days', 'system', 0
FROM categories c, units_of_measure u WHERE c.code = 'LAPTOP' AND u.code = 'PCS'
ON CONFLICT (code) DO NOTHING;

INSERT INTO products (code, name, sku, barcode, category_id, uom_id, description, minimum_stock, maximum_stock, price, properties, is_active, created_at, created_by, version)
SELECT 'PROD-006', 'Màn hình Dell UltraSharp U2723QE', 'SKU-DELL-U2723', '8930123456706', c.id, u.id, 'Màn hình đồ họa 27 inch 4K IPS Dell', 3, 20, 12900000, '{"resolution": "4K", "size": "27 inch"}'::jsonb, TRUE, CURRENT_TIMESTAMP - INTERVAL '105 days', 'system', 0
FROM categories c, units_of_measure u WHERE c.code = 'LAPTOP' AND u.code = 'PCS'
ON CONFLICT (code) DO NOTHING;

-- 2. Insert Stock Levels for slow moving products
INSERT INTO stock_levels (product_id, warehouse_id, location_id, batch_id, quantity, reserved_quantity, created_by, version)
SELECT p.id, w.id, l.id, NULL, 60.0000, 0.0000, 'system', 0
FROM products p, warehouses w, locations l
WHERE p.code = 'PROD-004' AND w.code = 'WH-001' AND l.code = 'BIN-A1-01-A'
ON CONFLICT (product_id, warehouse_id, location_id, batch_id) DO NOTHING;

INSERT INTO stock_levels (product_id, warehouse_id, location_id, batch_id, quantity, reserved_quantity, created_by, version)
SELECT p.id, w.id, l.id, NULL, 80.0000, 0.0000, 'system', 0
FROM products p, warehouses w, locations l
WHERE p.code = 'PROD-005' AND w.code = 'WH-001' AND l.code = 'BIN-A1-01-A'
ON CONFLICT (product_id, warehouse_id, location_id, batch_id) DO NOTHING;

INSERT INTO stock_levels (product_id, warehouse_id, location_id, batch_id, quantity, reserved_quantity, created_by, version)
SELECT p.id, w.id, l.id, NULL, 15.0000, 0.0000, 'system', 0
FROM products p, warehouses w, locations l
WHERE p.code = 'PROD-006' AND w.code = 'WH-001' AND l.code = 'BIN-A1-01-A'
ON CONFLICT (product_id, warehouse_id, location_id, batch_id) DO NOTHING;

INSERT INTO stock_levels (product_id, warehouse_id, location_id, batch_id, quantity, reserved_quantity, created_by, version)
SELECT p.id, w.id, l.id, NULL, 10.0000, 0.0000, 'system', 0
FROM products p, warehouses w, locations l
WHERE p.code = 'PROD-003' AND w.code = 'WH-001' AND l.code = 'BIN-A1-01-A'
ON CONFLICT (product_id, warehouse_id, location_id, batch_id) DO NOTHING;

-- Update PROD-003 created_at date to 45 days ago for slow moving demo
UPDATE products SET created_at = CURRENT_TIMESTAMP - INTERVAL '45 days' WHERE code = 'PROD-003';

-- 3. Insert Outbound Stock Movements in the last 30 days for Stock Depletion Forecast
-- PROD-003 (Nồi chiên Philips): Stock 10, Outbound 60 in last 30 days -> rate 2/day -> days_to_out = 5 days (Urgent! < 7d)
INSERT INTO stock_movements (product_id, warehouse_id, location_id, batch_id, type, quantity, balance_before, balance_after, created_at, created_by)
SELECT p.id, w.id, l.id, NULL, 'OUTBOUND', -60.0000, 70.0000, 10.0000, CURRENT_TIMESTAMP - INTERVAL '10 days', 'system'
FROM products p, warehouses w, locations l
WHERE p.code = 'PROD-003' AND w.code = 'WH-001' AND l.code = 'BIN-A1-01-A';

-- PROD-002 (MacBook Air): Stock 18, Outbound 39 in last 30 days -> rate 1.3/day -> days_to_out = 13.8 days (Warning! < 15d)
INSERT INTO stock_movements (product_id, warehouse_id, location_id, batch_id, type, quantity, balance_before, balance_after, created_at, created_by)
SELECT p.id, w.id, l.id, NULL, 'OUTBOUND', -39.0000, 57.0000, 18.0000, CURRENT_TIMESTAMP - INTERVAL '12 days', 'system'
FROM products p, warehouses w, locations l
WHERE p.code = 'PROD-002' AND w.code = 'WH-002' AND l.code = 'SHELF-B1-01';

-- PROD-001 (iPhone 15 PM): Stock 65, Outbound 75 in last 30 days -> rate 2.5/day -> days_to_out = 26 days (Replenish < 30d)
INSERT INTO stock_movements (product_id, warehouse_id, location_id, batch_id, type, quantity, balance_before, balance_after, created_at, created_by)
SELECT p.id, w.id, l.id, NULL, 'OUTBOUND', -75.0000, 140.0000, 65.0000, CURRENT_TIMESTAMP - INTERVAL '15 days', 'system'
FROM products p, warehouses w, locations l
WHERE p.code = 'PROD-001' AND w.code = 'WH-001' AND l.code = 'BIN-A1-01-A';

-- 4. Refresh Materialized Views to populate DB tables
REFRESH MATERIALIZED VIEW mv_product_abc_classification;
REFRESH MATERIALIZED VIEW mv_slow_moving_inventory;
REFRESH MATERIALIZED VIEW mv_stock_out_forecast;
