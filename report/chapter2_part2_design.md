# CHƯƠNG 2 (PHẦN 2): THIẾT KẾ HỆ THỐNG

## 2.2.1 Thiết kế Kiến trúc hệ thống (System Architecture)

Hệ thống SCIM được xây dựng theo kiến trúc phân tách rõ rệt giữa Frontend và Backend (Decoupled Client-Server Architecture), giao tiếp thông qua giao thức RESTful APIs không trạng thái (Stateless REST APIs). Sơ đồ kiến trúc tổng thể hoạt động như sau:

```mermaid
graph TD
    %% Clients
    subgraph Client Layer [Tầng Giao Diện]
        Browser[Trình duyệt Web - React SPA]
        ZustandStore[Zustand - State Management]
        ReactQuery[React Query - Server State]
        Browser --> ZustandStore
        Browser --> ReactQuery
    end

    %% Gateway/Proxy if any (Security)
    subgraph Server Layer [Tầng Xử Lý - Spring Boot App]
        SecurityFilter[Spring Security - JWT Auth Filter]
        Controller[REST Controller Layer]
        Service[Business Service Layer]
        MapStruct[MapStruct DTO Mapper]
        Repository[Data Access Repository - JPA]

        SecurityFilter --> Controller
        Controller --> MapStruct
        Controller --> Service
        Service --> Repository
    end

    %% Storage Layer
    subgraph Storage Layer [Tầng Lưu Trữ]
        Redis[(Redis Cache & Locks)]
        Postgres[(PostgreSQL 16 DB)]
    end

    %% Inter-layer relations
    ReactQuery -->|HTTPS / REST Request + JWT| SecurityFilter
    Service -->|Read/Write Cache & Locks| Redis
    Repository -->|JPA/SQL Queries| Postgres

    %% Styling
    classDef client fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1;
    classDef server fill:#f1f8e9,stroke:#558b2f,stroke-width:2px,color:#33691e;
    classDef storage fill:#fff8e1,stroke:#ff8f00,stroke-width:2px,color:#ff6f00;
    
    class Browser,ZustandStore,ReactQuery client;
    class SecurityFilter,Controller,Service,MapStruct,Repository server;
    class Redis,Postgres storage;
```

---

## 2.2.2 Biểu đồ lớp (Class Diagram) cho các thực thể cốt lõi

Dưới đây là sơ đồ lớp thực thể cốt lõi (Domain Class Diagram) thể hiện các lớp dữ liệu và mối quan hệ giữa chúng trong hệ thống SCIM. Tất cả các thực thể chính đều kế thừa từ lớp `BaseEntity` để tự động thừa hưởng các trường kiểm toán (`createdAt`, `updatedAt`, `createdBy`, `updatedBy`) và trường `@Version` phục vụ khóa lạc quan (Optimistic Locking).

```mermaid
classDiagram
    class BaseEntity {
        <<Abstract>>
        -Long id
        -LocalDateTime createdAt
        -LocalDateTime updatedAt
        -String createdBy
        -String updatedBy
        -Long version
    }

    class User {
        -String username
        -String email
        -String password
        -String fullName
        -String avatar
        -boolean isActive
    }

    class Role {
        -String name
        -String description
        -RoleType type
    }

    class Permission {
        -String name
        -String resource
        -String action
        -String description
    }

    class Supplier {
        -String code
        -String name
        -String taxCode
        -String email
        -String phone
        -String address
        -boolean isActive
    }

    class Warehouse {
        -String code
        -String name
        -String address
        -boolean isActive
    }

    class Location {
        -String code
        -String name
        -String zone
        -String aisle
        -String shelf
        -boolean isActive
    }

    class Category {
        -String code
        -String name
        -String description
    }

    class UnitOfMeasure {
        -String code
        -String name
    }

    class Product {
        -String sku
        -String name
        -String description
        -BigDecimal price
        -Integer minStock
        -Integer maxStock
        -MapAttributes attributes
        -boolean isActive
    }

    class ProductBatch {
        -String batchNumber
        -LocalDate manufactureDate
        -LocalDate expirationDate
    }

    class StockLevel {
        -Integer quantity
    }

    class InventoryTransaction {
        -String referenceNumber
        -TransactionType type
        -TransactionStatus status
        -LocalDateTime transactionDate
        -String note
    }

    class TransactionItem {
        -Integer quantity
        -BigDecimal unitPrice
    }

    class StocktakeSession {
        -String code
        -LocalDateTime scheduledDate
        -StocktakeStatus status
    }

    class StocktakeItem {
        -Integer systemQuantity
        -Integer actualQuantity
        -Integer difference
        -String notes
    }

    class StockAdjustment {
        -String code
        -StockAdjustmentStatus status
        -String reason
    }

    class StockAdjustmentItem {
        -Integer quantityAdjusted
        -String note
    }

    %% Inheritance
    BaseEntity <|-- User
    BaseEntity <|-- Role
    BaseEntity <|-- Permission
    BaseEntity <|-- Supplier
    BaseEntity <|-- Warehouse
    BaseEntity <|-- Location
    BaseEntity <|-- Category
    BaseEntity <|-- UnitOfMeasure
    BaseEntity <|-- Product
    BaseEntity <|-- ProductBatch
    BaseEntity <|-- StockLevel
    BaseEntity <|-- InventoryTransaction
    BaseEntity <|-- TransactionItem
    BaseEntity <|-- StocktakeSession
    BaseEntity <|-- StocktakeItem
    BaseEntity <|-- StockAdjustment
    BaseEntity <|-- StockAdjustmentItem

    %% Relationships
    User "n" --> "n" Role : UserRole
    Role "n" --> "n" Permission : RolePermission
    
    Location "n" --> "1" Warehouse : thuộc về
    Product "n" --> "1" Category : thuộc nhóm
    Product "n" --> "1" UnitOfMeasure : đơn vị tính
    
    ProductBatch "n" --> "1" Product : của sản phẩm
    
    StockLevel "n" --> "1" Product : sản phẩm
    StockLevel "n" --> "1" ProductBatch : lô hàng
    StockLevel "n" --> "1" Location : vị trí kệ
    
    InventoryTransaction "n" --> "1" Warehouse : tại kho
    InventoryTransaction "n" --> "1" Supplier : từ nhà cung cấp
    
    TransactionItem "n" --> "1" InventoryTransaction : thuộc phiếu
    TransactionItem "n" --> "1" Product : sản phẩm
    TransactionItem "n" --> "1" ProductBatch : lô hàng
    TransactionItem "n" --> "1" Location : vị trí lưu
    
    StocktakeSession "n" --> "1" Warehouse : kiểm kê tại kho
    StocktakeItem "n" --> "1" StocktakeSession : thuộc phiên
    StocktakeItem "n" --> "1" Product : sản phẩm
    StocktakeItem "n" --> "1" Location : vị trí kệ
    
    StockAdjustment "1" --> "1" StocktakeSession : từ phiên kiểm
    StockAdjustmentItem "n" --> "1" StockAdjustment : thuộc phiếu điều chỉnh
    StockAdjustmentItem "n" --> "1" Product : sản phẩm
    StockAdjustmentItem "n" --> "1" Location : vị trí kệ
```

---

## 2.2.3 Biểu đồ tuần tự (Sequence Diagram) cho các nghiệp vụ chính

### 1. Xác thực & Đăng nhập hệ thống (JWT Auth)

Biểu đồ mô tả quy trình đăng nhập, nhận JWT Access Token và Refresh Token, đồng thời tải danh sách quyền hạn phục vụ RBAC:

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant React as React SPA (Client)
    participant AuthCtrl as AuthController
    participant SecConf as SecurityConfig
    participant JWTProv as JwtProvider
    participant DB as PostgreSQL DB

    User->>React: Nhập username, password & nhấn Đăng nhập
    React->>AuthCtrl: POST /api/auth/login (Request DTO)
    AuthCtrl->>SecConf: Kích hoạt AuthenticationManager
    SecConf->>DB: Truy vấn thông tin người dùng theo username
    DB-->>SecConf: Trả về User (đã mã hóa BCrypt password) và Roles/Permissions
    SecConf->>SecConf: Kiểm tra khớp mật khẩu (BCrypt.matches)
    alt Xác thực thất bại
        SecConf-->>React: Throw BadCredentialsException (401)
        React-->>User: Hiển thị lỗi "Sai tài khoản hoặc mật khẩu"
    else Xác thực thành công
        SecConf->>JWTProv: Yêu cầu sinh Token (Access & Refresh Token)
        JWTProv-->>AuthCtrl: Trả về Access Token (15p) & Refresh Token (7 ngày)
        AuthCtrl->>DB: Lưu RefreshToken mới vào DB
        AuthCtrl-->>React: Trả về ApiResponse (tokens, userInfo, permissions)
        React->>React: Lưu tokens và permissions vào Zustand Store
        React-->>User: Điều hướng tới Dashboard & mở menu theo quyền
    end
```

---

### 2. Nghiệp vụ Nhập kho & Tính giá vốn trung bình gia quyền (WAC)

Biểu đồ mô tả chi tiết quy trình duyệt phiếu nhập kho và tính toán giá vốn WAC tức thời tại Backend:

```mermaid
sequenceDiagram
    autonumber
    actor Manager as Quản lý kho
    participant React as React SPA (Client)
    participant InbCtrl as InboundController
    participant InbServ as InboundServiceImpl
    participant StockLevelRepo as StockLevelRepository
    participant ProdRepo as ProductRepository
    participant DB as PostgreSQL DB

    Manager->>React: Chọn phiếu nhập PENDING & nhấn "Duyệt Phiếu"
    React->>InbCtrl: POST /api/inventory/{id}/approve
    InbCtrl->>InbServ: approveTransaction(id)
    Note over InbServ: Bắt đầu Database Transaction (@Transactional)
    InbServ->>DB: Truy vấn thông tin phiếu nhập & danh sách items
    DB-->>InbServ: Trả về InventoryTransaction & TransactionItems
    
    loop Với mỗi TransactionItem (sản phẩm, số lượng, đơn giá, lô, vị trí)
        InbServ->>StockLevelRepo: Tìm mức tồn kho hiện tại (theo Product, Batch, Location)
        StockLevelRepo-->>InbServ: Trả về StockLevel (hoặc tạo mới nếu chưa tồn tại)
        InbServ->>StockLevelRepo: Cộng dồn số lượng: quantity = quantity + item.quantity
        
        Note over InbServ: Tính toán Giá vốn Trung bình Gia quyền (WAC)
        InbServ->>StockLevelRepo: Lấy tổng số lượng tồn kho cũ trên toàn hệ thống (Q_old)
        InbServ->>ProdRepo: Lấy giá vốn hiện tại của sản phẩm (P_old)
        Note over InbServ: Công thức: P_new = (Q_old * P_old + Q_new * P_new_item) / (Q_old + Q_new)
        InbServ->>ProdRepo: Cập nhật giá vốn mới (P_new) vào Product
        
        InbServ->>DB: Tạo bản ghi biến động kho StockMovement (Type = INBOUND)
    end
    
    InbServ->>DB: Cập nhật trạng thái phiếu nhập = COMPLETED
    Note over InbServ: Kết thúc Transaction (Commit DB)
    InbServ-->>InbCtrl: Trả về kết quả thành công
    InbCtrl-->>React: Trả về ApiResponse (success = true)
    React-->>Manager: Hiển thị toast thông báo duyệt thành công & cập nhật UI
```

---

### 3. Nghiệp vụ Xuất kho FEFO Picking & Khóa đồng thời (Redis Lock)

Biểu đồ mô tả quy trình đề xuất vị trí xuất kho theo hạn sử dụng và cơ chế khóa phân tán tránh lỗi xuất âm:

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Nhân viên kho
    participant React as React SPA (Client)
    participant OutCtrl as OutboundController
    participant OutServ as OutboundServiceImpl
    participant Redis as Redis Server
    participant StockLevelRepo as StockLevelRepository
    participant DB as PostgreSQL DB

    Staff->>React: Chọn sản phẩm, số lượng cần xuất & nhấn "Xuất kho"
    React->>OutCtrl: POST /api/inventory/outbound (Request DTO)
    OutCtrl->>OutServ: processOutbound(request)
    
    OutServ->>Redis: Acquire lock on Product ID (SETNX key "lock:product:id" EX 10)
    alt Không lấy được khóa (Có luồng khác đang xử lý)
        Redis-->>OutServ: Lock failed
        OutServ-->>OutCtrl: Throw BusinessException ("Sản phẩm đang được xử lý bởi giao dịch khác")
        OutCtrl-->>React: Trả về ApiResponse (400 Bad Request)
        React-->>Staff: Hiển thị cảnh báo lỗi đồng thời
    else Lấy được khóa thành công
        Redis-->>OutServ: Lock acquired
        Note over OutServ: Bắt đầu Transaction
        
        OutServ->>StockLevelRepo: Tìm tồn kho chi tiết, sắp xếp tăng dần theo ExpirationDate (FEFO)
        StockLevelRepo-->>OutServ: Trả về danh sách StockLevels (Lô, vị trí, số lượng)
        
        Note over OutServ: Giải thuật Picking FEFO
        alt Tổng tồn kho khả dụng < Số lượng yêu cầu xuất
            OutServ->>Redis: Release lock
            OutServ-->>OutCtrl: Throw InsufficientStockException ("Tồn kho không đủ")
            OutCtrl-->>React: Trả về ApiResponse (422 Unprocessible Entity)
            React-->>Staff: Báo lỗi không đủ hàng tồn
        else Tồn kho đủ đáp ứng
            loop Cho đến khi đủ số lượng xuất
                Note over OutServ: Trừ dần số lượng xuất vào từng lô hàng sắp hết hạn trước
                OutServ->>StockLevelRepo: Cập nhật StockLevel (Trừ tồn kho)
                OutServ->>DB: Tạo bản ghi biến động StockMovement (Type = OUTBOUND)
            end
            OutServ->>DB: Lưu phiếu xuất trạng thái COMPLETED
            Note over OutServ: Kết thúc Transaction (Commit DB)
            OutServ->>Redis: Release lock (DEL "lock:product:id")
            OutServ-->>OutCtrl: Trả về kết quả thành công
            OutCtrl-->>React: Trả về ApiResponse (success = true)
            React-->>Staff: Hiển thị bảng chỉ dẫn Picking List & In Phiếu
        end
    end
```

---

### 4. Nghiệp vụ Kiểm kê & Tự động điều chỉnh kho

Biểu đồ mô tả quy trình thực hiện đếm kiểm, đối chiếu số liệu và hiệu chỉnh tồn kho vật lý:

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Nhân viên kho
    actor Manager as Quản lý kho
    participant React as React SPA (Client)
    participant StocktakeServ as StocktakeServiceImpl
    participant StockLevelRepo as StockLevelRepository
    participant DB as PostgreSQL DB

    Staff->>React: Quét mã QR vị trí, quét QR lô hàng & nhập số thực đếm
    React->>StocktakeServ: POST /api/stocktake/sessions/{id}/count
    StocktakeServ->>StockLevelRepo: Truy vấn số dư sổ sách hiện tại (systemQuantity)
    StockLevelRepo-->>StocktakeServ: Trả về systemQuantity
    Note over StocktakeServ: Tính chênh lệch: difference = actualQuantity - systemQuantity
    StocktakeServ->>DB: Lưu thông tin vào StocktakeItem
    StocktakeServ-->>React: Trả về kết quả đếm & chênh lệch thực tế
    
    Note over StocktakeServ: Sau khi kết thúc đếm toàn bộ kho
    Manager->>React: Xem danh sách chênh lệch & nhấn "Duyệt điều chỉnh"
    React->>StocktakeServ: POST /api/stocktake/sessions/{id}/adjust
    Note over StocktakeServ: Bắt đầu Transaction
    StocktakeServ->>DB: Lấy tất cả StocktakeItems có chênh lệch khác 0
    DB-->>StocktakeServ: Trả về danh sách chênh lệch
    
    loop Với mỗi bản ghi chênh lệch
        StocktakeServ->>StockLevelRepo: Cập nhật số lượng tại StockLevel: quantity = quantity + difference
        StocktakeServ->>DB: Ghi nhận StockMovement (Type = ADJUSTMENT)
    end
    
    StocktakeServ->>DB: Lưu phiếu StockAdjustment (Status = APPROVED)
    StocktakeServ->>DB: Cập nhật trạng thái phiên kiểm kê = COMPLETED
    Note over StocktakeServ: Kết thúc Transaction (Commit DB)
    StocktakeServ-->>React: Trả về thành công
    React-->>Manager: Thông báo kho đã được cân bằng dữ liệu
```

---

## 2.2.4 Thiết kế Cơ sở dữ liệu (ERD)

Dưới đây là Sơ đồ quan hệ thực thể (ERD) ở mức vật lý, mô tả chi tiết cấu trúc các bảng và mối liên kết khóa ngoại.

```mermaid
erDiagram
    users {
        bigint id PK
        varchar username UK
        varchar email UK
        varchar password
        varchar full_name
        varchar avatar
        boolean is_active
        timestamp created_at
        timestamp updated_at
        bigint version
    }
    roles {
        bigint id PK
        varchar name UK
        varchar description
        varchar type
    }
    permissions {
        bigint id PK
        varchar name UK
        varchar resource
        varchar action
        varchar description
    }
    user_roles {
        bigint user_id PK,FK
        bigint role_id PK,FK
    }
    role_permissions {
        bigint role_id PK,FK
        bigint permission_id PK,FK
    }
    suppliers {
        bigint id PK
        varchar code UK
        varchar name
        varchar tax_code
        varchar email
        varchar phone
        text address
        boolean is_active
        timestamp created_at
        timestamp updated_at
        bigint version
    }
    warehouses {
        bigint id PK
        varchar code UK
        varchar name
        text address
        boolean is_active
        timestamp created_at
        timestamp updated_at
        bigint version
    }
    locations {
        bigint id PK
        bigint warehouse_id FK
        varchar code UK
        varchar name
        varchar zone
        varchar aisle
        varchar shelf
        boolean is_active
        timestamp created_at
        timestamp updated_at
        bigint version
    }
    categories {
        bigint id PK
        varchar code UK
        varchar name
        varchar description
    }
    units_of_measure {
        bigint id PK
        varchar code UK
        varchar name
    }
    products {
        bigint id PK
        bigint category_id FK
        bigint uom_id FK
        varchar sku UK
        varchar name
        text description
        numeric price
        integer min_stock
        integer max_stock
        jsonb attributes
        boolean is_active
        timestamp created_at
        timestamp updated_at
        bigint version
    }
    product_batches {
        bigint id PK
        bigint product_id FK
        varchar batch_number UK
        date manufacture_date
        date expiration_date
        timestamp created_at
        timestamp updated_at
        bigint version
    }
    stock_levels {
        bigint id PK
        bigint product_id FK
        bigint batch_id FK
        bigint location_id FK
        integer quantity
        timestamp created_at
        timestamp updated_at
        bigint version
    }
    inventory_transactions {
        bigint id PK
        bigint warehouse_id FK
        bigint supplier_id FK
        varchar reference_number UK
        varchar type
        varchar status
        timestamp transaction_date
        text note
        timestamp created_at
        timestamp updated_at
        bigint version
    }
    transaction_items {
        bigint id PK
        bigint transaction_id FK
        bigint product_id FK
        bigint batch_id FK
        bigint location_id FK
        integer quantity
        numeric unit_price
    }
    stock_movements {
        bigint id PK
        bigint product_id FK
        bigint batch_id FK
        bigint location_id FK
        varchar reference_number
        varchar type
        integer quantity
        timestamp movement_date
    }
    stocktake_sessions {
        bigint id PK
        bigint warehouse_id FK
        varchar code UK
        timestamp scheduled_date
        varchar status
        timestamp created_at
        timestamp updated_at
        bigint version
    }
    stocktake_items {
        bigint id PK
        bigint session_id FK
        bigint product_id FK
        bigint location_id FK
        integer system_quantity
        integer actual_quantity
        integer difference
        text notes
    }

    users ||--o{ user_roles : "has"
    roles ||--o{ user_roles : "assigned to"
    roles ||--o{ role_permissions : "contains"
    permissions ||--o{ role_permissions : "defines"
    
    warehouses ||--o{ locations : "contains"
    categories ||--o{ products : "classified by"
    units_of_measure ||--o{ products : "measured by"
    products ||--o{ product_batches : "produced in"
    
    products ||--o{ stock_levels : "holds"
    product_batches ||--o{ stock_levels : "identified by"
    locations ||--o{ stock_levels : "stores at"
    
    warehouses ||--o{ inventory_transactions : "processed at"
    suppliers ||--o{ inventory_transactions : "supplies for"
    inventory_transactions ||--o{ transaction_items : "contains"
    products ||--o{ transaction_items : "items of"
    product_batches ||--o{ transaction_items : "batch of"
    locations ||--o{ transaction_items : "picked from/put to"
    
    products ||--o{ stock_movements : "tracks"
    product_batches ||--o{ stock_movements : "tracks batch"
    locations ||--o{ stock_movements : "tracks location"
    
    warehouses ||--o{ stocktake_sessions : "checked at"
    stocktake_sessions ||--o{ stocktake_items : "has items"
    products ||--o{ stocktake_items : "evaluated"
    locations ||--o{ stocktake_items : "scanned at"
```

---

## 2.2.5 Từ điển dữ liệu (Data Dictionary) cho các bảng chính

### 1. Bảng `products` (Danh mục sản phẩm)
Lưu thông tin định nghĩa sản phẩm SKU, giá bán, định mức an toàn và các thuộc tính động.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | bigint | PRIMARY KEY | Khóa chính tự tăng |
| `category_id` | bigint | FOREIGN KEY | Liên kết với bảng `categories` |
| `uom_id` | bigint | FOREIGN KEY | Đơn vị tính, liên kết bảng `units_of_measure` |
| `sku` | varchar(50) | UNIQUE, NOT NULL | Mã định danh sản phẩm duy nhất (Stock Keeping Unit) |
| `name` | varchar(255) | NOT NULL | Tên sản phẩm |
| `description` | text | NULL | Mô tả chi tiết sản phẩm |
| `price` | numeric(15,2)| DEFAULT 0.00 | Giá vốn trung bình gia quyền (WAC) hiện tại |
| `min_stock` | integer | DEFAULT 0 | Định mức tồn kho tối thiểu (cảnh báo tồn thấp) |
| `max_stock` | integer | DEFAULT 1000 | Định mức tồn kho tối đa |
| `attributes` | jsonb | NULL | Lưu trữ thuộc tính động (Màu sắc, kích thước, xuất xứ...) |
| `is_active` | boolean | DEFAULT TRUE | Trạng thái sử dụng (hoạt động/ngừng) |
| `version` | bigint | NOT NULL | Số phiên bản phục vụ khóa lạc quan (Optimistic Lock) |

### 2. Bảng `stock_levels` (Tồn kho chi tiết)
Bảng cốt lõi ghi nhận số lượng tồn thực tế của từng sản phẩm, theo từng lô hàng cụ thể và đặt tại vị trí ngăn kệ chính xác.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | bigint | PRIMARY KEY | Khóa chính tự tăng |
| `product_id` | bigint | FK, NOT NULL | Sản phẩm nào, liên kết `products` (Index) |
| `batch_id` | bigint | FK, NOT NULL | Thuộc lô sản xuất nào, liên kết `product_batches` (Index) |
| `location_id` | bigint | FK, NOT NULL | Lưu trữ tại vị trí nào, liên kết `locations` (Index) |
| `quantity` | integer | NOT NULL | Số lượng tồn kho thực tế hiện tại |
| `version` | bigint | NOT NULL | Số phiên bản phục vụ khóa lạc quan (Optimistic Lock) |

### 3. Bảng `inventory_transactions` (Phiếu nhập xuất kho)
Lưu thông tin phần đầu (Header) của các giao dịch nhập kho, xuất kho hoặc điều chuyển.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | bigint | PRIMARY KEY | Khóa chính tự tăng |
| `reference_number`| varchar(50) | UNIQUE, NOT NULL | Số chứng từ tự sinh (VD: GRN-20260712-001, GIN-...) |
| `type` | varchar(20) | NOT NULL | Loại giao dịch: `INBOUND` (Nhập), `OUTBOUND` (Xuất) |
| `status` | varchar(20) | NOT NULL | Trạng thái: `DRAFT`, `PENDING`, `APPROVED`, `COMPLETED` |
| `warehouse_id` | bigint | FK, NOT NULL | Kho hàng xử lý, liên kết `warehouses` |
| `supplier_id` | bigint | FK, NULL | Nhà cung cấp cung cấp (chỉ dùng cho Inbound) |
| `transaction_date`| timestamp | NOT NULL | Ngày thực hiện giao dịch |
| `note` | text | NULL | Ghi chú từ người lập phiếu |
| `version` | bigint | NOT NULL | Số phiên bản phục vụ khóa lạc quan (Optimistic Lock) |
