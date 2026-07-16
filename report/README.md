# Báo Cáo Dự Án Supply Chain & Inventory Management (SCIM)

Tài liệu này là mục lục chính và hướng dẫn tổng hợp/xuất bản báo cáo của dự án **SCIM**. Báo cáo được thiết kế dưới dạng mô-đun chia nhỏ thành các chương để tối ưu hóa việc quản lý và tránh các giới hạn dung lượng xử lý.

---

## 📂 Cấu trúc Báo cáo

Báo cáo được lưu trữ trong thư mục này với các tệp tin tương ứng như sau:

| Tệp tin | Chương | Nội dung chính |
| :--- | :--- | :--- |
| [chapter1.md](file:///c:/Users/maidu/OneDrive/Desktop/SupplyChain_Inventory/report/chapter1.md) | **Chương 1** | Tổng quan về đề tài: Lý do chọn đề tài, mục tiêu, đối tượng, phạm vi và phương pháp nghiên cứu. |
| [chapter2_part1_requirements.md](file:///c:/Users/maidu/OneDrive/Desktop/SupplyChain_Inventory/report/chapter2_part1_requirements.md) | **Chương 2 (P1)** | Phân tích yêu cầu: Actors, Phân rã chức năng, Sơ đồ Use Case và 3 Kịch bản Use Case chi tiết. Yêu cầu phi chức năng. |
| [chapter2_part2_design.md](file:///c:/Users/maidu/OneDrive/Desktop/SupplyChain_Inventory/report/chapter2_part2_design.md) | **Chương 2 (P2)** | Thiết kế hệ thống: Kiến trúc hệ thống, Sơ đồ lớp thực thể (Class Diagram), 4 Biểu đồ tuần tự (Sequence Diagram), Sơ đồ ERD và Từ điển dữ liệu. |
| [chapter3_part1_tech.md](file:///c:/Users/maidu/OneDrive/Desktop/SupplyChain_Inventory/report/chapter3_part1_tech.md) | **Chương 3 (P1)** | Công nghệ phát triển: Java 21/Spring Boot, React/TypeScript, PostgreSQL, Redis và Kiến trúc cấu trúc thư mục thực tế. |
| [chapter3_part2_modules.md](file:///c:/Users/maidu/OneDrive/Desktop/SupplyChain_Inventory/report/chapter3_part2_modules.md) | **Chương 3 (P2)** | Hiện thực hóa Module & Giao diện: Chi tiết thuật toán (Giá vốn trung bình, Gợi ý FEFO, Khóa đồng thời) và các layout màn hình kèm mô tả. |
| [chapter3_part3_testing.md](file:///c:/Users/maidu/OneDrive/Desktop/SupplyChain_Inventory/report/chapter3_part3_testing.md) | **Chương 3 (P3)** | Thử nghiệm, Đánh giá & Kết luận: Kịch bản kiểm thử UAT, kết quả đạt được, hạn chế, hướng phát triển và kết luận chung. |

---

## 🛠️ Hướng dẫn Biên soạn & Xuất bản (Export)

Tất cả các biểu đồ trong báo cáo này đều được vẽ bằng **Mermaid.js** ngay bên trong Markdown. Để xem biểu đồ hiển thị trực quan hoặc xuất bản tài liệu ra định dạng khác, bạn có thể thực hiện theo các phương pháp dưới đây:

### 1. Xem trực quan (Live Preview) trong VS Code
- Hãy cài đặt extension **Markdown Preview Enhanced** hoặc **Markdown Preview Mermaid Support** trên VS Code.
- Nhấn tổ hợp phím `Ctrl + Shift + V` (hoặc `Cmd + Shift + V` trên macOS) khi đang mở bất kỳ tệp Markdown nào để xem tài liệu hiển thị cùng biểu đồ đầy đủ.

### 2. Xuất bản ra PDF (Khuyên dùng)
- **Cách 1: Dùng VS Code Extension (Dễ nhất)**
  1. Cài đặt extension **Markdown PDF** hoặc **Markdown Preview Enhanced**.
  2. Mở tệp tin cần xuất bản.
  3. Click chuột phải chọn `Markdown PDF: Export (pdf)` hoặc chọn `Chrome (Puppeteer) -> PDF` trong Markdown Preview Enhanced.
- **Cách 2: Gộp tất cả các chương thành một file lớn trước khi xuất**
  Bạn có thể chạy lệnh PowerShell sau trong thư mục `report/` để gộp toàn bộ báo cáo lại thành một tệp duy nhất tên là `Full_Report.md`:
  ```powershell
  Get-Content chapter1.md, chapter2_part1_requirements.md, chapter2_part2_design.md, chapter3_part1_tech.md, chapter3_part2_modules.md, chapter3_part3_testing.md | Out-File -FilePath Full_Report.md -Encoding utf8
  ```
  Sau đó, xuất file `Full_Report.md` này sang PDF.

### 3. Chuyển đổi sang Microsoft Word (.docx)
Bạn có thể sử dụng công cụ mã nguồn mở **Pandoc** để chuyển đổi file Markdown sang Word:
```bash
pandoc -s Full_Report.md -o Full_Report.docx --toc
```
*(Lưu ý: Đối với biểu đồ Mermaid, bạn cần cài đặt thêm filter `mermaid-filter` hoặc export sơ đồ Mermaid thành ảnh `.png` trước rồi chèn vào Word).*
