-- =============================================
-- V4: Create warehouses and locations tables
-- =============================================

CREATE TABLE warehouses (
    id            BIGSERIAL PRIMARY KEY,
    code          VARCHAR(50) NOT NULL UNIQUE,
    name          VARCHAR(200) NOT NULL,
    address       VARCHAR(500),
    description   VARCHAR(500),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP,
    created_by    VARCHAR(100),
    updated_by    VARCHAR(100),
    version       BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE locations (
    id            BIGSERIAL PRIMARY KEY,
    code          VARCHAR(50) NOT NULL UNIQUE,
    name          VARCHAR(200) NOT NULL,
    warehouse_id  BIGINT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    parent_id     BIGINT REFERENCES locations(id) ON DELETE CASCADE,
    type          VARCHAR(50) NOT NULL, -- ZONE, AISLE, SHELF, RACK, BIN, etc.
    description   VARCHAR(500),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP,
    created_by    VARCHAR(100),
    updated_by    VARCHAR(100),
    version       BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_warehouses_code ON warehouses(code);
CREATE INDEX idx_warehouses_is_active ON warehouses(is_active);

CREATE INDEX idx_locations_code ON locations(code);
CREATE INDEX idx_locations_warehouse_id ON locations(warehouse_id);
CREATE INDEX idx_locations_parent_id ON locations(parent_id);
CREATE INDEX idx_locations_is_active ON locations(is_active);
