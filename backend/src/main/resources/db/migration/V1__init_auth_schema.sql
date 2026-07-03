-- =============================================
-- V1: Baseline schema - Authentication & Users
-- =============================================

-- Roles table
CREATE TABLE roles (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP,
    created_by  VARCHAR(100),
    updated_by  VARCHAR(100),
    version     BIGINT NOT NULL DEFAULT 0
);

-- Users table
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(150) NOT NULL,
    phone       VARCHAR(20),
    avatar_url  VARCHAR(500),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP,
    created_by  VARCHAR(100),
    updated_by  VARCHAR(100),
    version     BIGINT NOT NULL DEFAULT 0
);

-- User-Role mapping (many-to-many via join table)
CREATE TABLE user_roles (
    id      BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE (user_id, role_id)
);

-- Permissions table
CREATE TABLE permissions (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    resource    VARCHAR(50) NOT NULL,
    action      VARCHAR(50) NOT NULL,
    UNIQUE (resource, action)
);

-- Role-Permission mapping
CREATE TABLE role_permissions (
    id            BIGSERIAL PRIMARY KEY,
    role_id       BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE (role_id, permission_id)
);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(500) NOT NULL UNIQUE,
    expires_at  TIMESTAMP NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- Seed default roles
INSERT INTO roles (name, description) VALUES
    ('ADMIN', 'System administrator with full access'),
    ('MANAGER', 'Warehouse manager with approval rights'),
    ('WAREHOUSE_STAFF', 'Warehouse staff for daily operations'),
    ('VIEWER', 'Read-only access to reports and dashboards');

-- Seed default permissions
INSERT INTO permissions (name, description, resource, action) VALUES
    ('user:read', 'View users', 'user', 'read'),
    ('user:write', 'Create/update users', 'user', 'write'),
    ('user:delete', 'Delete users', 'user', 'delete'),
    ('role:read', 'View roles', 'role', 'read'),
    ('role:write', 'Create/update roles', 'role', 'write'),
    ('supplier:read', 'View suppliers', 'supplier', 'read'),
    ('supplier:write', 'Create/update suppliers', 'supplier', 'write'),
    ('supplier:delete', 'Delete suppliers', 'supplier', 'delete'),
    ('warehouse:read', 'View warehouses', 'warehouse', 'read'),
    ('warehouse:write', 'Create/update warehouses', 'warehouse', 'write'),
    ('product:read', 'View products', 'product', 'read'),
    ('product:write', 'Create/update products', 'product', 'write'),
    ('product:delete', 'Delete products', 'product', 'delete'),
    ('inventory:read', 'View inventory transactions', 'inventory', 'read'),
    ('inventory:write', 'Create inventory transactions', 'inventory', 'write'),
    ('inventory:approve', 'Approve/reject transactions', 'inventory', 'approve'),
    ('stocktake:read', 'View stocktake sessions', 'stocktake', 'read'),
    ('stocktake:write', 'Perform stocktaking', 'stocktake', 'write'),
    ('dashboard:read', 'View dashboard & analytics', 'dashboard', 'read'),
    ('setting:read', 'View system settings', 'setting', 'read'),
    ('setting:write', 'Update system settings', 'setting', 'write'),
    ('audit:read', 'View audit logs', 'audit', 'read');

-- Assign all permissions to ADMIN role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'ADMIN';

-- Seed default admin user (password: Admin@123)
INSERT INTO users (email, password, full_name, created_by) VALUES
    ('admin@scim.local', '$2a$10$N0eqNqhTOIF4bpLqRJi/5eWYMTbXKbR6CcP9KYbHgLKvGXu0XiuHi', 'System Admin', 'system');

-- Assign ADMIN role to default admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'admin@scim.local' AND r.name = 'ADMIN';
