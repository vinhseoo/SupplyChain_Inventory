-- =============================================
-- V3: Create suppliers table
-- =============================================

CREATE TABLE suppliers (
    id            BIGSERIAL PRIMARY KEY,
    code          VARCHAR(50) NOT NULL UNIQUE,
    name          VARCHAR(200) NOT NULL,
    contact_name  VARCHAR(150),
    email         VARCHAR(150),
    phone         VARCHAR(50),
    tax_code      VARCHAR(50),
    address       VARCHAR(500),
    note          TEXT,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP,
    created_by    VARCHAR(100),
    updated_by    VARCHAR(100),
    version       BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_suppliers_code ON suppliers(code);
CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);
