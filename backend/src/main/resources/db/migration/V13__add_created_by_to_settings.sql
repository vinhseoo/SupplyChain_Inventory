-- =============================================
-- V13: Add missing created_by column to system_settings table
-- =============================================

ALTER TABLE system_settings 
    ADD COLUMN created_by VARCHAR(100);
