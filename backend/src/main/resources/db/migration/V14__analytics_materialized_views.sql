-- =============================================
-- V14: Create Materialized Views for Dashboard & Analytics
-- =============================================

-- 1. Create ABC Classification Materialized View
CREATE MATERIALIZED VIEW mv_product_abc_classification AS
WITH product_value AS (
    SELECT 
        sl.product_id,
        p.name,
        p.sku,
        COALESCE(SUM(sl.quantity * p.price), 0) as total_val
    FROM stock_levels sl
    JOIN products p ON sl.product_id = p.id
    GROUP BY sl.product_id, p.name, p.sku
),
running_pct AS (
    SELECT 
        product_id,
        name,
        sku,
        total_val,
        CASE 
            WHEN SUM(total_val) OVER () = 0 THEN 0
            ELSE SUM(total_val) OVER (ORDER BY total_val DESC) / SUM(total_val) OVER ()
        END as cum_pct
    FROM product_value
)
SELECT 
    product_id,
    name,
    sku,
    total_val,
    cum_pct,
    CASE 
        WHEN cum_pct <= 0.80 THEN 'A'
        WHEN cum_pct <= 0.95 THEN 'B'
        ELSE 'C'
    END as abc_class
FROM running_pct;

CREATE UNIQUE INDEX idx_mv_abc_product_id ON mv_product_abc_classification(product_id);


-- 2. Create Slow-Moving Inventory Materialized View
CREATE MATERIALIZED VIEW mv_slow_moving_inventory AS
SELECT 
    p.id as product_id,
    p.name,
    p.sku,
    p.price,
    COALESCE(SUM(sl.quantity), 0) as current_stock,
    COALESCE(MAX(sm.created_at), p.created_at) as last_movement_date,
    (NOW()::date - COALESCE(MAX(sm.created_at), p.created_at)::date) as days_inactive
FROM products p
LEFT JOIN stock_levels sl ON sl.product_id = p.id
LEFT JOIN stock_movements sm ON sm.product_id = p.id
GROUP BY p.id, p.name, p.sku, p.price;

CREATE UNIQUE INDEX idx_mv_slow_product_id ON mv_slow_moving_inventory(product_id);


-- 3. Create Stock depletion forecast Materialized View (30 days average rate)
CREATE MATERIALIZED VIEW mv_stock_out_forecast AS
WITH daily_consumption AS (
    SELECT 
        product_id,
        ABS(SUM(quantity)) as total_out_qty,
        ABS(SUM(quantity)) / 30.0 as avg_daily_rate
    FROM stock_movements
    WHERE type IN ('OUTBOUND', 'TRANSFER_OUT') AND created_at >= NOW() - INTERVAL '30 days'
    GROUP BY product_id
),
current_stock AS (
    SELECT 
        product_id,
        SUM(quantity) as total_qty
    FROM stock_levels
    GROUP BY product_id
)
SELECT 
    p.id as product_id,
    p.name,
    p.sku,
    COALESCE(cs.total_qty, 0) as current_stock,
    COALESCE(dc.avg_daily_rate, 0) as avg_daily_consumption,
    CASE 
        WHEN COALESCE(dc.avg_daily_rate, 0) = 0 THEN 9999 -- Infinite days
        ELSE ROUND(COALESCE(cs.total_qty, 0) / dc.avg_daily_rate, 1)
    END as days_to_out
FROM products p
LEFT JOIN current_stock cs ON cs.product_id = p.id
LEFT JOIN daily_consumption dc ON dc.product_id = p.id;

CREATE UNIQUE INDEX idx_mv_forecast_product_id ON mv_stock_out_forecast(product_id);
