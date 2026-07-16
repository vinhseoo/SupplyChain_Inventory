# CHƯƠNG 3 (PHẦN 1): CÔNG NGHỆ PHÁT TRIỂN & KHUNG DỰ ÁN

## 3.1 Công nghệ phát triển phía Backend

Hệ thống backend của dự án SCIM được xây dựng trên nền tảng **Java 21** và framework **Spring Boot 3.5.x**, áp dụng mô hình kiến trúc phân lớp (Layered Architecture). Lựa chọn này mang lại hiệu năng cao, tính an toàn kiểu dữ liệu và khả năng mở rộng tốt cho các ứng dụng doanh nghiệp.

### 3.1.1 Java 21 & Spring Boot 3.5.x
- **Java 21 (LTS):** Phiên bản hỗ trợ dài hạn mới của Java mang lại nhiều tính năng tối ưu như *Virtual Threads* giúp cải thiện hiệu năng xử lý đa luồng đồng thời, *Pattern Matching for switch*, và cấu trúc *Record* để định nghĩa các DTOs (Data Transfer Objects) bất biến một cách ngắn gọn, tối ưu bộ nhớ.
- **Spring Boot 3.5.x:** Framework hàng đầu để phát triển RESTful APIs nhanh chóng nhờ cơ chế Auto-configuration. Dự án tích hợp các module cốt lõi:
  - *Spring Web:* Cung cấp hạ tầng xây dựng REST APIs.
  - *Spring Security:* Quản lý xác thực (Authentication) và phân quyền (Authorization) dựa trên JWT.
  - *Spring Data JPA:* Đơn giản hóa tầng truy xuất dữ liệu thông qua Hibernate, hỗ trợ đắc lực trong việc quản lý giao dịch (Transactions) và mapping dữ liệu quan hệ (ORM).

### 3.1.2 Tầng lưu trữ & Caching (PostgreSQL 16 & Redis 7)
- **PostgreSQL 16:** Cơ sở dữ liệu quan hệ mạnh mẽ, hỗ trợ tốt các giao dịch ACID phức tạp của quy trình kho. PostgreSQL 16 cung cấp tính năng lưu trữ kiểu dữ liệu động `JSONB` (được dùng để lưu thuộc tính sản phẩm linh hoạt) và hỗ trợ tối ưu hóa các Materialized Views phục vụ báo cáo phân tích tổng hợp.
- **Redis 7 (In-Memory Database):** Được sử dụng với hai vai trò quan trọng:
  1. *Caching:* Lưu trữ tạm thời các danh mục ít thay đổi như Nhà cung cấp, Nhóm sản phẩm, Đơn vị tính để giảm thiểu truy vấn trực tiếp vào DB, tăng tốc độ phản hồi API dưới 10ms.
  2. *Distributed Lock (Khóa phân tán):* Sử dụng thư viện Redisson hoặc tích hợp Redis Template để tạo cơ chế khóa phân tán, ngăn chặn tình trạng xuất quá số lượng hàng hiện có khi nhiều luồng API xuất kho chạy song song.

### 3.1.3 Các thư viện hỗ trợ cốt lõi (Backend)
- **Flyway Migration:** Công cụ quản lý phiên bản cơ sở dữ liệu. Mọi thay đổi về schema (bảng, cột, chỉ mục, dữ liệu mẫu) đều được viết dưới dạng các file SQL migration tăng dần (`V1__...`, `V2__...`) giúp đồng bộ dữ liệu dễ dàng trên mọi môi trường và tránh tình trạng sai lệch schema.
- **Lombok:** Tự động sinh getter, setter, constructor, builder pattern (`@Getter`, `@Setter`, `@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`) giúp mã nguồn ngắn gọn, dễ đọc.
- **MapStruct 1.6.x:** Công cụ sinh mã ánh xạ (mapping) tự động giữa Entity và DTOs ở thời điểm compile-time, giúp tối ưu hóa hiệu năng so với các thư viện dùng Reflection (như ModelMapper).
- **ZXing (Zebra Crossing):** Thư viện hỗ trợ sinh mã QR code dạng ma trận hai chiều từ thông tin mã lô hàng và mã vị trí.
- **Jakarta Validation:** Thực hiện validate dữ liệu đầu vào tại Controller (`@NotBlank`, `@NotNull`, `@Min`, `@Max`, `@Size`, `@Email`...) trước khi đưa vào xử lý nghiệp vụ.

---

## 3.2 Công nghệ phát triển phía Frontend

Giao diện người dùng được phát triển dưới dạng **Single Page Application (SPA)** hiện đại, áp dụng **TypeScript** để tăng tính an toàn và minh bạch cho luồng dữ liệu.

### 3.2.1 React 18 & Vite
- **React 18:** Thư viện giao diện người dùng dựa trên thành phần (component-based). Dự án tận dụng tối đa cơ chế Hook, lập trình hàm (Functional Components), và các tối ưu hóa render để mang lại trải nghiệm mượt mà, phản hồi lập tức.
- **Vite:** Công cụ build tool thế hệ mới thay thế cho Webpack, giúp khởi động dev server cực nhanh nhờ tận dụng ES Modules gốc của trình duyệt và build mã nguồn tối ưu thông qua Rollup.

### 3.2.2 Thư viện thiết kế UI & Styling
- **Ant Design 5.x:** Thư viện UI Components cao cấp dành cho các ứng dụng doanh nghiệp. Dự án tận dụng các component mạnh mẽ như *Table* (hỗ trợ phân trang, sắp xếp, lọc), *Form* (validate Client-side), *Tree* (hiển thị sơ đồ kho phân cấp), *Modal*, và các thông báo trạng thái (*Message*, *Notification*). Hệ thống cấu hình Design Tokens của Ant Design 5 giúp tùy biến giao diện đồng bộ.
- **Tailwind CSS v4:** Framework CSS tiện ích giúp xây dựng layout nhanh chóng, linh hoạt trực tiếp trong file HTML/TSX, tạo nên giao diện hiện đại, tối giản và đáp ứng tốt mọi kích thước màn hình (Responsive Design).
- **Recharts:** Thư viện vẽ biểu đồ chuyên biệt cho React, được sử dụng trong Dashboard để trực quan hóa dữ liệu tồn kho, biểu đồ Pareto ABC, và xu hướng xuất nhập.

### 3.2.3 Quản lý State & Kết nối API
- **Zustand:** Thư viện quản lý Global State cực kỳ gọn nhẹ và hiệu năng cao. Được dùng để lưu trữ trạng thái đăng nhập, thông tin người dùng hiện tại, danh sách quyền hạn (Permissions) phục vụ phân quyền hiển thị UI.
- **TanStack Query (React Query) v5:** Giải pháp quản lý Server State (dữ liệu lấy từ API). React Query tự động quản lý việc cache dữ liệu, tự động fetch lại khi dữ liệu hết hạn (stale), xử lý trạng thái loading/error đồng bộ, giúp giảm thiểu code boilerplates.
- **Axios:** Thư viện HTTP client dùng để kết nối với REST APIs của Backend. Được cấu hình Axios Interceptors để tự động đính kèm JWT Access Token vào Header của mọi request và bắt lỗi tập trung (ví dụ: tự động gọi API Refresh Token khi gặp lỗi 401 Unauthorized, hoặc đẩy thông báo lỗi toàn cục khi gặp lỗi 500).

---

## 3.3 Kiến trúc thư mục và Tổ chức mã nguồn thực tế

Dự án tuân thủ nghiêm ngặt các quy tắc lập trình đã quy định trong `AGENTS.md` nhằm tạo ra một mã nguồn sạch, dễ đọc và dễ bảo trì.

### 3.3.1 Cấu trúc mã nguồn Backend (Layered Architecture)

Mã nguồn Java được tổ chức phân lớp rõ ràng. Cấu trúc thư mục cụ thể như sau:

```
backend/src/main/java/com/scim/
├── ScimApiApplication.java    # File chạy chính của ứng dụng Spring Boot
├── config/                   # Các lớp cấu hình hệ thống (Security, Redis, Web MVC, Swagger)
├── controller/               # Lớp tiếp nhận HTTP requests, kiểm tra đầu vào (Validation)
├── dto/                      # Các lớp truyền dữ liệu (Request/Response DTOs)
│   ├── request/              # DTOs chứa dữ liệu gửi lên từ Client
│   └── response/             # DTOs định dạng dữ liệu trả về cho Client
├── entity/                   # Các lớp mô hình hóa thực thể cơ sở dữ liệu (ORM Entities)
│   └── base/                 # Lớp thực thể cơ sở (BaseEntity chứa id, audit fields, version)
├── event/                    # Định nghĩa các Event và Listener (xử lý bất đồng bộ như gửi thông báo)
├── exception/                # Các lớp ngoại lệ tùy chỉnh (Custom Exceptions) và GlobalExceptionHandler
├── mapper/                   # Các mapper interfaces dùng MapStruct để chuyển đổi Entity <-> DTO
├── repository/               # Lớp truy xuất cơ sở dữ liệu kế thừa JpaRepository (Spring Data JPA)
├── scheduler/                # Các tiến trình chạy ngầm định kỳ (Refresh Materialized Views, dọn dẹp log)
└── service/                  # Lớp chứa toàn bộ logic nghiệp vụ (Business Logic Layer)
    └── impl/                 # Hiện thực hóa các interface Service
```

### 3.3.2 Cấu trúc mã nguồn Frontend (Feature-based Architecture)

Mã nguồn Frontend tổ chức theo từng phân hệ chức năng (features) độc lập giúp việc mở rộng dễ dàng mà không làm ảnh hưởng đến các phân hệ khác. Cấu trúc thư mục cụ thể như sau:

```
frontend/src/
├── main.tsx                  # Điểm khởi đầu của ứng dụng React
├── App.tsx                   # Component gốc định cấu hình Theme, Providers, Layout
├── routes.tsx                # Định nghĩa hệ thống định tuyến (Routing) và bảo vệ route
├── components/               # Các shared components dùng chung toàn cục (Button, Input, Layout...)
├── config/                   # Cấu hình biến môi trường, cài đặt axios client
├── services/                 # Lớp giao tiếp API dùng chung (auth service, upload service...)
├── stores/                   # Quản lý global state dùng chung (Zustand auth store)
├── styles/                   # Tệp tin cấu hình css toàn cục (global.css)
├── types/                    # Các interfaces, types dùng chung toàn cục
├── utils/                    # Các hàm tiện ích (định dạng ngày tháng, tiền tệ, xử lý chuỗi)
└── features/                 # Thư mục chứa các phân hệ chức năng
    ├── auth/                 # Phân hệ đăng nhập, thông tin tài khoản cá nhân
    ├── dashboard/            # Phân hệ màn hình biểu đồ phân tích thống kê
    ├── inventory/            # Phân hệ quản lý nhập kho, xuất kho, lịch sử tồn kho
    ├── product/              # Phân hệ quản lý sản phẩm, đơn vị tính, danh mục sản phẩm
    ├── stocktake/            # Phân hệ quản lý phiên kiểm kê và điều chỉnh kho
    ├── supplier/             # Phân hệ quản lý thông tin nhà cung cấp
    ├── warehouse/            # Phân hệ quản lý sơ đồ kho hàng và vị trí lưu kho
    └── system/               # Phân hệ quản lý cấu hình hệ thống, audit logs, notifications
        ├── components/       # Component nội bộ của phân hệ
        ├── hooks/            # Các custom hooks (React Query query/mutation) của phân hệ
        ├── pages/            # Các trang giao diện của phân hệ
        ├── types.ts          # Các định nghĩa kiểu dữ liệu nội bộ
        └── index.ts          # Điểm xuất khẩu dữ liệu dùng chung ra ngoài
```
