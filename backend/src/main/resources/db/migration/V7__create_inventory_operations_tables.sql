-- =============================================
-- V7: Create inventory operations tables
-- =============================================

CREATE TABLE inventory_transactions (
    id                       BIGSERIAL PRIMARY KEY,
    code                     VARCHAR(50) NOT NULL UNIQUE,
    type                     VARCHAR(50) NOT NULL, -- INBOUND, OUTBOUND, TRANSFER
    status                   VARCHAR(50) NOT NULL, -- DRAFT, PENDING, APPROVED, COMPLETED, CANCELLED
    source_warehouse_id      BIGINT REFERENCES warehouses(id) ON DELETE SET NULL,
    destination_warehouse_id BIGINT REFERENCES warehouses(id) ON DELETE SET NULL,
    supplier_id              BIGINT REFERENCES suppliers(id) ON DELETE SET NULL,
    total_amount             NUMERIC(19, 4) NOT NULL DEFAULT 0,
    transaction_date         TIMESTAMP NOT NULL DEFAULT NOW(),
    note                     VARCHAR(500),
    created_at               TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMP,
    created_by               VARCHAR(100),
    updated_by               VARCHAR(100),
    version                  BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE transaction_items (
    id                      BIGSERIAL PRIMARY KEY,
    transaction_id          BIGINT NOT NULL REFERENCES inventory_transactions(id) ON DELETE CASCADE,
    product_id              BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity                NUMERIC(19, 4) NOT NULL,
    price                   NUMERIC(19, 4) NOT NULL DEFAULT 0,
    source_location_id      BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    destination_location_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    batch_number            VARCHAR(100),
    production_date         DATE,
    expiry_date             DATE,
    note                    VARCHAR(500),
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP,
    created_by              VARCHAR(100),
    updated_by              VARCHAR(100),
    version                 BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE product_batches (
    id                 BIGSERIAL PRIMARY KEY,
    product_id         BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    batch_number       VARCHAR(100) NOT NULL,
    supplier_id        BIGINT REFERENCES suppliers(id) ON DELETE SET NULL,
    production_date    DATE,
    expiry_date        DATE,
    quantity           NUMERIC(19, 4) NOT NULL DEFAULT 0,
    remaining_quantity NUMERIC(19, 4) NOT NULL DEFAULT 0,
    cost_price         NUMERIC(19, 4) NOT NULL DEFAULT 0,
    created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP,
    created_by         VARCHAR(100),
    updated_by         VARCHAR(100),
    version            BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_product_batch UNIQUE (product_id, batch_number)
);

CREATE TABLE stock_levels (
    id                BIGSERIAL PRIMARY KEY,
    product_id        BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id      BIGINT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    location_id       BIGINT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    batch_id          BIGINT REFERENCES product_batches(id) ON DELETE SET NULL,
    quantity          NUMERIC(19, 4) NOT NULL DEFAULT 0,
    reserved_quantity NUMERIC(19, 4) NOT NULL DEFAULT 0,
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP,
    created_by        VARCHAR(100),
    updated_by        VARCHAR(100),
    version           BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_product_stock_level UNIQUE (product_id, warehouse_id, location_id, batch_id)
);

CREATE TABLE stock_movements (
    id             BIGSERIAL PRIMARY KEY,
    product_id     BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id   BIGINT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    location_id    BIGINT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    batch_id       BIGINT REFERENCES product_batches(id) ON DELETE SET NULL,
    transaction_id BIGINT REFERENCES inventory_transactions(id) ON DELETE SET NULL,
    type           VARCHAR(50) NOT NULL, -- INBOUND, OUTBOUND, TRANSFER_OUT, TRANSFER_IN, ADJUSTMENT
    quantity       NUMERIC(19, 4) NOT NULL,
    balance_before NUMERIC(19, 4) NOT NULL,
    balance_after  NUMERIC(19, 4) NOT NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by     VARCHAR(100)
);

CREATE INDEX idx_inv_transactions_code ON inventory_transactions(code);
CREATE INDEX idx_inv_transactions_status ON inventory_transactions(status);
CREATE INDEX idx_inv_transactions_type ON inventory_transactions(type);
CREATE INDEX idx_tx_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX idx_product_batches_prod_batch ON product_batches(product_id, batch_number);
CREATE INDEX idx_stock_levels_product ON stock_levels(product_id);
CREATE INDEX idx_stock_levels_warehouse ON stock_levels(warehouse_id);
CREATE INDEX idx_stock_levels_location ON stock_levels(location_id);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_warehouse ON stock_movements(warehouse_id);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at);
