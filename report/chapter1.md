# CHƯƠNG 1: TỔNG QUAN VỀ CHUỖI CUNG ỨNG VÀ HỆ THỐNG QUẢN LÝ KHO BÃI (SCIM)

## 1.1. Khái niệm tổng quan về Chuỗi cung ứng (Supply Chain) và Quản lý Tồn kho (Inventory Management) trong doanh nghiệp hiện đại

### 1.1.1. Khái niệm và Bối cảnh thực tế
Chuỗi cung ứng (Supply Chain) là một hệ thống tích hợp chặt chẽ bao gồm các tổ chức, con người, hoạt động, thông tin và các nguồn tài nguyên liên quan đến việc di chuyển sản phẩm hoặc dịch vụ từ nhà cung cấp nguyên vật liệu ban đầu đến tay người tiêu dùng cuối cùng. Trong nền kinh tế số và toàn cầu hóa hiện nay, chuỗi cung ứng đóng vai trò như hệ tuần hoàn giúp duy trì hoạt động giao thương liên tục. Bất kỳ một sự đứt gãy nào tại các mắt xích, dù là nhỏ nhất, đều có thể gây ra những hậu quả kinh tế dây chuyền nghiêm trọng đối với doanh nghiệp và thị trường tiêu thụ.

Quản lý tồn kho (Inventory Management) là một bộ phận cốt lõi cấu thành nên sự thành bại của quản lý chuỗi cung ứng. Đây là quá trình hoạch định, giám sát, kiểm soát và điều phối luồng luân chuyển hàng hóa từ lúc nhập kho đến lúc xuất kho. Mục tiêu tối thượng của quản lý tồn kho trong doanh nghiệp hiện đại là đạt được trạng thái cân bằng động: duy trì đủ lượng hàng dự trữ cần thiết để đáp ứng nhu cầu thị trường, đồng thời giảm thiểu tối đa chi phí lưu kho và rủi ro đọng vốn của doanh nghiệp.

Trong bối cảnh thực tiễn tại Việt Nam và thế giới hiện nay, đặc biệt là giai đoạn chuyển đổi số mạnh mẽ hậu khủng hoảng chuỗi cung ứng toàn cầu, các doanh nghiệp đang phải đối diện với áp lực rất lớn về tính chính xác và thời gian đáp ứng đơn hàng. Sự gia tăng nhanh chóng của chi phí mặt bằng nhà kho, chi phí nhân công và tính cạnh tranh gay gắt của mô hình bán hàng đa kênh buộc các doanh nghiệp phải từ bỏ các phương pháp quản lý kho thủ công bằng sổ ghi chép hay bảng tính Excel đơn giản để chuyển dịch sang các hệ thống phần mềm quản lý tự động hóa thông minh.

[Hình 1.1: Sơ đồ luồng lưu chuyển hàng hóa trong chuỗi cung ứng hiện đại]

### 1.1.2. Tầm quan trọng của việc tự động hóa quản lý kho bãi, lô hàng (Product Batches) và định vị vị trí kho (Warehouses & Locations)
Việc chuyển đổi sang mô hình tự động hóa quản trị kho mang lại nhiều giá trị thực tiễn to lớn cho doanh nghiệp, tập trung vào ba yếu tố trọng tâm:

1. **Quản lý cấu trúc vị trí kho chi tiết (Warehouses & Locations):** Một kho hàng hiện đại không thể quản lý chung chung, mà phải được số hóa chi tiết thành cấu trúc cây phân cấp khoa học từ Phân khu (Zones), Lối đi/Dãy (Aisles), Kệ (Shelves), đến từng Hộc chứa (Bins). Việc định vị chính xác vị trí hàng hóa và hiển thị trực quan sơ đồ kho giúp nhân viên vận hành kho tối ưu hóa lộ trình di chuyển, rút ngắn thời gian lấy hàng và nâng cao năng suất khai thác diện tích kho bãi.
2. **Kiểm soát chặt chẽ lô hàng (Product Batches):** Đối với các nhóm ngành hàng có hạn dùng cụ thể hoặc yêu cầu khắt khe về nguồn gốc như thực phẩm, dược phẩm, hóa chất và linh kiện điện tử, quản lý theo lô hàng là điều kiện bắt buộc. Hệ thống tự động giúp theo dõi chặt chẽ số hiệu lô, ngày sản xuất và hạn sử dụng của từng lô hàng cụ thể tại từng vị trí, từ đó hỗ trợ thu hồi hàng lỗi chính xác và giảm thiểu tổn thất do hàng hết hạn sử dụng.
3. **Giảm thiểu sai sót vận hành:** Loại bỏ các lỗi nhập liệu thủ công của con người (như nhầm mã hàng, sai lệch số lượng, cất hàng sai vị trí) bằng cách ứng dụng công nghệ quét mã định danh cầm tay và cơ sở dữ liệu đồng bộ thời gian thực.

[Hình 1.2: Biểu đồ tăng trưởng nhu cầu tự động hóa kho bãi tại Việt Nam]

### 1.1.3. Lịch sử phát triển và các xu hướng công nghệ trong quản lý kho
Trải qua nhiều giai đoạn phát triển, các hệ thống quản trị kho hiện đại ngày nay tích hợp nhiều thành tựu công nghệ cốt lõi:

- **Mã số mã vạch và QR Code:** Chuyển đổi dữ liệu vị trí và sản phẩm thành mã vạch hoặc mã QR có thể đọc nhanh bằng máy quét hoặc camera thiết bị di động, tăng tốc độ xử lý nghiệp vụ gấp nhiều lần.
- **Phân tích dữ liệu Star Schema:** Chuyển đổi dữ liệu giao dịch thô sang mô hình dữ liệu phân tích hình sao (Star Schema) với bảng Sự kiện (Fact) và các bảng Chiều (Dimensions). Mô hình này tối ưu hóa tốc độ truy vấn các báo cáo lớn và cho phép phân loại hàng tồn kho theo nhóm quan trọng ABC (đồ thị Pareto) phục vụ quyết định thu mua hàng.
- **Tồn kho Real-time với Redis:** Sử dụng bộ nhớ đệm Redis tốc độ cao để lưu trữ trạng thái tồn kho thực tế, hỗ trợ cập nhật số đếm tồn kho thời gian thực (Real-time Stock Counter) giúp tránh tình trạng bán vượt quá số lượng tồn thực tế (Overselling) trên các kênh bán hàng trực tuyến.
- **Chiến lược xuất kho thông minh (FEFO/FIFO):** Giải thuật tự động đề xuất vị trí lấy hàng ưu tiên lô hàng hạn dùng ngắn hơn xuất trước (First Expired, First Out - FEFO) hoặc lô nhập trước xuất trước (First In, First Out - FIFO), giúp giải phóng hàng tồn khoa học, hạn chế tối đa rủi ro tồn kho quá hạn.
- **Tính giá vốn trung bình có trọng số (Weighted Average Cost):** Tự động tính toán lại đơn giá bình quân của sản phẩm sau mỗi giao dịch nhập hàng mới, giúp cung cấp số liệu giá vốn hàng bán và biên lợi nhuận gộp chính xác cho bộ phận kế toán tài chính.

---

## 1.2. Giới thiệu các hệ thống WMS/SCM tương tự hiện nay và khoảng trống giải pháp cho doanh nghiệp vừa và nhỏ tại Việt Nam

Hiện nay, các giải pháp quản lý kho bãi phổ biến trên thị trường được chia thành hai nhóm chính:

1. **ERP SAP WMS:** Là hệ thống quản trị tổng thể hàng đầu thế giới, cung cấp các tính năng quản lý kho bãi toàn diện, tích hợp sâu sắc với phân hệ kế toán, nhân sự, sản xuất. SAP mang lại sự an toàn và khả năng xử lý dữ liệu khổng lồ cho các tập đoàn lớn. Tuy nhiên, rào cản tiếp cận của SAP là chi phí bản quyền và tư vấn triển khai cực kỳ đắt đỏ, quy trình vận hành phức tạp đòi hỏi đội ngũ chuyên trách kỹ thuật cao và thời gian triển khai kéo dài.
2. **Odoo WMS:** Hệ thống ERP mã nguồn mở linh hoạt, cho phép các doanh nghiệp vừa và nhỏ tiếp cận các tính năng quản trị kho hiện đại với chi phí rẻ hơn. Tuy nhiên, việc tùy biến Odoo để đáp ứng các quy trình nghiệp vụ đặc trưng tại Việt Nam vẫn đòi hỏi năng lực lập trình tùy biến cao từ phía đối tác triển khai, đồng thời hệ thống này thường gặp vấn đề suy giảm hiệu năng khi cơ sở dữ liệu giao dịch tăng trưởng quá nhanh.

**Khoảng trống giải pháp cho doanh nghiệp vừa và nhỏ (SMEs) tại Việt Nam:**
Các doanh nghiệp SMEs tại Việt Nam chiếm số lượng áp đảo nhưng thường có nguồn lực tài chính hạn chế, quy trình vận hành kho mang tính linh hoạt cao và thiếu đội ngũ chuyên gia IT để bảo trì hệ thống phức tạp. Họ cần một giải pháp:
- Có giao diện trực quan tiếng Việt, dễ sử dụng cho công nhân kho bình thường.
- Tích hợp quét mã QR Code trực tiếp qua camera của các thiết bị di động cá nhân phổ thông thay vì đầu tư hệ thống máy quét công nghiệp đắt đỏ.
- Khả năng xử lý giao dịch đồng thời an toàn, ngăn chặn lỗi xuất âm kho nhưng vẫn đảm bảo tốc độ phản hồi nhanh.
- Chi phí đầu tư hạ tầng và vận hành tối thiểu.

Đề tài "Xây dựng Hệ thống Quản lý Chuỗi cung ứng và Tồn kho (SCIM)" ra đời nhằm lấp đầy khoảng trống này bằng cách cung cấp một ứng dụng chuyên biệt, gọn nhẹ, có tính thực tiễn cao, hiệu năng truy vấn lớn và đáp ứng hoàn hảo các đặc thù vận hành của SMEs Việt Nam.

---

## 1.3. Tổng quan về các bài toán Kỹ thuật & Bảo mật trong hệ thống SCIM

Để đảm bảo hệ thống vận hành an toàn và đáng tin cậy trong môi trường doanh nghiệp thực tế, hệ thống SCIM tập trung giải quyết bốn bài toán kỹ thuật nền tảng:

1. **Phân quyền vai trò động (Role-Based Access Control - RBAC):** Giới hạn phạm vi thao tác của từng tài khoản nhân viên (Admin, Manager, Staff, Viewer). Phân quyền được kiểm soát chặt chẽ ở cả mức API endpoints phía Backend và ẩn/hiện các thành phần giao diện Frontend tương ứng dựa trên cấu trúc quyền hạn được gán.
2. **Kiểm soát giao dịch đồng thời chống lỗi xuất âm kho:** Khi nhiều nhân viên kho cùng thao tác xuất hàng cho một mã hàng tại một vị trí cùng một thời điểm, hệ thống kết hợp cơ chế Khóa lạc quan (Optimistic Locking) dựa trên phiên bản dữ liệu thực thể và Khóa phân tán (Redis Lock) sử dụng Redis nhằm khóa tạm thời tài nguyên, đảm bảo các giao dịch được xử lý tuần tự và không xảy ra hiện tượng xuất âm kho.
3. **Lưu vết và Nhật ký kiểm toán (Audit Trail & Activity Log):** Tự động ghi chép chi tiết mọi hành vi thêm, sửa, xóa dữ liệu của người dùng, lưu giữ vết so sánh các trường dữ liệu bị thay đổi (giá trị cũ và mới dạng JSON) để làm căn cứ quy trách nhiệm và kiểm toán nội bộ khi xảy ra sai lệch hàng hóa.
4. **Phân tích dữ liệu lớn bằng mô hình Star Schema:** Tách biệt cơ sở dữ liệu giao dịch nghiệp vụ hàng ngày và cơ sở dữ liệu phân tích báo cáo. Mô hình Star Schema với bảng Fact và các bảng Dimension giúp tối ưu hiệu năng truy vấn báo cáo của Dashboard phân tích, tránh gây nghẽn hệ thống khi lượng dữ liệu tích lũy lớn.

---

## 1.4. Kết luận Chương 1

Chương 1 đã phân tích rõ ràng khái niệm, bối cảnh thực tế và tầm quan trọng của quản lý chuỗi cung ứng và quản lý tồn kho đối với doanh nghiệp hiện đại. Việc áp dụng tự động hóa kho bãi là xu hướng tất yếu giúp doanh nghiệp nâng cao hiệu suất vận hành và giảm thiểu sai sót. Đồng thời, chương này cũng chỉ ra khoảng trống giải pháp của các phần mềm lớn đối với doanh nghiệp vừa và nhỏ tại Việt Nam, từ đó khẳng định tính thực tiễn của đề tài xây dựng hệ thống SCIM. Các bài toán kỹ thuật trọng tâm về phân quyền RBAC, kiểm soát đồng thời chống xuất âm kho và phân tích dữ liệu Star Schema sẽ được phân tích và thiết kế chi tiết trong Chương 2.
