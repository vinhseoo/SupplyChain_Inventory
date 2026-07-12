-- =============================================
-- V5: Create categories, units_of_measure, and products tables
-- =============================================

CREATE TABLE categories (
    id            BIGSERIAL PRIMARY KEY,
    code          VARCHAR(50) NOT NULL UNIQUE,
    name          VARCHAR(200) NOT NULL,
    parent_id     BIGINT REFERENCES categories(id) ON DELETE CASCADE,
    description   VARCHAR(500),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP,
    created_by    VARCHAR(100),
    updated_by    VARCHAR(100),
    version       BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE units_of_measure (
    id            BIGSERIAL PRIMARY KEY,
    code          VARCHAR(50) NOT NULL UNIQUE,
    name          VARCHAR(150) NOT NULL,
    description   VARCHAR(500),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP,
    created_by    VARCHAR(100),
    updated_by    VARCHAR(100),
    version       BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE products (
    id            BIGSERIAL PRIMARY KEY,
    code          VARCHAR(50) NOT NULL UNIQUE,
    name          VARCHAR(250) NOT NULL,
    sku           VARCHAR(100) NOT NULL UNIQUE,
    barcode       VARCHAR(100),
    category_id   BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    uom_id        BIGINT REFERENCES units_of_measure(id) ON DELETE SET NULL,
    description   TEXT,
    minimum_stock NUMERIC(19, 4) NOT NULL DEFAULT 0,
    maximum_stock NUMERIC(19, 4) NOT NULL DEFAULT 0,
    price         NUMERIC(19, 4) NOT NULL DEFAULT 0,
    properties    JSONB, -- For dynamic product attributes
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP,
    created_by    VARCHAR(100),
    updated_by    VARCHAR(100),
    version       BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_categories_code ON categories(code);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_is_active ON categories(is_active);

CREATE INDEX idx_uoms_code ON units_of_measure(code);
CREATE INDEX idx_uoms_is_active ON units_of_measure(is_active);

CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_uom_id ON products(uom_id);
CREATE INDEX idx_products_is_active ON products(is_active);
