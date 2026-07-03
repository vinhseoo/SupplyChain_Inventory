# SCIM Project — Coding Rules & AI Agent Guidelines

> Supply Chain & Inventory Management System
> Tech Stack: Java 21 + Spring Boot 3.5 | React 18 + Vite + TypeScript | PostgreSQL 16 | Redis 7

---

## 1. Architecture Rules

### 1.1 Backend — Layered Architecture
```
Controller → Service → Repository
```
- **Controller**: Chỉ nhận request, validate input, gọi Service, trả response. KHÔNG chứa business logic.
- **Service**: Chứa business logic. Gọi Repository để truy vấn DB. Service gọi Service khác nếu cần.
- **Repository**: Chỉ chứa data access logic. Extends `JpaRepository`.
- **KHÔNG skip layer**: Controller KHÔNG gọi trực tiếp Repository.
- **Entity KHÔNG được return trực tiếp**: Luôn chuyển qua DTO (dùng MapStruct mapper).

### 1.2 Frontend — Feature-based Architecture
```
features/<feature-name>/
├── components/     # Components riêng cho feature
├── hooks/          # Custom hooks riêng cho feature
├── pages/          # Route pages
├── types.ts        # Types riêng cho feature
└── index.ts        # Public exports
```
- **Shared components** đặt trong `src/components/`.
- **API calls** chỉ qua `src/services/` layer.
- **State management**: Zustand cho global state, React Query cho server state.

---

## 2. Code Style & Naming Convention

### 2.1 Backend (Java)
| Element | Convention | Example |
|---|---|---|
| Package | lowercase | `com.scim.controller` |
| Class | PascalCase | `SupplierService` |
| Method | camelCase | `findByEmail()` |
| Constant | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE` |
| Entity class | PascalCase, singular | `Product`, `Warehouse` |
| DB table name | snake_case, plural | `products`, `warehouses` |
| DB column name | snake_case | `created_at`, `full_name` |
| DTO request | `XxxRequest` | `SupplierRequest` |
| DTO response | `XxxResponse` | `SupplierResponse` |
| Service interface | `XxxService` | `SupplierService` |
| Service impl | `XxxServiceImpl` | `SupplierServiceImpl` |
| Repository | `XxxRepository` | `SupplierRepository` |
| Controller | `XxxController` | `SupplierController` |
| Mapper | `XxxMapper` | `SupplierMapper` |
| Migration | `V{n}__{description}` | `V2__add_suppliers_table.sql` |

**Quy tắc thêm:**
- Method body tối đa **30 dòng**. Nếu dài hơn, tách thành private methods.
- Class tối đa **300 dòng**. Nếu dài hơn, refactor.
- Sử dụng **Lombok** cho boilerplate: `@Data`, `@Builder`, `@Getter/@Setter`, `@Slf4j`.
- Sử dụng **Java 21 features**: records cho immutable DTOs khi phù hợp, pattern matching, text blocks.
- Mỗi Controller method PHẢI có `@Operation` annotation (Swagger docs).

### 2.2 Frontend (TypeScript)
| Element | Convention | Example |
|---|---|---|
| Component file | PascalCase.tsx | `SupplierList.tsx` |
| Hook file | camelCase.ts | `useSuppliers.ts` |
| Utility file | camelCase.ts | `dateUtils.ts` |
| Service file | camelCase.ts | `supplierService.ts` |
| Type/Interface | PascalCase | `SupplierResponse` |
| Enum | PascalCase | `TransactionStatus` |
| Component | PascalCase | `<SupplierList />` |
| Hook | `use` prefix | `useSuppliers()` |
| Event handler | `handle` prefix | `handleSubmit()` |
| Boolean prop/var | `is`/`has`/`should` prefix | `isLoading`, `hasError` |
| Constant | UPPER_SNAKE_CASE | `API_BASE_URL` |

**Quy tắc thêm:**
- **TypeScript strict mode** — KHÔNG dùng `any`. Nếu cần type linh hoạt, dùng `unknown` + type guard.
- **Functional components only** — KHÔNG dùng class components.
- Mỗi component file chỉ export **1 component chính**.
- Sử dụng **named exports** (không dùng default export).

---

## 3. Database & ORM Rules

### 3.1 Flyway Migrations
- **BẮT BUỘC** dùng Flyway cho mọi thay đổi schema. KHÔNG dùng `ddl-auto: create/update`.
- Naming: `V{version}__{description}.sql` (2 underscore).
- Migration files **KHÔNG ĐƯỢC sửa** sau khi đã chạy. Tạo migration mới để thay đổi.
- Mỗi migration file nên **tự chứa** (có thể chạy độc lập).

### 3.2 Entity Rules
- Tất cả entity PHẢI extends `BaseEntity` (trừ join tables đơn giản).
- PHẢI có `@Version` cho optimistic locking (đã có trong BaseEntity).
- KHÔNG dùng `@ManyToMany` trực tiếp. Tạo **join entity** riêng (ví dụ: `UserRole`, `RolePermission`).
- Dùng `@Column(name = "...")` cho tất cả columns để đảm bảo naming chính xác.
- Dùng `FetchType.LAZY` cho tất cả associations. KHÔNG dùng `EAGER`.
- Soft delete: dùng `is_active` flag thay vì xóa record.

### 3.3 Repository Rules
- Extends `JpaRepository<Entity, Long>`.
- Custom queries: ưu tiên `@Query` với JPQL. Dùng native query chỉ khi JPQL không đủ.
- Pagination: dùng `Pageable` parameter, trả về `Page<Entity>`.
- KHÔNG viết logic trong Repository — chỉ data access.

### 3.4 Query Performance
- **N+1 Problem**: Dùng `@EntityGraph` hoặc `JOIN FETCH` cho associations.
- **Pagination BẮT BUỘC** cho tất cả list APIs. Default: page=0, size=20, max=100.
- Tạo **database indexes** cho các columns thường query (foreign keys, search fields, status).
- Dùng `@QueryHints` cho read-only queries khi cần.

---

## 4. Error Handling & Logging

### 4.1 Error Handling
- Sử dụng `GlobalExceptionHandler` (`@RestControllerAdvice`) để xử lý tất cả exceptions.
- KHÔNG catch exception rồi return null/empty. Throw custom exception phù hợp.
- Custom exception hierarchy:
  - `ResourceNotFoundException` — 404
  - `DuplicateResourceException` — 409
  - `BusinessException` — 400
  - `InsufficientStockException` — 422
  - `UnauthorizedException` — 401
- Response format chuẩn cho mọi API:
```json
{
  "success": true/false,
  "message": "...",
  "data": { ... },
  "errors": [{"field": "...", "message": "..."}],
  "timestamp": "2026-01-01T00:00:00"
}
```

### 4.2 Logging (Backend)
- Sử dụng **SLF4J** qua Lombok `@Slf4j`.
- Log levels:
  - `ERROR`: Exceptions, system failures (things that need immediate attention)
  - `WARN`: Business rule violations, recoverable errors
  - `INFO`: Important operations (create, update, delete, status changes)
  - `DEBUG`: Development/troubleshooting info
- **KHÔNG log sensitive data**: passwords, tokens, personal info.
- Log format: `[Action] [Entity] [Details]` — Ví dụ: `log.info("Created supplier: {}", supplier.getCode());`

### 4.3 Error Handling (Frontend)
- **Axios interceptor** cho global error handling (401 → redirect login, 500 → toast error).
- **React Error Boundary** cho component render errors.
- **React Query** `onError` callbacks cho API-specific error handling.
- User-facing errors: dùng `message.error()` (Ant Design) cho notifications.

---

## 5. API Design Rules

### 5.1 REST Conventions
| Operation | HTTP Method | Path | Response Code |
|---|---|---|---|
| List (paginated) | GET | `/api/suppliers?page=0&size=20` | 200 |
| Get by ID | GET | `/api/suppliers/{id}` | 200 |
| Create | POST | `/api/suppliers` | 201 |
| Update | PUT | `/api/suppliers/{id}` | 200 |
| Partial update | PATCH | `/api/suppliers/{id}` | 200 |
| Delete | DELETE | `/api/suppliers/{id}` | 200 |
| Action | POST | `/api/inventory/{id}/approve` | 200 |

### 5.2 Request Validation
- Dùng `@Valid` + Jakarta Validation annotations trên Request DTOs.
- Annotations phổ biến: `@NotBlank`, `@NotNull`, `@Size`, `@Email`, `@Min`, `@Max`, `@Pattern`.
- Custom validation: tạo custom annotation + ConstraintValidator.

### 5.3 Pagination & Sorting
- Default parameters: `page=0`, `size=20`.
- Max page size: `100`.
- Sort format: `sort=createdAt,desc`.
- Response wrapper: `PageResponse<T>`.

---

## 6. AI Agent Behavior Rules

### 6.1 Khi tạo API endpoint mới:
1. Tạo/cập nhật Flyway migration nếu cần thay đổi schema.
2. Tạo/cập nhật Entity.
3. Tạo Request DTO (with validation annotations) và Response DTO.
4. Tạo/cập nhật MapStruct Mapper.
5. Tạo/cập nhật Repository (with custom queries if needed).
6. Tạo/cập nhật Service interface + ServiceImpl.
7. Tạo/cập nhật Controller (with Swagger annotations).
8. LUÔN wrap response trong `ApiResponse<T>`.

### 6.2 Khi tạo trang Frontend mới:
1. Tạo feature folder trong `src/features/<feature>/`.
2. Tạo API service function trong `src/services/`.
3. Tạo React Query hook trong feature folder hoặc `src/hooks/`.
4. Tạo page component.
5. Thêm route vào router config.
6. Thêm menu item vào Sidebar.

### 6.3 General Rules:
- LUÔN kiểm tra file hiện tại trước khi tạo mới — tránh duplicate.
- LUÔN giữ nguyên comments/docstrings không liên quan khi sửa file.
- KHÔNG tạo placeholder/TODO code. Code phải hoàn chỉnh và chạy được.
- KHÔNG hardcode values. Dùng constants, config, hoặc environment variables.
- LUÔN tạo indexes cho foreign keys và frequently-queried columns trong migration.

---

## 7. Performance Rules

### 7.1 Backend
- Redis cache cho master data (suppliers, products, categories) với TTL hợp lý.
- Sử dụng `@Cacheable`, `@CacheEvict` annotations.
- Database connection pool: HikariCP (default Spring Boot).
- Batch operations cho bulk insert/update.
- Lazy loading cho JPA associations.

### 7.2 Frontend
- `React.lazy()` + `Suspense` cho code splitting theo route.
- `React.memo()` cho components nhận props phức tạp.
- `useMemo`/`useCallback` khi truyền functions/objects xuống child components.
- React Query `staleTime` hợp lý: master data = 5 phút, transactions = 30 giây.
- Image optimization: lazy loading, proper sizing.
- Virtual scrolling cho tables > 1000 rows.

---

## 8. Security Rules

### 8.1 Backend
- JWT access token: 15 phút, refresh token: 7 ngày.
- Password: BCrypt encoding, min 8 characters.
- Method-level security: `@PreAuthorize("hasAuthority('resource:action')")`.
- CORS: chỉ whitelist specific origins.
- Input validation trên TẤT CẢ request DTOs.
- KHÔNG log passwords, tokens, hoặc sensitive data.

### 8.2 Frontend
- Store JWT trong memory (Zustand store), KHÔNG localStorage.
- Refresh token trong httpOnly cookie (nếu possible) hoặc localStorage.
- Auto logout khi token expired và refresh thất bại.
- Permission-based UI: ẩn/disable buttons và menu items theo user permissions.
