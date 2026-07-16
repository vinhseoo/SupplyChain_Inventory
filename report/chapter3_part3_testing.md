# CHƯƠNG 3 (PHẦN 3): THỬ NGHIỆM, ĐÁNH GIÁ VÀ KẾT LUẬN

## 3.3.1 Kế hoạch thử nghiệm (Test Plan) & Kịch bản UAT

Quy trình thử nghiệm hệ thống SCIM được thực hiện qua hai cấp độ chính: Kiểm thử chấp nhận người dùng (User Acceptance Testing - UAT) nhằm đảm bảo hệ thống đáp ứng đúng và đủ yêu cầu nghiệp vụ, và Kiểm thử đơn vị (Unit Testing) nhằm bảo vệ tính đúng đắn của các giải thuật xử lý dữ liệu.

### 1. Bảng Kịch bản kiểm thử UAT (User Acceptance Testing Test Cases)

Dưới đây là danh sách các kịch bản kiểm thử UAT cho các tính năng cốt lõi của hệ thống:

| Mã TC | Phân hệ | Tên kịch bản | Các bước thực hiện | Kết quả mong đợi | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UAT_01** | Xác thực | Đăng nhập hệ thống | 1. Nhập username, password đúng.<br>2. Nhấn nút Đăng nhập. | Đăng nhập thành công, hệ thống điều hướng vào trang Dashboard, hiển thị tên người dùng và mở menu chức năng tương ứng. | Đạt |
| **UAT_02** | Phân quyền | Kiểm soát leo thang đặc quyền | 1. Đăng nhập bằng tài khoản có vai trò `Viewer`.<br>2. Thử truy cập trực tiếp URL trang quản trị user `/admin/users` hoặc gọi API tạo sản phẩm. | 1. Giao diện ẩn menu quản trị.<br>2. Trình duyệt báo lỗi không có quyền truy cập, API trả về mã lỗi `403 Forbidden`. | Đạt |
| **UAT_03** | Nghiệp vụ | Lập và duyệt phiếu nhập kho (Inbound) | 1. Tạo phiếu nhập dạng Draft, thêm sản phẩm, giá nhập, số lượng, số lô và hạn sử dụng.<br>2. Nhấn "Gửi duyệt" phiếu.<br>3. Tài khoản Manager đăng nhập và nhấn "Duyệt phiếu". | Phiếu nhập chuyển trạng thái sang `COMPLETED`, số dư tồn kho chi tiết tại `StockLevel` tăng tương ứng, giá vốn sản phẩm được cập nhật lại theo công thức WAC. | Đạt |
| **UAT_04** | Nghiệp vụ | Xuất kho gợi ý FEFO | 1. Tạo yêu cầu xuất sản phẩm X với số lượng là 50.<br>2. Nhấn "Gợi ý vị trí lấy hàng".<br>3. Kiểm tra danh sách gợi ý. | Hệ thống tự động phân bổ 50 sản phẩm cần xuất vào các ô kệ chứa lô hàng của sản phẩm đó có hạn sử dụng gần nhất xếp trước (FEFO Picking). | Đạt |
| **UAT_05** | Đồng thời | Ngăn chặn xuất âm kho | 1. Mở hai trình duyệt cùng chuẩn bị duyệt xuất 10 sản phẩm X (trong khi tồn kho khả dụng chỉ còn 12 sản phẩm).<br>2. Nhấn đồng thời nút duyệt xuất trên cả hai trình duyệt. | Giao dịch đầu tiên hoàn thành xuất 10 sản phẩm (tồn kho còn 2). Giao dịch thứ hai bị chặn lại, hệ thống báo lỗi không đủ tồn kho và rollback dữ liệu an toàn. | Đạt |
| **UAT_06** | Kiểm kê | Kiểm kê và tự động điều chỉnh | 1. Khởi tạo phiên kiểm kê.<br>2. Nhân viên quét mã QR điền số lượng đếm thực tế (lệch so với sổ sách).<br>3. Quản lý xem báo cáo chênh lệch và nhấn "Duyệt điều chỉnh". | Phiên kiểm kê đóng lại, một phiếu `StockAdjustment` được tạo tự động, tồn kho tại các vị trí kệ được cộng/trừ để khớp hoàn toàn với số thực tế. | Đạt |

---

### 2. Kiểm thử đơn vị (Unit Testing)

Hoạt động kiểm thử đơn vị (Unit Test) tại Backend SCIM tập trung vào việc xác minh độ chính xác của các xử lý tính toán và kiểm soát điều kiện biên mà không phụ thuộc vào kết nối cơ sở dữ liệu vật lý hay máy chủ Redis.

Quy trình và kịch bản thiết lập kiểm thử đơn vị cụ thể như sau:
1. **Sử dụng cơ chế Mocking (Mockito):** Tầng dịch vụ (`ServiceImpl`) được kiểm thử độc lập bằng cách sử dụng `@ExtendWith(MockitoExtension.class)`. Các repository phụ thuộc (như `ProductRepository`, `StockLevelRepository`) được khai báo dưới dạng `@Mock` để giả lập các dữ liệu trả về theo ý muốn, giúp cô lập hoàn toàn logic cần kiểm tra.
2. **Kịch bản kiểm thử tính giá vốn trung bình gia quyền (WAC):**
   - **Mục tiêu:** Đảm bảo hệ thống tính toán giá trị WAC chính xác theo đúng công thức toán học khi duyệt hoàn thành phiếu nhập.
   - **Thiết lập:** Mock dữ liệu sản phẩm ban đầu có giá vốn hiện hành. Giả lập cơ sở dữ liệu trả về tổng lượng tồn kho sau khi nhập.
   - **Hành động:** Gọi hàm xử lý tính toán WAC của dịch vụ.
   - **Kiểm chứng (Assertion):** Sử dụng các hàm so sánh của JUnit (`assertEquals`) để đối chiếu giá trị giá vốn mới của sản phẩm sau khi chạy hàm với giá trị tính toán lý thuyết. Đảm bảo sai số làm tròn nhỏ hơn 4 chữ số thập phân.
3. **Kịch bản kiểm thử thuật toán Picking FEFO:**
   - **Mục tiêu:** Xác minh hệ thống đề xuất vị trí xuất kho ưu tiên theo hạn sử dụng của lô hàng.
   - **Thiết lập:** Giả lập danh sách tồn kho chi tiết gồm nhiều lô hàng của sản phẩm X tại các ô kệ khác nhau, có hạn sử dụng khác nhau.
   - **Hành động:** Gọi hàm đề xuất vị trí (`suggestOutbound`) với số lượng yêu cầu.
   - **Kiểm chứng:** Kiểm tra xem danh sách trả về có sắp xếp đúng thứ tự hạn sử dụng tăng dần (FEFO) hay không, và tổng lượng hàng đề xuất lấy ra có bằng đúng số lượng yêu cầu hay không.
4. **Kịch bản kiểm thử xử lý hết hàng (tránh xuất âm):**
   - **Mục tiêu:** Đảm bảo hệ thống ném ra đúng ngoại lệ nghiệp vụ khi số lượng xuất vượt quá số dư khả dụng.
   - **Thiết lập:** Giả lập số dư tồn kho khả dụng nhỏ hơn số lượng yêu cầu xuất.
   - **Hành động:** Gọi hàm thực thi xuất kho.
   - **Kiểm chứng:** Sử dụng `assertThrows` để xác nhận hệ thống có ném ra lỗi `InsufficientStockException` hay không và kiểm tra giao dịch có tự động rollback để bảo toàn số dư tồn kho hay không.

## 3.3.2 Đánh giá hệ thống

Sau thời gian nghiên cứu, phân tích thiết kế và hiện thực hóa dự án Supply Chain & Inventory Management (SCIM), nhóm thực hiện đề tài đã hoàn thành việc xây dựng ứng dụng và tự đánh giá kết quả đạt được như sau:

### 1. Kết quả đạt được (Ưu điểm)
- **Hoàn thành toàn bộ mục tiêu nghiệp vụ:** Hệ thống giải quyết tốt và toàn diện chuỗi nghiệp vụ kho từ đăng nhập, phân quyền động, quản lý vị trí kho theo ngăn kệ chi tiết, quản lý lô hàng & hạn sử dụng, tự động hóa nhập/xuất/kiểm kê.
- **Tính chính xác và an toàn dữ liệu cao:** Áp dụng thành công cơ chế khóa phân tán Redis và khóa lạc quan PostgreSQL để giải quyết triệt để lỗi đua ghi dữ liệu (race condition) và ngăn chặn tình trạng xuất âm kho khi nhiều nhân viên cùng thao tác.
- **Tối ưu hóa vận hành thực tế:** Thuật toán Picking gợi ý vị trí FEFO/FIFO giúp thủ kho nhặt hàng nhanh hơn, giảm tỷ lệ hết hạn sử dụng của hàng hóa tồn kho. Việc tích hợp quét mã QR bằng camera giúp tăng tốc kiểm kho và giảm lỗi nhập liệu thủ công.
- **Giao diện hiện đại, dễ sử dụng:** Ứng dụng công nghệ Ant Design 5 mang lại giao diện nhất quán, tối giản và đáp ứng tốt đa thiết bị (Responsive Design).
- **Tốc độ phản hồi cực nhanh:** Nhờ cơ chế Redis caching cho danh mục cốt lõi, tốc độ phản hồi API danh mục đạt dưới 50ms, giảm tải cho PostgreSQL DB.

### 2. Hạn chế của hệ thống
- **Chưa tích hợp đơn vị vận chuyển bên thứ ba:** Hệ thống mới tập trung giải quyết bài toán quản lý kho nội bộ, chưa tích hợp kết nối API với các hãng logistics vận chuyển (như Giao Hàng Nhanh, Viettel Post...) để theo dõi lộ trình đơn hàng thời gian thực.
- **Báo cáo dự báo ở mức cơ bản:** Tính năng dự báo ngày hết hàng mới dựa trên tốc độ tiêu thụ trung bình trong quá khứ gần (phương pháp tuyến tính đơn giản), chưa áp dụng các mô hình học máy (Machine Learning) nâng cao để phân tích tính mùa vụ (seasonality) của thị trường.
- **Phụ thuộc kết nối mạng:** Do chạy trên nền tảng Web Application, hệ thống đòi hỏi thiết bị của nhân viên kho luôn phải kết nối Internet ổn định để đồng bộ dữ liệu, chưa hỗ trợ chế độ làm việc offline khi mất sóng mạng tại các kho sâu.

---

## 3.3.3 Hướng phát triển tương lai

Để hoàn thiện hệ thống và mở rộng phạm vi ứng dụng trong thực tiễn, hướng phát triển tương lai của đề tài tập trung vào các nội dung sau:
1. **Phát triển ứng dụng di động Hybrid (Mobile App):** Sử dụng React Native hoặc Flutter để đóng gói app chạy trên thiết bị kiểm kho chuyên dụng (PDA sử dụng máy quét hồng ngoại phần cứng), hỗ trợ lưu trữ cục bộ để nhân viên làm việc offline tại các kho sóng yếu và đồng bộ lại khi có mạng.
2. **Ứng dụng Trí tuệ Nhân tạo (AI) trong dự báo tồn kho:** Tích hợp mô hình học máy phân tích chuỗi thời gian (như ARIMA, Prophet hoặc LSTM) để phân tích lịch sử biến động, dự báo chính xác lượng tồn kho an toàn và tự động đề xuất đơn đặt hàng (Auto-replenishment) thông minh dựa trên tính mùa vụ và thời gian giao hàng (lead time) của nhà cung cấp.
3. **Mở rộng kết nối hệ sinh thái (Integrations):** Thiết lập kết nối API hai chiều với các hệ thống ERP lớn (SAP, Oracle), các sàn thương mại điện tử (Shopee, Lazada, TikTok Shop) và các cổng thanh toán/vận chuyển để tự động hóa hoàn toàn chuỗi cung ứng từ khâu mua hàng, bán hàng đến giao vận.

---

## 3.3.4 Kết luận chung

Đề tài **"Thiết kế và xây dựng Hệ thống Quản lý Chuỗi cung ứng & Tồn kho (SCIM)"** đã hoàn thành đầy đủ các nội dung nghiên cứu lý thuyết và phát triển thực nghiệm phần mềm theo đúng kế hoạch đề ra. 

Hệ thống đã chứng minh được tính thực tiễn cao khi giải quyết triệt để các bài toán nhức nhối trong quản lý kho hàng hiện nay của doanh nghiệp: quản lý vị trí lưu trữ chi tiết, quản lý hạn sử dụng theo lô hàng, số hóa quy trình kiểm kê bằng mã QR, tự động hóa tính giá vốn tức thời và đảm bảo an toàn giao dịch đồng thời. Việc áp dụng các công nghệ tiên tiến như Java 21/Spring Boot, React, PostgreSQL 16 và Redis 7 mang lại cho hệ thống một nền tảng vững chắc về hiệu năng, độ tin cậy và khả năng mở rộng trong tương lai. Mặc dù vẫn còn một số hạn chế về tích hợp vận chuyển và dự báo thông minh, đề tài đã đặt nền móng công nghệ vững chắc, sẵn sàng làm cơ sở để nâng cấp thành một giải pháp quản trị chuỗi cung ứng toàn diện cho doanh nghiệp trong kỷ nguyên chuyển đổi số.
