# SCIM Project — Project Progress & Tracking Plan

Tài liệu này dùng để theo dõi tiến độ phát triển toàn bộ hệ thống Supply Chain & Inventory Management (SCIM). Mỗi khi hoàn thành chức năng nào hoặc có thay đổi/sửa lỗi (fix), thông tin sẽ được cập nhật trực tiếp tại đây.

---

## 📊 Tổng quan tiến độ

- **Trạng thái hiện tại:** Đã khởi tạo hạ tầng và khung dự án (Phase 0)
- **Tiến độ tổng thể:** `[██░░░░░░░░░░░░░░░░░░]` ~10% Hoàn thành
- **Giai đoạn hiện tại:** Chuẩn bị bước vào **Phase 1: Đăng nhập & Quản trị người dùng**

---

## 📝 Nhật ký thay đổi & Sửa lỗi (Fix Logs)

| Ngày | Người thực hiện | Nội dung thay đổi / Sửa lỗi | Chi tiết / File liên quan |
| :--- | :--- | :--- | :--- |
| 03/07/2026 | Antigravity | Khởi tạo dự án & Cấu trúc | Cấu hình Docker Compose, Maven (pom.xml), React + Ant Design, TailwindCSS v4, Global Exceptions & Base Entities. |
| 03/07/2026 | Antigravity | Đổi build tool backend từ Gradle sang Maven | Xóa bỏ file Gradle, tạo [pom.xml](file:///c:/Users/maiduc.vinh/OneDrive%20-%20VietCredit/Desktop/SupplyChain_Inventory/backend/pom.xml), sửa [.gitignore](file:///c:/Users/maiduc.vinh/OneDrive%20-%20VietCredit/Desktop/SupplyChain_Inventory/backend/.gitignore). |
| 03/07/2026 | Antigravity | Sửa lỗi import CSS & config alias | Sửa thứ tự `@import` trong [global.css](file:///c:/Users/maiduc.vinh/OneDrive%20-%20VietCredit/Desktop/SupplyChain_Inventory/frontend/src/styles/global.css), cấu hình `@/` trong `vite.config.ts` và `tsconfig.app.json`. |

---

## 🗺️ Chi tiết các giai đoạn phát triển (Phases)

### Phase 0: Foundation — Hạ tầng & Khung dự án
- [x] **Backend Skeleton** — Khởi tạo Spring Boot 3.5.3 (Java 21, Maven)
- [x] **Hạ tầng Docker** — Setup PostgreSQL 16 + Redis 7 + pgAdmin 4
- [x] **Database Baseline** — Tạo Flyway migration V1 seed dữ liệu quyền & Admin mặc định
- [x] **Base Layer** — Thiết lập `BaseEntity`, `ApiResponse`, `PageResponse`
- [x] **Xử lý lỗi & Log** — Cài đặt `GlobalExceptionHandler` + Custom exceptions + Logback configs
- [x] **Frontend Skeleton** — Khởi tạo React + Vite + TypeScript + Tailwind CSS v4
- [x] **Design System** — Cấu hình Design Tokens Ant Design 5.x, Router và AppLayout (Sidebar + Header)
- [x] **API Client** — Thiết lập Axios client tự động đính kèm JWT và bắt lỗi tập trung
- [x] **AI Guidelines** — Viết `AGENTS.md` và 11 Skills lập trình

---

### Phase 1: Authentication & User Management
- **Đăng nhập & Xác thực**
  - [ ] Migration: Bảng `refresh_tokens` và cấu hình token
  - [ ] JWT Provider: Tạo access token (15p) + refresh token (7 ngày)
  - [ ] API Đăng nhập / Refresh token / Đăng xuất
  - [ ] Giao diện Trang Login (Ant Design Form)
  - [ ] Zustand Auth store quản lý session & token
- **Quản lý người dùng**
  - [ ] APIs: CRUD Users (Search, Pagination, Soft delete)
  - [ ] Giao diện: Quản lý người dùng (DataTable + FormModal)
  - [ ] API & Giao diện: Reset mật khẩu (Admin)
- **Phân quyền người dùng (RBAC)**
  - [ ] Seed data: Roles (Admin, Manager, Staff, Viewer) & Permissions tương ứng
  - [ ] API & Giao diện: Quản lý Roles & checkbox gán Permission
  - [ ] Tích hợp `@PreAuthorize` backend & Phân quyền ẩn hiện UI frontend
- **Trang cá nhân**
  - [ ] API & Giao diện: Xem/Sửa Profile cá nhân & Thay đổi mật khẩu
  - [ ] Tích hợp API Upload avatar cá nhân

---

### Phase 2: Master Data — Danh mục cơ bản
- **Quản lý Nhà cung cấp (Suppliers)**
  - [ ] Migration & Entity: Bảng `suppliers` (mã, tên, liên hệ, MST, trạng thái...)
  - [ ] APIs: CRUD Suppliers (Pagination, Search, Cache Redis)
  - [ ] Giao diện: Quản lý nhà cung cấp (DataTable + FormModal + Excel export)
- **Quản lý Kho bãi & Vị trí (Warehouses & Locations)**
  - [ ] Migration & Entity: Bảng `warehouses` & Bảng `locations` (Khu - Dãy - Ô kệ)
  - [ ] APIs: CRUD Kho bãi & APIs lấy cấu trúc cây vị trí phân cấp
  - [ ] Giao diện: Quản lý Kho bãi & cấu trúc cây vị trí trực quan
- **Danh mục Sản phẩm (SKUs)**
  - [ ] Migration & Entity: Bảng `categories`, `units_of_measure`, `products`
  - [ ] APIs: CRUD danh mục hàng, đơn vị quy đổi, và sản phẩm kèm Redis Cache
  - [ ] Giao diện: Quản lý Sản phẩm (multi-tab form, định mức tồn kho, thuộc tính JSONB)
  - [ ] Hỗ trợ tính năng Import sản phẩm hàng loạt từ Excel

---

### Phase 3: Core Operations — Nhập/Xuất kho
- **Nhập kho (Inbound)**
  - [ ] Migration & Entity: Bảng `inventory_transactions`, `transaction_items`, `product_batches`, `stock_levels`
  - [ ] APIs: Quy trình duyệt phiếu nhập (DRAFT -> PENDING -> APPROVED -> COMPLETED)
  - [ ] Logic: Cập nhật tồn kho theo lô hàng (`product_batches`) và vị trí (`stock_levels`)
  - [ ] Logic: Tính giá vốn trung bình có trọng số (Weighted Average Cost)
  - [ ] Giao diện: Tạo phiếu nhập (Master-Detail form) & Workflow duyệt
  - [ ] In phiếu nhập ra PDF
- **Xuất kho (Outbound)**
  - [ ] APIs: Quy trình xuất kho và tự động trừ tồn
  - [ ] Logic: Đề xuất vị trí lấy hàng ưu tiên theo FEFO (Hạn dùng trước xuất trước) hoặc FIFO
  - [ ] Concurrency control: Optimistic Locking + Redis Lock tránh xuất âm kho
  - [ ] Giao diện: Tạo phiếu xuất & Bảng chỉ dẫn vị trí lấy hàng (Picking list)
- **Quản lý tồn kho & Chuyển kho**
  - [ ] APIs & Giao diện: Xem tồn kho tổng hợp, tồn theo lô, tồn theo vị trí
  - [ ] APIs & Giao diện: Xem lịch sử biến động tồn kho (Stock card)
  - [ ] APIs & Giao diện: Quy trình chuyển kho nội bộ (Inter-warehouse transfer)

---

### Phase 4: Barcode/QR Code & Kiểm kê
- **Quét mã & Định danh**
  - [ ] API: Sinh mã QR Code cho lô hàng (ZXing)
  - [ ] Giao diện: In nhãn QR Code hàng loạt (layout in decal)
  - [ ] Giao diện: Quét mã QR bằng camera (sử dụng HTML5-QRCode)
- **Kiểm kê kho (Stocktaking)**
  - [ ] Migration & Entity: Bảng `stocktake_sessions`, `stocktake_items`, `stock_adjustments`
  - [ ] APIs: Tạo phiên kiểm kê, ghi nhận thực tế và so sánh chênh lệch
  - [ ] APIs: Tự động tạo phiếu điều chỉnh kho (`StockAdjustment`) từ phần chênh lệch
  - [ ] Giao diện: Thực hiện kiểm kê (Quét mã -> Hiển thị chênh lệch thừa/thiếu real-time)
  - [ ] Giao diện: Duyệt phiếu điều chỉnh kho

---

### Phase 5: Thông báo, Nhật ký & Cài đặt
- **Hệ thống thông báo (Notification System)**
  - [ ] Migration & Entity: Bảng `notifications`
  - [ ] APIs: Đánh dấu đã đọc, đếm số thông báo chưa đọc
  - [ ] Event listener: Gửi thông báo tự động (khi cần duyệt phiếu, khi sắp hết hạn dùng, tồn kho thấp)
  - [ ] Giao diện: Chuông thông báo trên Header & Trang danh sách thông báo
- **Nhật ký hệ thống (Audit Trail & Activity Log)**
  - [ ] Migration & Entity: Bảng `audit_logs` (lưu vết thay đổi dữ liệu cũ/mới) & Bảng `activity_logs`
  - [ ] Giao diện: Tra cứu lịch sử thay đổi dữ liệu & So sánh chi tiết trước/sau thay đổi (JSON Diff)
- **Cấu hình hệ thống (System Settings)**
  - [ ] Migration: Bảng `system_settings` (Lưu cấu hình: chiến lược xuất, tiền tệ, định dạng ngày...)
  - [ ] APIs & Giao diện: Trang cấu hình chung cho hệ thống

---

### Phase 6: Dashboard & Analytics
- **Kho dữ liệu phân tích (Star Schema)**
  - [ ] Migration: Bảng Fact & Dimension (`fact_inventory_movements`, `dim_time`, `dim_product`...)
  - [ ] Scheduler: Tự động làm mới Materialized Views báo cáo định kỳ
- **Báo cáo phân tích**
  - [ ] API & Giao diện: Dashboard tổng hợp KPI & Biểu đồ xu hướng (Recharts)
  - [ ] API & Giao diện: Báo cáo hàng tồn lâu ngày không biến động (30/60/90 ngày)
  - [ ] API & Giao diện: Dự báo ngày hết hàng (dựa trên consumption rate và lead time)
  - [ ] API & Giao diện: Phân loại hàng tồn kho ABC (Pareto chart)
- **Real-time Stock Counter**
  - [ ] Tích hợp Redis real-time counter và cơ chế đẩy dữ liệu SSE/WebSocket

---

### Phase 7: Polish & Optimization
- [ ] **Performance Tuning** — Tối ưu DB Indexes, HikariCP pool, xử lý N+1 query
- [ ] **UI/UX Polish** — Thiết lập Responsive hoàn chỉnh, Dark Mode toàn bộ hệ thống
- [ ] **Security Hardening** — Xử lý API Rate limiting, chống XSS/SQL Injection
- [ ] **Testing** — Viết Unit test JUnit (BE) và Vitest (FE)

---

### Phase 8: Deployment & Documentation
- [ ] **Docker Production** — Đóng gói Dockerfile multi-stage cho BE & FE
- [ ] **Tài liệu API** — Hoàn thiện tài liệu Swagger UI chi tiết
- [ ] **Tài liệu vận hành** — Viết hướng dẫn triển khai và hướng dẫn sử dụng hệ thống
