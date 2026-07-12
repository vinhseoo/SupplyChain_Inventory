-- =============================================
-- V9: Create Stocktake and Stock Adjustment tables
-- =============================================

CREATE TABLE stocktake_sessions (
    id             BIGSERIAL PRIMARY KEY,
    code           VARCHAR(50) NOT NULL UNIQUE,
    warehouse_id   BIGINT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    status         VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, COMPLETED, ADJUSTED, CANCELLED
    note           VARCHAR(500),
    
    -- Audit fields
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP,
    created_by     VARCHAR(100),
    updated_by     VARCHAR(100),
    version        BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE stocktake_items (
    id                  BIGSERIAL PRIMARY KEY,
    stocktake_session_id BIGINT NOT NULL REFERENCES stocktake_sessions(id) ON DELETE CASCADE,
    product_id          BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    location_id         BIGINT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    batch_id            BIGINT REFERENCES product_batches(id) ON DELETE SET NULL,
    system_quantity     NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    actual_quantity     NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    variance            NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    note                VARCHAR(255),
    
    -- Audit fields
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP,
    created_by     VARCHAR(100),
    updated_by     VARCHAR(100),
    version        BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE stock_adjustments (
    id                  BIGSERIAL PRIMARY KEY,
    code                VARCHAR(50) NOT NULL UNIQUE,
    stocktake_session_id BIGINT REFERENCES stocktake_sessions(id) ON DELETE SET NULL,
    warehouse_id        BIGINT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    status              VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, APPROVED, CANCELLED
    reason              VARCHAR(500),
    
    -- Audit fields
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP,
    created_by     VARCHAR(100),
    updated_by     VARCHAR(100),
    version        BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE stock_adjustment_items (
    id                  BIGSERIAL PRIMARY KEY,
    stock_adjustment_id  BIGINT NOT NULL REFERENCES stock_adjustments(id) ON DELETE CASCADE,
    product_id          BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    location_id         BIGINT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    batch_id            BIGINT REFERENCES product_batches(id) ON DELETE SET NULL,
    system_quantity     NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    actual_quantity     NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    adjusted_quantity   NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    reason              VARCHAR(255),
    
    -- Audit fields
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP,
    created_by     VARCHAR(100),
    updated_by     VARCHAR(100),
    version        BIGINT NOT NULL DEFAULT 0
);

-- Indexes for performance & integrity
CREATE INDEX idx_stocktake_sessions_warehouse_id ON stocktake_sessions(warehouse_id);
CREATE INDEX idx_stocktake_sessions_code ON stocktake_sessions(code);
CREATE INDEX idx_stocktake_items_session_id ON stocktake_items(stocktake_session_id);
CREATE INDEX idx_stocktake_items_product_id ON stocktake_items(product_id);
CREATE INDEX idx_stocktake_items_location_id ON stocktake_items(location_id);
CREATE INDEX idx_stock_adjustments_warehouse_id ON stock_adjustments(warehouse_id);
CREATE INDEX idx_stock_adjustments_code ON stock_adjustments(code);
CREATE INDEX idx_stock_adjustment_items_adjustment_id ON stock_adjustment_items(stock_adjustment_id);
CREATE INDEX idx_stock_adjustment_items_product_id ON stock_adjustment_items(product_id);
CREATE INDEX idx_stock_adjustment_items_location_id ON stock_adjustment_items(location_id);
