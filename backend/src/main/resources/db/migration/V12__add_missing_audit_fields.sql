-- =============================================
-- V12: Add missing BaseEntity audit fields to Notifications, Audit Logs, Activity Logs, and System Settings
-- =============================================

-- Add columns to notifications
ALTER TABLE notifications 
    ADD COLUMN updated_at TIMESTAMP,
    ADD COLUMN updated_by VARCHAR(100),
    ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

-- Add columns to audit_logs
ALTER TABLE audit_logs 
    ADD COLUMN updated_at TIMESTAMP,
    ADD COLUMN updated_by VARCHAR(100),
    ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

-- Add columns to activity_logs
ALTER TABLE activity_logs 
    ADD COLUMN updated_at TIMESTAMP,
    ADD COLUMN updated_by VARCHAR(100),
    ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

-- Add column to system_settings
ALTER TABLE system_settings 
    ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
