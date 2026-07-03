---
name: backend-migration
description: Skill để tạo Flyway database migration trong project SCIM. Bao gồm naming convention, best practices, và patterns cho các loại migration khác nhau.
---

# Backend Migration — Flyway Database Migration

## Naming Convention
```
V{version}__{description}.sql
```
- `version`: Số nguyên tăng dần (V1, V2, V3...)
- `description`: snake_case mô tả nội dung (ví dụ: `add_suppliers_table`)
- **2 underscore** giữa version và description

## Trước khi tạo migration
1. Kiểm tra các migration files hiện tại trong `src/main/resources/db/migration/`
2. Xác định version number tiếp theo
3. KHÔNG sửa migration đã chạy — tạo migration mới

## Template: Tạo bảng mới

```sql
-- =============================================
-- V{n}: Description
-- =============================================

CREATE TABLE table_name (
    -- Primary key
    id          BIGSERIAL PRIMARY KEY,

    -- Business fields
    code        VARCHAR(50) NOT NULL UNIQUE,
    name        VARCHAR(200) NOT NULL,

    -- Foreign keys
    parent_id   BIGINT REFERENCES parent_table(id),

    -- Status
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,

    -- Audit fields (bắt buộc)
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP,
    created_by  VARCHAR(100),
    updated_by  VARCHAR(100),
    version     BIGINT NOT NULL DEFAULT 0
);

-- Indexes (bắt buộc cho FK và search columns)
CREATE INDEX idx_table_name_parent_id ON table_name(parent_id);
CREATE INDEX idx_table_name_code ON table_name(code);
CREATE INDEX idx_table_name_is_active ON table_name(is_active);
```

## Template: Thêm column

```sql
ALTER TABLE table_name ADD COLUMN column_name VARCHAR(100);
```

## Template: Seed data

```sql
INSERT INTO table_name (code, name, created_by) VALUES
    ('CODE_1', 'Name 1', 'system'),
    ('CODE_2', 'Name 2', 'system');
```

## Rules
- Luôn có audit fields: `created_at`, `updated_at`, `created_by`, `updated_by`, `version`
- Tạo INDEX cho tất cả foreign keys
- Tạo INDEX cho columns dùng trong WHERE, ORDER BY thường xuyên
- Dùng `BIGSERIAL` cho primary keys
- Dùng `BOOLEAN DEFAULT TRUE` cho `is_active` (soft delete)
- Dùng `TIMESTAMP` (không dùng `DATE`) cho datetime fields
- JSONB columns cho dynamic attributes
- Constraint names nên descriptive: `fk_table_column`, `uk_table_column`
