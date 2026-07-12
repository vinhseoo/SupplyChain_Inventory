-- =============================================
-- V11: Create tables for Notification, Audit Log, Activity Log, and System Settings
-- =============================================

-- 1. Create Notifications Table
CREATE TABLE notifications (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT REFERENCES users(id) ON DELETE CASCADE,
    title        VARCHAR(255) NOT NULL,
    content      TEXT NOT NULL,
    type         VARCHAR(50) NOT NULL, -- INFO, WARNING, SUCCESS, ERROR
    is_read      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by   VARCHAR(100)
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- 2. Create Audit Logs Table (Data Diff tracking)
CREATE TABLE audit_logs (
    id           BIGSERIAL PRIMARY KEY,
    entity_name  VARCHAR(100) NOT NULL,
    entity_id    BIGINT,
    action       VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE
    old_value    JSONB,
    new_value    JSONB,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by   VARCHAR(100)
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_name, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- 3. Create Activity Logs Table (User action logging)
CREATE TABLE activity_logs (
    id           BIGSERIAL PRIMARY KEY,
    description  VARCHAR(500) NOT NULL,
    ip_address   VARCHAR(50),
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by   VARCHAR(100)
);

CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- 4. Create System Settings Table
CREATE TABLE system_settings (
    id           BIGSERIAL PRIMARY KEY,
    setting_key  VARCHAR(100) NOT NULL UNIQUE,
    setting_val  VARCHAR(500) NOT NULL,
    description  VARCHAR(255),
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP,
    updated_by   VARCHAR(100)
);

CREATE INDEX idx_system_settings_key ON system_settings(setting_key);

-- 5. Insert Default Settings
INSERT INTO system_settings (setting_key, setting_val, description, created_at)
VALUES
('OUTBOUND_STRATEGY', 'FEFO', 'Chien luoc xuat hang mac dinh (FIFO hoac FEFO)', NOW()),
('CURRENCY', 'VND', 'Don vi tien te mac dinh dung trong he thong', NOW()),
('DATE_FORMAT', 'yyyy-MM-dd HH:mm:ss', 'Dinh dang ngay gio hien thi tren giao dien', NOW()),
('LOW_STOCK_THRESHOLD', '10', 'Nguong so luong ton kho toi thieu de phat canh bao', NOW()),
('ALERT_EXPIRY_DAYS', '30', 'So ngay truoc khi lo hang het han de bat dau phat canh bao', NOW())
ON CONFLICT (setting_key) DO NOTHING;
