-- =============================================
-- V2: Dynamic RBAC Schema Changes
-- =============================================

-- Drop dependent tables first to restructure
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;

-- Recreate permissions with new columns for dynamic scanning
CREATE TABLE permissions (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL UNIQUE, -- E.g. "GET:/api/users"
    path          VARCHAR(255) NOT NULL,
    method        VARCHAR(20) NOT NULL,
    api_group     VARCHAR(100) NOT NULL,        -- Controller name or Swagger Tag
    description   VARCHAR(255),                 -- API description
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Recreate role_permissions mapping
CREATE TABLE role_permissions (
    id            BIGSERIAL PRIMARY KEY,
    role_id       BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE (role_id, permission_id)
);

-- Add type column to roles table
ALTER TABLE roles ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'CUSTOM';

-- Set ADMIN role to type ALL
UPDATE roles SET type = 'ALL' WHERE name = 'ADMIN';

-- Create index for performance
CREATE INDEX idx_permissions_path_method ON permissions(path, method);
CREATE INDEX idx_permissions_api_group ON permissions(api_group);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
