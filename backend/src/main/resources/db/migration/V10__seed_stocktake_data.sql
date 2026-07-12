-- =============================================
-- V10: Seed stocktake sessions and adjustments data for Phase 4
-- =============================================

-- 1. Insert Stocktake Sessions
-- Session 1: DRAFT in WH-001
INSERT INTO stocktake_sessions (code, warehouse_id, status, note, created_by, version)
SELECT 'ST-20260712-001', id, 'DRAFT', 'Kiem ke kho dinh ky thang 7 mien Bac', 'system', 0
FROM warehouses WHERE code = 'WH-001'
ON CONFLICT (code) DO NOTHING;

-- Session 2: COMPLETED in WH-002
INSERT INTO stocktake_sessions (code, warehouse_id, status, note, created_by, version)
SELECT 'ST-20260712-002', id, 'COMPLETED', 'Kiem ke dot xuat hang dien thoai & macbook HCM', 'system', 0
FROM warehouses WHERE code = 'WH-002'
ON CONFLICT (code) DO NOTHING;

-- Session 3: ADJUSTED in WH-002
INSERT INTO stocktake_sessions (code, warehouse_id, status, note, created_by, version)
SELECT 'ST-20260712-003', id, 'ADJUSTED', 'Kiem ke de lam sach so lieu ton kho truoc bao cao', 'system', 0
FROM warehouses WHERE code = 'WH-002'
ON CONFLICT (code) DO NOTHING;


-- 2. Insert Stocktake Items
-- Under Session 1 (ST-20260712-001)
INSERT INTO stocktake_items (stocktake_session_id, product_id, location_id, batch_id, system_quantity, actual_quantity, variance, note, created_by, version)
SELECT s.id, p.id, l.id, pb.id, 20.0000, 0.0000, -20.0000, 'Chua quet', 'system', 0
FROM stocktake_sessions s, products p, locations l, product_batches pb
WHERE s.code = 'ST-20260712-001' AND p.code = 'PROD-001' AND l.code = 'BIN-A1-01-A' AND pb.batch_number = 'LOT-IP15-001';

INSERT INTO stocktake_items (stocktake_session_id, product_id, location_id, batch_id, system_quantity, actual_quantity, variance, note, created_by, version)
SELECT s.id, p.id, l.id, pb.id, 30.0000, 0.0000, -30.0000, 'Chua quet', 'system', 0
FROM stocktake_sessions s, products p, locations l, product_batches pb
WHERE s.code = 'ST-20260712-001' AND p.code = 'PROD-001' AND l.code = 'BIN-A1-01-A' AND pb.batch_number = 'LOT-IP15-002';

-- Under Session 2 (ST-20260712-002)
INSERT INTO stocktake_items (stocktake_session_id, product_id, location_id, batch_id, system_quantity, actual_quantity, variance, note, created_by, version)
SELECT s.id, p.id, l.id, pb.id, 15.0000, 14.0000, -1.0000, 'Thieu 1 cai hop bi mop', 'system', 0
FROM stocktake_sessions s, products p, locations l, product_batches pb
WHERE s.code = 'ST-20260712-002' AND p.code = 'PROD-001' AND l.code = 'SHELF-B1-01' AND pb.batch_number = 'LOT-IP15-001';

INSERT INTO stocktake_items (stocktake_session_id, product_id, location_id, batch_id, system_quantity, actual_quantity, variance, note, created_by, version)
SELECT s.id, p.id, l.id, pb.id, 18.0000, 19.0000, 1.0000, 'Thua 1 cai nam trong goc ke', 'system', 0
FROM stocktake_sessions s, products p, locations l, product_batches pb
WHERE s.code = 'ST-20260712-002' AND p.code = 'PROD-002' AND l.code = 'SHELF-B1-01' AND pb.batch_number = 'LOT-MBA3-001';

-- Under Session 3 (ST-20260712-003)
INSERT INTO stocktake_items (stocktake_session_id, product_id, location_id, batch_id, system_quantity, actual_quantity, variance, note, created_by, version)
SELECT s.id, p.id, l.id, pb.id, 15.0000, 15.0000, 0.0000, 'Khop', 'system', 0
FROM stocktake_sessions s, products p, locations l, product_batches pb
WHERE s.code = 'ST-20260712-003' AND p.code = 'PROD-001' AND l.code = 'SHELF-B1-01' AND pb.batch_number = 'LOT-IP15-001';

INSERT INTO stocktake_items (stocktake_session_id, product_id, location_id, batch_id, system_quantity, actual_quantity, variance, note, created_by, version)
SELECT s.id, p.id, l.id, pb.id, 18.0000, 16.0000, -2.0000, 'Thieu mat 2 cai chua ro nguyen nhan', 'system', 0
FROM stocktake_sessions s, products p, locations l, product_batches pb
WHERE s.code = 'ST-20260712-003' AND p.code = 'PROD-002' AND l.code = 'SHELF-B1-01' AND pb.batch_number = 'LOT-MBA3-001';


-- 3. Insert Stock Adjustments
-- Adjustment for Session 3 (ST-20260712-003)
INSERT INTO stock_adjustments (code, stocktake_session_id, warehouse_id, status, reason, created_by, version)
SELECT 'ADJ-20260712-001', s.id, w.id, 'APPROVED', 'Dieu chinh chenh lech tu phien kiem ke ST-20260712-003', 'system', 0
FROM stocktake_sessions s, warehouses w
WHERE s.code = 'ST-20260712-003' AND w.code = 'WH-002'
ON CONFLICT (code) DO NOTHING;


-- 4. Insert Stock Adjustment Items
INSERT INTO stock_adjustment_items (stock_adjustment_id, product_id, location_id, batch_id, system_quantity, actual_quantity, adjusted_quantity, reason, created_by, version)
SELECT adj.id, p.id, l.id, pb.id, 18.0000, 16.0000, -2.0000, 'Sai lech kiem ke: -2.0000', 'system', 0
FROM stock_adjustments adj, products p, locations l, product_batches pb
WHERE adj.code = 'ADJ-20260712-001' AND p.code = 'PROD-002' AND l.code = 'SHELF-B1-01' AND pb.batch_number = 'LOT-MBA3-001';
