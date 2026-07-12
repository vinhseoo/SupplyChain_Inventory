-- =============================================
-- V8: Seed sample master data and inventory transaction data for Phase 3
-- =============================================

-- 1. Insert Suppliers
INSERT INTO suppliers (code, name, contact_name, email, phone, tax_code, address, note, is_active, created_by, version)
VALUES
('SUP-001', 'Cong ty Co phan Ban le An Phong', 'Nguyen Van Troi', 'anphong@retail.com', '0901234567', '0102030405', '123 Duong Ba Thang Hai, Quan 10, TP.HCM', 'Nha cung cap dien thoai & laptop si le', TRUE, 'system', 0),
('SUP-002', 'Tong Kho Gia Dung Minh Long', 'Tran Minh Long', 'minhlong@giadung.com', '0912345678', '0203040506', '456 Duong Nguyen Trai, Thanh Xuan, Ha Noi', 'Nha cung cap do dien gia dung va nha bep', TRUE, 'system', 0),
('SUP-003', 'Nha phan phoi Dien may TechMart', 'Le Thu Ha', 'sales@techmart.com', '0987654321', '0304050607', '789 Duong Dien Bien Phu, Binh Thanh, TP.HCM', 'Cung cap phu kien dien tu', TRUE, 'system', 0)
ON CONFLICT (code) DO NOTHING;

-- 2. Insert Warehouses
INSERT INTO warehouses (code, name, address, description, is_active, created_by, version)
VALUES
('WH-001', 'Kho trung tam Ha Noi', 'So 1, Linh Nam, Hoang Mai, Ha Noi', 'Kho chua san pham gia dung va linh kien mien Bac', TRUE, 'system', 0),
('WH-002', 'Kho trung tam HCM', 'So 10, Song Hanh, Quan 12, TP.HCM', 'Kho chua hang thuc pham kho va dien tu mien Nam', TRUE, 'system', 0)
ON CONFLICT (code) DO NOTHING;

-- 3. Insert Locations (Zone -> Aisle -> Shelf -> Bin)
-- WH-001
INSERT INTO locations (code, name, warehouse_id, parent_id, type, description, is_active, created_by, version)
SELECT 'ZONE-A', 'Phan khu A (Hang gia dung)', id, NULL, 'ZONE', 'Khu vuc luu tru hang gia dung', TRUE, 'system', 0
FROM warehouses WHERE code = 'WH-001'
ON CONFLICT (code) DO NOTHING;

INSERT INTO locations (code, name, warehouse_id, parent_id, type, description, is_active, created_by, version)
SELECT 'AISLE-A1', 'Day A1', w.id, p.id, 'AISLE', 'Loi di day A1', TRUE, 'system', 0
FROM warehouses w, locations p WHERE w.code = 'WH-001' AND p.code = 'ZONE-A'
ON CONFLICT (code) DO NOTHING;

INSERT INTO locations (code, name, warehouse_id, parent_id, type, description, is_active, created_by, version)
SELECT 'SHELF-A1-01', 'Ke A1-01', w.id, p.id, 'SHELF', 'Ke tang 1 day A1', TRUE, 'system', 0
FROM warehouses w, locations p WHERE w.code = 'WH-001' AND p.code = 'AISLE-A1'
ON CONFLICT (code) DO NOTHING;

INSERT INTO locations (code, name, warehouse_id, parent_id, type, description, is_active, created_by, version)
SELECT 'BIN-A1-01-A', 'Hoc chua A1-01-A', w.id, p.id, 'BIN', 'Hoc chua hang A', TRUE, 'system', 0
FROM warehouses w, locations p WHERE w.code = 'WH-001' AND p.code = 'SHELF-A1-01'
ON CONFLICT (code) DO NOTHING;

-- WH-002
INSERT INTO locations (code, name, warehouse_id, parent_id, type, description, is_active, created_by, version)
SELECT 'ZONE-B', 'Phan khu B (Hang dien tu)', id, NULL, 'ZONE', 'Khu vuc luu tru hang dien tu', TRUE, 'system', 0
FROM warehouses WHERE code = 'WH-002'
ON CONFLICT (code) DO NOTHING;

INSERT INTO locations (code, name, warehouse_id, parent_id, type, description, is_active, created_by, version)
SELECT 'AISLE-B1', 'Day B1', w.id, p.id, 'AISLE', 'Loi di day B1', TRUE, 'system', 0
FROM warehouses w, locations p WHERE w.code = 'WH-002' AND p.code = 'ZONE-B'
ON CONFLICT (code) DO NOTHING;

INSERT INTO locations (code, name, warehouse_id, parent_id, type, description, is_active, created_by, version)
SELECT 'SHELF-B1-01', 'Ke B1-01', w.id, p.id, 'SHELF', 'Ke tang 1 day B1', TRUE, 'system', 0
FROM warehouses w, locations p WHERE w.code = 'WH-002' AND p.code = 'AISLE-B1'
ON CONFLICT (code) DO NOTHING;

-- 4. Insert Categories
INSERT INTO categories (code, name, parent_id, description, is_active, created_by, version) VALUES
('ELEC', 'Thiet bi dien tu', NULL, 'Thiet bi dien thoai, may tinh, phu kien cong nghe', TRUE, 'system', 0)
ON CONFLICT (code) DO NOTHING;

INSERT INTO categories (code, name, parent_id, description, is_active, created_by, version)
SELECT 'MOBILE', 'Dien thoai di dong', id, 'Dien thoai thong minh cac hang', TRUE, 'system', 0
FROM categories WHERE code = 'ELEC'
ON CONFLICT (code) DO NOTHING;

INSERT INTO categories (code, name, parent_id, description, is_active, created_by, version)
SELECT 'LAPTOP', 'May tinh xach tay', id, 'May tinh ca nhan, laptop van phong, do hoa', TRUE, 'system', 0
FROM categories WHERE code = 'ELEC'
ON CONFLICT (code) DO NOTHING;

INSERT INTO categories (code, name, parent_id, description, is_active, created_by, version) VALUES
('APPL', 'Dien gia dung', NULL, 'Do gia dung nha bep, phong khach', TRUE, 'system', 0)
ON CONFLICT (code) DO NOTHING;

INSERT INTO categories (code, name, parent_id, description, is_active, created_by, version)
SELECT 'KITCHEN', 'Do dung nha bep', id, 'Noi com dien, noi chien khong dau, bep tu', TRUE, 'system', 0
FROM categories WHERE code = 'APPL'
ON CONFLICT (code) DO NOTHING;

-- 5. Insert Units of Measure (UOMs)
INSERT INTO units_of_measure (code, name, description, is_active, created_by, version)
VALUES
('PCS', 'Cai', 'Don vi dem chiec don le', TRUE, 'system', 0),
('BOX', 'Hop', 'Hop dong goi carton nho', TRUE, 'system', 0),
('KG', 'Kilogam', 'Don vi khoi luong tieu chuan', TRUE, 'system', 0),
('PACK', 'Goi', 'Bich hoac tui goi nho', TRUE, 'system', 0)
ON CONFLICT (code) DO NOTHING;

-- 6. Insert Products
INSERT INTO products (code, name, sku, barcode, category_id, uom_id, description, minimum_stock, maximum_stock, price, properties, is_active, created_by, version)
SELECT 'PROD-001', 'iPhone 15 Pro Max 256GB', 'SKU-IP15PM256', '8930123456701', c.id, u.id, 'Dien thoai thong minh Apple iPhone 15 Pro Max phien ban 256GB', 5, 50, 29000000, '{"color": "Titan Tu Nhien", "weight": "221g", "battery": "4441mAh"}'::jsonb, TRUE, 'system', 0
FROM categories c, units_of_measure u WHERE c.code = 'MOBILE' AND u.code = 'PCS'
ON CONFLICT (code) DO NOTHING;

INSERT INTO products (code, name, sku, barcode, category_id, uom_id, description, minimum_stock, maximum_stock, price, properties, is_active, created_by, version)
SELECT 'PROD-002', 'MacBook Air M3 13 Inch', 'SKU-MBA313256', '8930123456702', c.id, u.id, 'May tinh xach tay Apple MacBook Air chip M3 13-inch', 3, 30, 26500000, '{"cpu": "Apple M3", "ram": "8GB", "ssd": "256GB", "color": "Space Grey"}'::jsonb, TRUE, 'system', 0
FROM categories c, units_of_measure u WHERE c.code = 'LAPTOP' AND u.code = 'PCS'
ON CONFLICT (code) DO NOTHING;

INSERT INTO products (code, name, sku, barcode, category_id, uom_id, description, minimum_stock, maximum_stock, price, properties, is_active, created_by, version)
SELECT 'PROD-003', 'Noi chien khong dau Philips HD9252', 'SKU-NCKDP9252', '8930123456703', c.id, u.id, 'Noi chien chan khong co hoc hang Philips dung tich 4.1L', 10, 100, 2450000, '{"capacity": "4.1L", "power": "1400W", "color": "Glossy Black"}'::jsonb, TRUE, 'system', 0
FROM categories c, units_of_measure u WHERE c.code = 'KITCHEN' AND u.code = 'PCS'
ON CONFLICT (code) DO NOTHING;

-- 7. Seed Product Batches (Lo hang mau)
INSERT INTO product_batches (product_id, batch_number, supplier_id, production_date, expiry_date, quantity, remaining_quantity, cost_price, created_by, version)
SELECT p.id, 'LOT-IP15-001', s.id, '2026-01-10', '2028-01-10', 50.0000, 35.0000, 28000000.0000, 'system', 0
FROM products p, suppliers s WHERE p.code = 'PROD-001' AND s.code = 'SUP-001'
ON CONFLICT (product_id, batch_number) DO NOTHING;

INSERT INTO product_batches (product_id, batch_number, supplier_id, production_date, expiry_date, quantity, remaining_quantity, cost_price, created_by, version)
SELECT p.id, 'LOT-IP15-002', s.id, '2026-03-15', '2028-03-15', 30.0000, 30.0000, 28500000.0000, 'system', 0
FROM products p, suppliers s WHERE p.code = 'PROD-001' AND s.code = 'SUP-001'
ON CONFLICT (product_id, batch_number) DO NOTHING;

INSERT INTO product_batches (product_id, batch_number, supplier_id, production_date, expiry_date, quantity, remaining_quantity, cost_price, created_by, version)
SELECT p.id, 'LOT-MBA3-001', s.id, '2026-02-20', '2029-02-20', 20.0000, 18.0000, 25500000.0000, 'system', 0
FROM products p, suppliers s WHERE p.code = 'PROD-002' AND s.code = 'SUP-003'
ON CONFLICT (product_id, batch_number) DO NOTHING;

-- 8. Seed Stock Levels (So du ton kho mau tai cac vi tri)
INSERT INTO stock_levels (product_id, warehouse_id, location_id, batch_id, quantity, reserved_quantity, created_by, version)
SELECT p.id, w.id, l.id, pb.id, 20.0000, 0.0000, 'system', 0
FROM products p, warehouses w, locations l, product_batches pb
WHERE p.code = 'PROD-001' AND w.code = 'WH-001' AND l.code = 'BIN-A1-01-A' AND pb.batch_number = 'LOT-IP15-001'
ON CONFLICT (product_id, warehouse_id, location_id, batch_id) DO NOTHING;

INSERT INTO stock_levels (product_id, warehouse_id, location_id, batch_id, quantity, reserved_quantity, created_by, version)
SELECT p.id, w.id, l.id, pb.id, 15.0000, 0.0000, 'system', 0
FROM products p, warehouses w, locations l, product_batches pb
WHERE p.code = 'PROD-001' AND w.code = 'WH-002' AND l.code = 'SHELF-B1-01' AND pb.batch_number = 'LOT-IP15-001'
ON CONFLICT (product_id, warehouse_id, location_id, batch_id) DO NOTHING;

INSERT INTO stock_levels (product_id, warehouse_id, location_id, batch_id, quantity, reserved_quantity, created_by, version)
SELECT p.id, w.id, l.id, pb.id, 30.0000, 0.0000, 'system', 0
FROM products p, warehouses w, locations l, product_batches pb
WHERE p.code = 'PROD-001' AND w.code = 'WH-001' AND l.code = 'BIN-A1-01-A' AND pb.batch_number = 'LOT-IP15-002'
ON CONFLICT (product_id, warehouse_id, location_id, batch_id) DO NOTHING;

INSERT INTO stock_levels (product_id, warehouse_id, location_id, batch_id, quantity, reserved_quantity, created_by, version)
SELECT p.id, w.id, l.id, pb.id, 18.0000, 0.0000, 'system', 0
FROM products p, warehouses w, locations l, product_batches pb
WHERE p.code = 'PROD-002' AND w.code = 'WH-002' AND l.code = 'SHELF-B1-01' AND pb.batch_number = 'LOT-MBA3-001'
ON CONFLICT (product_id, warehouse_id, location_id, batch_id) DO NOTHING;

-- 9. Seed Inventory Transactions & Items (Phieu kho mau)
-- Transaction 1: Inbound (COMPLETED)
INSERT INTO inventory_transactions (code, type, status, source_warehouse_id, destination_warehouse_id, supplier_id, total_amount, transaction_date, note, created_by, version)
SELECT 'TX-20260712-001', 'INBOUND', 'COMPLETED', NULL, w.id, s.id, 1400000000.0000, '2026-07-10 09:00:00', 'Nhap kho lo dien thoai iPhone 15 Pro Max', 'system', 0
FROM warehouses w, suppliers s WHERE w.code = 'WH-001' AND s.code = 'SUP-001'
ON CONFLICT (code) DO NOTHING;

INSERT INTO transaction_items (transaction_id, product_id, quantity, price, source_location_id, destination_location_id, batch_number, production_date, expiry_date, note, created_by, version)
SELECT tx.id, p.id, 50.0000, 28000000.0000, NULL, l.id, 'LOT-IP15-001', '2026-01-10', '2028-01-10', 'Nhap day A1', 'system', 0
FROM inventory_transactions tx, products p, locations l
WHERE tx.code = 'TX-20260712-001' AND p.code = 'PROD-001' AND l.code = 'BIN-A1-01-A'
ON CONFLICT (id) DO NOTHING;

-- Transaction 2: Outbound (PENDING)
INSERT INTO inventory_transactions (code, type, status, source_warehouse_id, destination_warehouse_id, supplier_id, total_amount, transaction_date, note, created_by, version)
SELECT 'TX-20260712-002', 'OUTBOUND', 'PENDING', w.id, NULL, NULL, 58000000.0000, '2026-07-12 10:30:00', 'Xuat kho giao cho khach hang ban le', 'system', 0
FROM warehouses w WHERE w.code = 'WH-001'
ON CONFLICT (code) DO NOTHING;

INSERT INTO transaction_items (transaction_id, product_id, quantity, price, source_location_id, destination_location_id, batch_number, production_date, expiry_date, note, created_by, version)
SELECT tx.id, p.id, 2.0000, 29000000.0000, l.id, NULL, 'LOT-IP15-001', NULL, NULL, 'Xuat ke A1', 'system', 0
FROM inventory_transactions tx, products p, locations l
WHERE tx.code = 'TX-20260712-002' AND p.code = 'PROD-001' AND l.code = 'BIN-A1-01-A'
ON CONFLICT (id) DO NOTHING;

-- 10. Seed Stock Movements (The kho logs mau)
INSERT INTO stock_movements (product_id, warehouse_id, location_id, batch_id, transaction_id, type, quantity, balance_before, balance_after, created_at, created_by)
SELECT p.id, w.id, l.id, pb.id, tx.id, 'INBOUND', 50.0000, 0.0000, 50.0000, '2026-07-10 09:00:00', 'system'
FROM products p, warehouses w, locations l, product_batches pb, inventory_transactions tx
WHERE p.code = 'PROD-001' AND w.code = 'WH-001' AND l.code = 'BIN-A1-01-A' AND pb.batch_number = 'LOT-IP15-001' AND tx.code = 'TX-20260712-001'
ON CONFLICT (id) DO NOTHING;
