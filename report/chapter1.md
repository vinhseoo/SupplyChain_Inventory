# CHƯƠNG 1: TỔNG QUAN VỀ ĐỀ TÀI

## 1.1 Lý do chọn đề tài

Trong bối cảnh nền kinh tế toàn cầu hóa và sự phát triển mạnh mẽ của thương mại điện tử, quản trị chuỗi cung ứng (Supply Chain Management - SCM) đã trở thành một trong những yếu tố cốt lõi quyết định năng lực cạnh tranh của doanh nghiệp. Quản lý kho hàng (Inventory Management) là một mắt xích cực kỳ quan trọng trong chuỗi cung ứng đó. Kho hàng không đơn thuần là nơi lưu trữ nguyên vật liệu, bán thành phẩm hay thành phẩm, mà còn là trung điểm điều hòa dòng luân chuyển hàng hóa từ nhà cung ứng đến nhà sản xuất và tới tay người tiêu dùng cuối cùng.

Tuy nhiên, việc quản lý kho hàng tại nhiều doanh nghiệp vừa và nhỏ (SMEs) hiện nay vẫn đang đối mặt với nhiều thách thức lớn:
- **Phương pháp quản lý thủ công:** Sử dụng sổ sách hoặc bảng tính Excel rời rạc dẫn đến rủi ro sai sót dữ liệu cao, tốc độ cập nhật thông tin chậm trễ.
- **Thất thoát và lãng phí:** Việc thiếu kiểm soát vị trí lưu kho chi tiết (Khu - Dãy - Kệ) khiến nhân viên mất nhiều thời gian tìm kiếm hàng hóa, gây giảm năng suất lao động và tăng tỷ lệ hàng hóa bị hỏng hóc hoặc hết hạn sử dụng (đặc biệt với các ngành hàng thực phẩm, dược phẩm, hóa chất).
- **Thiếu kiểm soát luồng nghiệp vụ phức tạp:** Việc luân chuyển hàng hóa giữa các kho (Inter-warehouse transfer), kiểm kê định kỳ (Stocktaking) thường xuyên xảy ra tình trạng lệch số liệu giữa sổ sách và thực tế mà không tìm ra nguyên nhân do thiếu vết nhật ký thay đổi (Audit Trail).
- **Rủi ro về dòng tiền:** Việc không nắm bắt chính xác mức tồn kho tối ưu (tồn kho an toàn) dẫn đến hiện tượng đọng vốn do nhập quá nhiều hàng, hoặc mất cơ hội bán hàng do thiếu hụt hàng hóa (out-of-stock).

Để giải quyết triệt để các vấn đề trên, việc xây dựng một hệ thống công nghệ thông tin tích hợp và tự động hóa quy trình là vô cùng cấp thiết. Hệ thống **SCIM (Supply Chain & Inventory Management System)** được đề xuất thiết kế và phát triển nhằm cung cấp một giải pháp quản trị kho thông minh, hỗ trợ quản lý chi tiết vị trí lưu trữ, theo dõi lô hàng hạn sử dụng theo chiến lược FEFO/FIFO, tích hợp công nghệ mã QR trong hoạt động kiểm kê, tự động hóa tính toán giá vốn trung bình và báo cáo phân tích thời gian thực. Hệ thống giúp doanh nghiệp số hóa toàn diện quy trình, giảm thiểu sai sót, nâng cao năng suất vận hành và tối ưu hóa chi phí tồn kho.

---

## 1.2 Mục tiêu của đề tài

Mục tiêu tổng quát của đề tài là nghiên cứu, thiết kế và phát triển một hệ thống phần mềm quản lý chuỗi cung ứng và tồn kho (SCIM) toàn diện, ứng dụng các công nghệ hiện đại nhằm giải quyết các bài toán nghiệp vụ kho phức tạp.

Cụ thể, hệ thống hướng tới các mục tiêu chi tiết sau:
1. **Quản lý danh mục cốt lõi (Master Data):** Quản lý tập trung thông tin nhà cung cấp, sản phẩm (với thuộc tính động dạng JSONB), đơn vị tính, và cấu trúc cây vị trí kho phân cấp trực quan (Warehouse -> Location: Khu - Dãy - Ô kệ).
2. **Tự động hóa luồng nghiệp vụ Nhập/Xuất kho (Core Operations):**
   - Thiết lập quy trình phê duyệt phiếu nhập/xuất kho nhiều bước từ dự thảo đến hoàn thành.
   - Tự động hóa việc phân bổ và cập nhật mức tồn kho chi tiết (`StockLevel`) theo lô sản phẩm (`ProductBatch`) và vị trí lưu trữ (`Location`).
   - Tự động tính toán giá vốn hàng bán dựa trên phương pháp **Weighted Average Cost (Giá vốn trung bình gia quyền)** ngay tại thời điểm hoàn thành phiếu nhập.
3. **Tối ưu hóa quy trình lấy hàng (Picking Optimization):** Tích hợp thuật toán đề xuất vị trí lấy hàng ưu tiên theo chiến lược **FEFO (First Expired, First Out - Hạn dùng trước xuất trước)** và **FIFO (First In, First Out - Nhập trước xuất trước)**.
4. **Kiểm soát đồng thời và An toàn giao dịch:** Áp dụng cơ chế khóa lạc quan (Optimistic Locking) và Khóa phân tán (Redis Distributed Lock) tại tầng cơ sở dữ liệu để ngăn chặn tình trạng xung đột dữ liệu và xuất âm kho khi có nhiều nhân viên thao tác đồng thời.
5. **Số hóa hoạt động kiểm kê và định danh:** 
   - Hỗ trợ sinh mã QR cho lô hàng và vị trí kho hàng loạt.
   - Cho phép quét mã QR thông qua camera thiết bị để kiểm kê và định vị hàng hóa nhanh chóng, tự động ghi nhận số lượng thực tế và đối chiếu chênh lệch thừa/thiếu.
6. **Báo cáo và phân tích thông minh (Dashboard & Analytics):**
   - Xây dựng dashboard theo dõi các chỉ số KPI kho cốt lõi thời gian thực (Real-time Stock Counter).
   - Báo cáo phân loại hàng tồn kho theo mô hình ABC (phân tích Pareto).
   - Dự báo thời gian hết hàng dựa trên tốc độ tiêu thụ trung bình.
   - Báo cáo hàng tồn lâu ngày không biến động (dead stock).
7. **Kiểm soát vết hệ thống (Audit Trail & Activity Log):** Ghi nhận chi tiết mọi hoạt động thay đổi cấu trúc dữ liệu, so sánh dữ liệu trước và sau khi thay đổi (JSON Diff) để phục vụ công tác đối soát.

---

## 1.3 Đối tượng và Phạm vi nghiên cứu

### 1.3.1 Đối tượng nghiên cứu
- **Đối tượng lý thuyết:** Quy trình nghiệp vụ kho bãi (Inbound, Outbound, Transfer, Stocktaking), các mô hình quản lý hàng tồn kho (FIFO, FEFO, ABC Analysis), thuật toán tính giá vốn hàng bán, các giải pháp công nghệ lập trình backend (Spring Boot, Redis), frontend (React, Zustand, React Query) và cơ sở dữ liệu quan hệ (Postgres).
- **Đối tượng khảo sát ứng dụng:** Quy trình vận hành kho tại các doanh nghiệp phân phối, sản xuất và bán lẻ vừa và nhỏ, nơi có yêu cầu quản lý sản phẩm theo lô hàng và hạn sử dụng nghiêm ngặt.

### 1.3.2 Phạm vi nghiên cứu
- **Phạm vi chức năng:** Tập trung vào các phân hệ:
  - Xác thực & Phân quyền động dựa trên vai trò (RBAC).
  - Quản lý danh mục (Nhà cung cấp, Kho bãi & Sơ đồ vị trí, Hàng hóa & Đơn vị tính).
  - Nghiệp vụ Nhập kho & Xuất kho (kèm theo các thuật toán tối ưu vị trí FEFO/FIFO, tính giá vốn và kiểm soát khóa đồng thời).
  - Nghiệp vụ Kiểm kê & Điều chỉnh kho tự động.
  - Quét mã QR code lô hàng phục vụ nghiệp vụ kho.
  - Hệ thống Tiện ích (Thông báo đẩy, Audit Logs chi tiết, Cấu hình hệ thống).
  - Phân tích báo cáo thông minh (Dashboard, Pareto ABC, Dự báo hết hàng).
- **Phạm vi công nghệ:** Phát triển hệ thống web app chạy trên môi trường Web Browser (Chrome, Edge, Safari...) tương thích đa thiết bị (Desktop, Tablet, Mobile) sử dụng các công nghệ đã phê duyệt: Spring Boot 3.5 + React 18 + PostgreSQL 16 + Redis 7.

---

## 1.4 Phương pháp nghiên cứu

Để thực hiện thành công đề tài, phương pháp nghiên cứu được áp dụng kết hợp giữa lý thuyết và thực tiễn phát triển phần mềm theo quy trình chuẩn mực:

1. **Phương pháp nghiên cứu tài liệu (Lý thuyết):**
   - Nghiên cứu các giáo trình, tài liệu chuyên ngành về quản lý chuỗi cung ứng, quản trị logistics để hiểu sâu các quy trình nghiệp vụ kho tiêu chuẩn.
   - Đọc hiểu tài liệu kỹ thuật về kiến trúc Spring Boot, Spring Security (JWT), Hibernate/JPA, cơ chế caching của Redis, React, Ant Design.
2. **Phương pháp phân tích và thiết kế hệ thống (OOAD):**
   - Sử dụng phương pháp phân tích thiết kế hướng đối tượng (Object-Oriented Analysis and Design).
   - Sử dụng ngôn ngữ mô hình hóa thống nhất (UML) để xây dựng các biểu đồ: Use Case Diagram để làm rõ yêu cầu chức năng, Sequence Diagram để mô tả luồng nghiệp vụ động, Class Diagram để thiết kế cấu trúc dữ liệu tĩnh, ERD để thiết kế cơ sở dữ liệu quan hệ vật lý.
3. **Phương pháp thực nghiệm phát triển phần mềm (Software Engineering):**
   - Áp dụng mô hình **Agile/Scrum** chia dự án thành các giai đoạn (Phases) tăng trưởng để thực hiện tuần tự và kiểm thử liên tục.
   - Áp dụng kiến trúc phân lớp (**Layered Architecture**) ở Backend nhằm tách biệt rõ ràng trách nhiệm giữa API Controller, Business Service, và Data Access Repository.
   - Áp dụng cấu trúc dựa trên chức năng (**Feature-based Architecture**) ở Frontend nhằm tăng khả năng tái sử dụng component và bảo trì mã nguồn lâu dài.
   - Sử dụng Flyway để kiểm soát phiên bản database schema (Database Migration) đảm bảo đồng bộ môi trường phát triển.
4. **Phương pháp kiểm thử và đánh giá (Testing & Evaluation):**
   - Kiểm thử đơn vị (Unit Test) sử dụng JUnit 5 & Mockito để kiểm chứng các thuật toán tính giá vốn, logic khóa đồng thời, gợi ý FEFO ở backend.
   - Kiểm thử tích hợp và chấp nhận người dùng (UAT) theo các kịch bản kiểm thử mẫu (Test Cases) phủ khắp các chức năng nghiệp vụ để đánh giá tính đúng đắn và độ ổn định của hệ thống trước khi nghiệm thu.
