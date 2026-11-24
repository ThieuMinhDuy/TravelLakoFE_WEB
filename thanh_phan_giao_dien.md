# Đặc tả Thành phần Giao diện & Ánh xạ Thiết kế (Figma UI Mapping)

> **Nguyên tắc định hướng (Hướng 2 - Nghiệp vụ TripMate làm chuẩn, Figma làm UI Kit):**
> * **Nghiệp vụ cốt lõi:** Giữ nguyên 100% định hướng TripMate – Nền tảng lập kế hoạch du lịch thông minh bằng AI cho thị trường Việt Nam (63 tỉnh thành, AI Itinerary, kéo thả Timeline, bản đồ tương tác Leaflet, nhật ký hành trình).
> * **Vai trò của File Figma:** File Figma (`FREE e-commerce website for travel agency`) đóng vai trò là **UI/UX Reference & Component Kit** (Cung cấp quy chuẩn Typography Open Sans, cấu trúc Hero Banner, Search Widget, Card gói tour/địa điểm, Form Auth chia đôi màn hình, DatePicker và Footer).
> * **Các màn hình đặc thù của TripMate chưa có trên Figma:** Tự phát triển mới dựa trên cùng hệ thống Design System (cùng font, cỡ chữ, bo góc, padding và elevation) được chuẩn hóa từ Figma.

---

## Bảng ánh xạ tổng quan màn hình & Node Figma

| Màn hình TripMate | Node Figma tham khảo | Mức độ kế thừa | Thành phần tái sử dụng từ Figma | Thành phần đặc thù TripMate cần tự dựng |
| :--- | :--- | :---: | :--- | :--- |
| **Màn 1: Home & Explore** | `201:254` (Home Page) | **85%** | Header, Hero banner, Search Widget frame, Tour Card, Testimonials, Footer | Bộ chọn 63 tỉnh thành, Lưới 3 lịch trình AI mẫu, Bong bóng AI nổi |
| **Màn 2: Place Directory** | `201:3669` (Search Result) | **80%** | Filter Bar layout, Lưới Card địa điểm, Pagination | Bộ lọc 4 danh mục (Khách sạn/Vui chơi/Ăn uống/Cafe), Lọc giá VNĐ |
| **Màn 3: Place Details** | `201:11748` (Tour Detail) | **75%** | Gallery ảnh lớn + lưới nhỏ, Review section, Sticky action card | Bản đồ vị trí Leaflet, Nút "Thêm vào lịch trình", Nút Yêu thích |
| **Màn 4: Web Auth** | `201:28829` (Sign Up)<br>`201:28949` (Login) | **90%** | Split-screen layout (banner trái + form phải), Input fields, Typography | Nút Google Login, Form nhập 6 số OTP kích hoạt tài khoản |
| **Màn 5: My Trips** | Kế thừa Design System | **Mới (30%)** | Card elevation, Tag trạng thái, Typography Open Sans | Tab Sắp đi/Đang đi/Lịch sử, Thanh tiến trình lịch trình |
| **Màn 6: Trip Planner** | Kế thừa Design System | **Mới (20%)** | Button styles, Modal layout, Typography | Giao diện kéo thả Timeline hàng ngày (DnD), Bản đồ Polyline di chuyển |
| **Màn 7: Trip Diary** | Kế thừa Design System | **Mới (30%)** | Form input, Typography | Editor viết nhật ký, Drag & Drop upload tối đa 10 ảnh |
| **Màn 8: User Profile** | `201:22468` (Account) | **70%** | Avatar upload, Form thông tin cá nhân | Lưới tag chọn Sở thích du lịch Việt Nam, Phân khúc ngân sách |
| **Màn 9: Admin Portal** | Kế thừa Design System | **Mới (10%)** | Typography Open Sans, màu Ocean Azure, Input / Button / Badge | Giao diện Liquid Glass (sidebar & header nổi), bảng dữ liệu, form trong Drawer, bản đồ chọn tọa độ, upload nhiều ảnh kéo thả, biểu đồ theo tháng |

---

## Chi tiết từng màn hình

### Màn 1: Trang chủ & Khám phá (Home & Explore Page)
* **Mục đích:** Trang chính giới thiệu dịch vụ, tạo cảm hứng du lịch Việt Nam và dẫn dắt người dùng bắt đầu lập lịch trình.
* **Ánh xạ từ Figma (`201:254` - Home Page):**
  * Tái sử dụng trực tiếp layout Header (`201:256`), Hero banner (`201:255`), Search widget (`201:1663`), Tour cards (`201:1748`), Testimonials slider (`201:2092`) và Footer (`201:2104`).
* **Các thành phần giao diện:**
  1. **Thanh điều hướng cố định (Sticky Header):** Kế thừa từ node Figma `201:256` (Logo TripMate bên trái; Menu giữa: Khám phá điểm đến, Chuyến đi của tôi, Cẩm nang du lịch; Avatar người dùng kèm dropdown bên phải).
  2. **Banner trình chiếu chính (Hero Carousel Banner):** Kế thừa hero banner `201:255`, kết hợp slogan font script nghệ thuật `Podcast`/`Caveat` (`201:1661`) hiển thị slide danh lam thắng cảnh Việt Nam.
  3. **Thanh tìm kiếm thông minh (Overlay Search Bar):** Dựa trên layout khung search Figma `201:1663`, tùy biến các ô input: Ô chọn tỉnh thành (trong 63 tỉnh thành Việt Nam), ô chọn ngày dự kiến và nút "Tìm kiếm".
  4. **Lưới Điểm đến Phổ biến (Top Destinations Grid):** Hệ thống thẻ tỉnh thành lớn (Hà Nội, TP.HCM, Đà Nẵng, Hội An, Nha Trang, Đà Lạt) kế thừa phong cách bo góc và đổ bóng của Figma card.
  5. **Gợi ý Lịch trình AI Tiêu biểu (Trending AI Itineraries):** 3 thẻ lịch trình mẫu tại Việt Nam kế thừa cấu trúc card Figma `201:1748` kèm tổng chi phí (VNĐ), số điểm đi và nút "Sử dụng lịch trình này".
  6. **Cẩm nang Du lịch & Trải nghiệm (Travel Blog Grid):** Các thẻ bài viết chia sẻ kinh nghiệm khám phá ẩm thực và danh thắng Việt Nam.
  7. **Đánh giá & Phản hồi (User Testimonials):** Kế thừa chính xác block review `Group 4` (`201:2092`) trong Figma.
  8. **Chân trang thông tin (Footer):** Kế thừa layout 4 cột của footer Figma `201:2104`.
  9. **Bong bóng Trợ lý ảo AI nổi (Floating AI Bubble - Thành phần mới):** Nút tròn cố định góc dưới bên phải (`bottom-6 right-6`), mở panel chat AI trượt từ phải sang.
* **Bố trí layout:**
  * Trang cuộn dọc kéo dài (Long scroll page) chia làm nhiều phân đoạn dọc từ trên xuống dưới.
  * Floating AI Bubble: Cố định ở góc dưới bên phải màn hình (Bottom-Right Floating), đè lên nội dung khi cuộn.

---

### Màn 2: Tìm kiếm & Lọc địa điểm (Place Directory Page)
* **Mục đích:** Tìm kiếm, phân loại và hiển thị các địa điểm du lịch Việt Nam theo bộ lọc.
* **Ánh xạ từ Figma (`201:3669` - Search Result):**
  * Tái sử dụng bố cục thanh lọc đầu trang (Filter Bar) và lưới kết quả (Results Grid) 4 cột.
* **Các thành phần giao diện:**
  1. **Thanh lọc đa năng (Filter Bar):** Ô chọn tỉnh thành, tab loại hình (Khách sạn, Vui chơi, Nhà hàng, Cafe). Từng tab chứa bộ lọc khoảng giá tiền (VNĐ) và xếp hạng sao.
  2. **Lưới danh sách địa điểm (Results Grid):** Các thẻ địa điểm kế thừa component card `tour packages` (`201:3541`) trong Figma: Slider ảnh, tên địa điểm, rating sao, địa chỉ, mức giá tham khảo (VNĐ).
  3. **Phần chuyển trang (Pagination):** Chuẩn style nút bo góc của Figma.
  4. **Bong bóng Trợ lý ảo AI nổi (Floating AI Bubble).**
* **Bố trí layout:**
  * Filter Bar nằm ngang trên cùng. Results Grid chia dạng lưới 4 cột trải rộng bên dưới.

---

### Màn 3: Chi tiết địa điểm (Place Details Page)
* **Mục đích:** Cung cấp thông tin chi tiết, thư viện ảnh và đánh giá của một địa điểm cụ thể.
* **Ánh xạ từ Figma (`201:11748` - Tour Detail):**
  * Tái sử dụng cấu trúc: Thư viện ảnh ở trên, phân đôi cột nội dung ở dưới (cột chính thông tin, cột bên phải là Sticky Action Card).
* **Các thành phần giao diện:**
  1. **Bộ sưu tập ảnh chi tiết (Rich Photo Gallery):** 1 ảnh lớn đại diện bên trái, 4 ảnh nhỏ xếp lưới bên phải kèm nút "Xem tất cả ảnh".
  2. **Thông tin chi tiết (Info Section):** Tên địa điểm, điểm rating, mô tả chi tiết, địa chỉ, mức giá (VNĐ).
  3. **Bản đồ vị trí (Map Card - Leaflet):** Bản đồ hiển thị marker vị trí địa điểm tại Việt Nam.
  4. **Khu vực Đánh giá (Review Section):** Form đánh giá sao + bình luận và danh sách reviews (kế thừa typography và avatar style từ Figma).
  5. **Thẻ hành động nhanh (Sticky Action Card):** Nút "Thêm vào lịch trình", nút "Lưu yêu thích".
  6. **Bong bóng Trợ lý ảo AI nổi (Floating AI Bubble).**
* **Bố trí layout:**
  * Gallery ảnh lớn phía trên. Dưới chia làm 2 cột: Cột trái (70%) chứa thông tin & review; Cột phải (30%) chứa Bản đồ vị trí và Sticky Action Card cố định khi cuộn.

---

### Màn 4: Đăng ký / Đăng nhập / Xác thực OTP (Web Auth Page)
* **Mục đích:** Đăng nhập hệ thống, đăng ký tài khoản mới và xác thực OTP qua email.
* **Ánh xạ từ Figma (`201:28829` Sign Up & `201:28949` Login):**
  * Tái sử dụng **100% bố cục Split-Screen** của Figma: Nửa màn hình bên trái là ảnh phong cảnh kèm slogan nghệ thuật `Podcast`/`Caveat`, nửa bên phải là form đăng nhập/đăng ký.
* **Các thành phần giao diện:**
  1. **Nút Đăng nhập nhanh bằng Google (Google Login Button):** Nút lớn có logo Google và chữ "Tiếp tục với Google".
  2. **Đường kẻ phân cách:** "Hoặc sử dụng Email".
  3. **Form nhập thông tin:** Email, Mật khẩu, Họ tên (khi đăng ký) - kế thừa style input `rounded-xl` từ Figma.
  4. **Form xác thực OTP:** 6 ô số nhập mã xác thực OTP gửi qua email. *(Lưu ý: Màn hình Auth không hiển thị Bong bóng AI nổi).*
* **Bố trí layout:**
  * Layout chia đôi màn hình (Split Screen): Một bên là ảnh banner phong cảnh Việt Nam tràn viền, một bên là hộp chứa form căn giữa.

---

### Màn 5: Quản lý chuyến đi của tôi (My Trips Dashboard)
* **Mục đích:** Quản lý danh sách các hành trình du lịch cá nhân của người dùng.
* **Quy chuẩn thiết kế kế thừa từ Figma:** Sử dụng card layout với bo góc `rounded-2xl`, tag trạng thái màu Accent, typography `Open Sans`.
* **Các thành phần giao diện:**
  1. **Thanh công cụ đầu trang:** Tiêu đề trang, nút "Tạo chuyến đi mới" (Button CTA style Figma).
  2. **Nhóm Tab phân loại:** Sắp đi, Đang đi, Lịch sử (Tab style kế thừa từ Search widget Figma).
  3. **Danh sách thẻ chuyến đi (Trip Cards):** Ảnh bìa tỉnh thành, tên chuyến đi, khoảng thời gian, tổng ngân sách, thanh tiến trình, nút "Xem chi tiết" và "Xóa".
  4. **Bong bóng Trợ lý ảo AI nổi (Floating AI Bubble).**
* **Bố trí layout:**
  * Danh sách thẻ chuyến đi xếp dạng lưới 3 cột tùy chỉnh.

---

### Màn 6: Lập kế hoạch lịch trình chuyến đi (Interactive Trip Planner)
* **Mục đích:** Màn hình tương tác cao nhất - tổ chức địa điểm theo từng ngày và xem lộ trình trên bản đồ.
* **Quy chuẩn thiết kế kế thừa từ Figma:** Hệ màu nền nhã nhặn `#FAFAFA`, thẻ địa điểm màu `#FFFFFF` viền `#E2E8F0`, typography `Open Sans`.
* **Các thành phần giao diện:**
  1. **Thanh tác vụ đầu trang:** Tên chuyến đi, số ngày, nút "Tối ưu hóa bằng AI" (icon AI sáng nổi bật), nút "Xuất file PDF/Excel".
  2. **Bảng điều khiển lịch trình hàng ngày (Day-by-Day DnD Columns):** Chia theo Day 1, Day 2, Day 3... Mỗi item địa điểm hỗ trợ kéo thả (Drag Handle) đổi thứ tự.
  3. **Bản đồ lộ trình tương tác (Interactive Route Map - Leaflet):** Vẽ đường nối Polyline giữa các địa điểm theo thứ tự trong ngày.
  4. **Bong bóng Trợ lý ảo AI nổi (Floating AI Bubble):** Cố định góc dưới để mở nhanh trợ lý AI hỗ trợ gợi ý địa điểm.
* **Bố trí layout:**
  * Layout chia đôi màn hình (Split screen): Cột bên trái (60%) chứa danh sách lịch trình; Cột bên phải (40%) hiển thị Bản đồ lộ trình cố định.

---

### Màn 7: Nhật ký hành trình (Trip Diary & Gallery Page)
* **Mục đích:** Lưu giữ kỷ niệm chuyến đi sau khi hoàn thành.
* **Quy chuẩn thiết kế kế thừa từ Figma:** Font `Open Sans`, form input và gallery grid kế thừa từ các pattern của Figma.
* **Các thành phần giao diện:**
  1. **Khu vực soạn thảo (Text Editor):** Ô nhập văn bản lớn viết cảm nghĩ chuyến đi.
  2. **Khu vực tải ảnh (Drag & Drop Uploader):** Vùng nét đứt kéo thả tối đa 10 ảnh lưu niệm lên Cloudinary.
  3. **Lưới ảnh kỷ niệm (Masonry Photo Grid):** Hiển thị ảnh chuyến đi dạng lưới thẩm mỹ.
  4. **Bong bóng Trợ lý ảo AI nổi (Floating AI Bubble).**
* **Bố trí layout:**
  * Chia làm 2 cột: Bên trái là khu vực soạn thảo và uploader; Bên phải hiển thị lưới ảnh kỷ niệm.

---

### Màn 8: Hồ sơ cá nhân & Thiết lập sở thích (User Profile & Settings)
* **Mục đích:** Quản lý thông tin tài khoản và cá nhân hóa trải nghiệm AI.
* **Ánh xạ từ Figma (`201:22468` & `201:25641` - Account):**
  * Tái sử dụng bố cục form cập nhật tài khoản, avatar upload.
* **Các thành phần giao diện:**
  1. **Thông tin cơ bản:** Avatar tròn (kèm nút đổi ảnh), Họ tên, Email, Số điện thoại, Ngày sinh, Giới tính.
  2. **Thiết lập cá nhân hóa:** Lưới tag chọn Sở thích du lịch Việt Nam (Tây Bắc, Miền Tây, Biển đảo Phú Quốc...), phân khúc ngân sách.
  3. **Bong bóng Trợ lý ảo AI nổi (Floating AI Bubble).**
* **Bố trí layout:**
  * Form thông tin xếp dọc ở cột trái; Thiết lập sở thích và ngân sách xếp ở cột phải.

---

### Màn 9: Phân hệ quản trị (Admin Portal)
* **Mục đích:** Quản trị viên quản lý người dùng, thành phố, địa điểm, kiểm duyệt đánh giá và import dữ liệu từ OpenStreetMap.
* **Phong cách:** Liquid Glass — bề mặt kính mờ kiểu iOS trên nền xám xanh trung tính, một màu nhấn Ocean Azure (chi tiết: tài liệu 06 mục 6). Chỉ áp dụng trong `/admin`.
* **Khung chung (`AdminLayout`):**
  1. **Sidebar kính nổi** (cách mép 12px, bo 28px): menu chia nhóm Tổng quan / Quản lý / Công cụ; "giọt kính" trượt theo mục đang chọn; thu gọn còn icon; dưới 1024px chuyển thành Drawer.
  2. **Header kính nổi:** nút menu, breadcrumb tự động theo route, nút về trang chủ, thông tin admin, đăng xuất.
* **Các trang:**
  1. **Bảng điều khiển:** 4 thẻ số liệu (kèm số mới trong tháng), 2 biểu đồ cột người dùng mới / đánh giá mới theo tháng (6 hoặc 12 tháng), thanh ngang xếp hạng (địa điểm theo loại, top thành phố, phân bố số sao), 5 đánh giá mới nhất, lối tắt.
  2. **Người dùng:** thanh chọn nhóm (Tất cả / Quản trị viên / Khách hàng / Đã khóa / Chưa xác thực) kèm số đếm, tìm kiếm không dấu, bảng có nút khóa / cấp quyền / xóa; Drawer chi tiết + sửa tên, email; xóa phải gõ email xác nhận.
  3. **Thành phố:** lưới thẻ ảnh banner + tấm kính thông tin; Drawer thêm / sửa có bản đồ chọn tọa độ; xóa 2 bước khi thành phố còn địa điểm.
  4. **Địa điểm:** thanh chọn 4 loại, lọc thành phố, bảng có cột riêng theo loại; Drawer form theo loại, upload nhiều ảnh kéo thả sắp xếp, ô tiền định dạng VNĐ, bản đồ + nút "Lấy tọa độ thành phố".
  5. **Kiểm duyệt đánh giá:** thẻ đánh giá (người viết, số sao, nội dung, địa điểm), lọc theo loại / thành phố / số sao / địa điểm, chọn nhiều để xóa.
  6. **Import OSM:** chọn thành phố (2 nhóm: đã có / thêm mới), thanh trượt số lượng mỗi loại, tiến trình 3 bước, thẻ kết quả theo loại, cảnh báo dữ liệu ngẫu nhiên.
* **Bố trí layout:**
  * Desktop: sidebar trái cố định, nội dung tối đa 88rem; form thêm / sửa luôn mở trong Drawer bên phải.
  * Mobile: sidebar thành Drawer, bộ lọc xếp dọc (hai ô chọn ngắn nằm cùng hàng), bảng cuộn ngang trong khung.
