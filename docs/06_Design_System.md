# Tài liệu 06: Design System & Quy chuẩn Giao diện (UI/UX)

Tài liệu này định nghĩa hệ thống thiết kế (Design System), bao gồm mã màu chủ đạo, phông chữ, khoảng cách, quy chuẩn component UI và các thư viện giao diện được sử dụng trong dự án TravelLako cho cả Web và Mobile.

---

## 1. Hệ Màu Chủ Đạo (Color Palette)

Hệ màu của TravelLako được thiết kế nhằm mang lại cảm giác tươi mát của thiên nhiên, sự năng động của các chuyến đi và trải nghiệm hiện đại, cao cấp.

### A. Màu Chính (Primary Colors)
Dành cho các thành phần quan trọng như Button chính, Header, Active state, và Brand Identity:
*   **Ocean Blue (Xanh đại dương - Biển & Bầu trời tự do):** `#2563EB` (Tailwind `blue-600`)
    *   *Light variant:* `#60A5FA` (Tailwind `blue-400`)
    *   *Dark variant:* `#1D4ED8` (Tailwind `blue-700`) hoặc `#1E3A8A` (Tailwind `blue-900`)
*   **Sunset Orange (Cam hoàng hôn - Năng động & Trải nghiệm):** `#F97316` (Tailwind `orange-500`)
    *   *Light variant:* `#FB923C` (Tailwind `orange-400`)
    *   *Dark variant:* `#C2410C` (Tailwind `orange-700`)

### B. Màu Phụ & Trung Tính (Secondary & Neutral Colors)
Dành cho nền ứng dụng, viền, bóng và các đoạn văn bản:
*   **Slate Dark (Chữ chính):** `#0F172A` (Tailwind `slate-900`)
*   **Slate Muted (Chữ phụ):** `#64748B` (Tailwind `slate-500`)
*   **Gray Background (Nền app):** `#F8FAFC` (Tailwind `slate-50`)
*   **Border Gray (Đường viền):** `#E2E8F0` (Tailwind `slate-200`)

### C. Màu Trạng Thái (Semantic Colors)
*   **Success (Thành công/Check-in):** `#10B981` (Tailwind `emerald-500`)
*   **Error (Thất bại/Lỗi):** `#EF4444` (Tailwind `red-500`)
*   **Warning (Cảnh báo):** `#F59E0B` (Tailwind `amber-500`)
*   **Info (Thông tin):** `#3B82F6` (Tailwind `blue-500`)

### D. Nguyên tắc Áp dụng Màu sắc (Color Usage Principles)
Để đảm bảo giao diện đồng nhất, sạch sẽ và cao cấp, đội ngũ phát triển cần tuân thủ nghiêm ngặt các nguyên tắc áp dụng màu sắc sau:
*   **Primary Blue (`#2563EB`):** Chỉ dành cho các tương tác và hành động chính (các nút CTA chính, liên kết điều hướng, trạng thái active).
*   **Secondary Orange (`#F97316`):** Chỉ đóng vai trò là màu nhấn (Accent Color) tại một số điểm nhỏ. Dùng làm điểm nhấn cho rating, badge, icon nổi bật hoặc nút CTA phụ. Tuyệt đối **không lạm dụng** màu cam trên các vùng diện tích lớn để tránh gây rối mắt.
*   **Nền ứng dụng (Background):** Luôn sử dụng màu xám nhẹ `#F8FAFC` để mang lại sự dịu mắt và thoải mái khi tương tác lâu dài.
*   **Thẻ thông tin (Cards):** Luôn sử dụng nền màu trắng tinh (`#FFFFFF`) đặt trên nền background xám để tạo chiều sâu và phân tách khối thị giác rõ ràng.
*   **Màu văn bản (Typography Color):**
    *   *Chữ chính (Tiêu đề, nội dung chính):* Luôn dùng màu Slate đậm `#0F172A`.
    *   *Chữ phụ (Mô tả phụ, nhãn phụ, thông tin thời gian):* Luôn dùng màu xám Slate `#64748B`.
*   **Triết lý giao diện (Visual Philosophy):** Giữ giao diện sáng sủa (Clean & Light mode), tận dụng tối đa các khoảng trắng (White space) hợp lý để nội dung được phân tách tự nhiên, hạn chế tối đa việc sử dụng quá nhiều màu sắc phức tạp.

---

## 2. Phông Chữ & Định Dạng (Typography)

*   **Font Family chính:**
    *   **Web:** `Outfit`, `Inter`, sans-serif (Ưu tiên import từ Google Fonts).
    *   **Mobile:** Hệ thống Sans-Serif mặc định của hệ điều hành (San Francisco trên iOS, Roboto trên Android).
*   **Cỡ chữ tiêu chuẩn (Font Sizes):**
    *   `text-xs` (12px): Dành cho chú thích, nhãn phụ, ngày tháng.
    *   `text-sm` (14px): Dữ liệu bảng, mô tả phụ, text phụ.
    *   `text-base` (16px): Cỡ chữ mặc định cho body text, bài viết, input form.
    *   `text-lg` (18px): Tên địa điểm nhỏ, sub-header.
    *   `text-xl` (20px): Tiêu đề card, tiêu đề bài viết.
    *   `text-2xl` đến `text-4xl` (24px - 36px): Tiêu đề trang chính, tiêu đề lớn chào mừng.

---

## 3. Khoảng Cách & Bo Góc (Spacing & Border Radius)

*   **Spacing Scale (padding/margin):** Sử dụng hệ số 4px của Tailwind:
    *   `4px` (Tailwind `1`), `8px` (Tailwind `2`), `12px` (Tailwind `3`), `16px` (Tailwind `4` - Tiêu chuẩn cho khoảng cách giữa các khối), `24px` (Tailwind `6`), `32px` (Tailwind `8`).
*   **Bo góc (Border Radius):**
    *   Button & Input: `rounded-lg` (8px).
    *   Cards & Modals: `rounded-xl` (12px) hoặc `rounded-2xl` (16px).
    *   Avatar & Icons: `rounded-full` (9999px).

---

## 4. Công Nghệ & Thư Viện Thiết Kế Giao Diện

Để hiện thực hóa hệ thống thiết kế trên, các thư viện UI/UX sau được chỉ định sử dụng:

### A. Dành cho Web Frontend (React + Vite)
*   **`tailwindcss` & `postcss` & `autoprefixer`**: Hỗ trợ viết CSS trực tiếp qua Class (Utility-First), tối ưu hóa thiết kế responsive cho mọi màn hình (mobile, tablet, desktop).
*   **`shadcn/ui`**: Bộ thư viện component không chứa sẵn style cố định (headless UI), được xây dựng trên nền Radix UI và Tailwind CSS. Dùng để triển khai các component phức tạp như: Modal (Dialog), Date Range Picker, Select, Carousel, Popover.
*   **`lucide-react`**: Bộ thư viện Icon vector dạng SVG tối giản, nhẹ và sắc nét.
*   **`framer-motion`**: Tạo hoạt ảnh mượt mà khi chuyển trang, hover các card địa điểm, hoặc mở rộng timeline lịch trình.
*   **`sonner`**: Hiển thị popup thông báo (Toast notifications) như thông báo lỗi, lưu thành công, cảnh báo.

### B. Dành cho Mobile App (React Native / Expo)
*   **`nativewind`**: Cho phép viết Tailwind CSS trực tiếp trên các component React Native (`View`, `Text`, `TouchableOpacity`) giúp đồng bộ tư duy thiết kế giống như phiên bản Web.
*   **`react-native-paper`**: Bộ component UI chuẩn Material Design dành cho di động, cung cấp các element native tối ưu hiệu năng như Appbar, Button, Card, Dialog.
*   **`@expo/vector-icons`**: Tích hợp sẵn hàng ngàn icon từ Ionicons, FontAwesome, MaterialIcons để sử dụng trực tiếp trên di động.

---

## 5. Quy Chuẩn Thành Phần Giao Diện (Component Specifications)

### A. Button (Nút bấm)
*   **Primary Button:** Background Ocean Blue (`#2563EB`), chữ trắng, bo góc 8px. Hiệu ứng hover (Web): chuyển sang màu xanh đậm hơn (`#1D4ED8`).
*   **Secondary Button:** Background Sunset Orange (`#F97316`), chữ trắng. Sử dụng cho các hành động khuyến khích chuyển đổi (như "Đặt tour ngay", "Xem lộ trình đề xuất").
*   **Outline Button:** Viền xám nhạt (`#E2E8F0`), nền trong suốt, chữ đen Slate. Sử dụng cho các hành động phụ (như "Hủy", "Quay lại").

### B. Cards (Thẻ thông tin)
Mọi card thông tin địa điểm (Tour Card, Hotel Card) phải tuân thủ:
*   Bo góc: `rounded-xl` (12px).
*   Bóng mờ (Shadow): Subtle shadow (`shadow-sm` hoặc `shadow-md` khi hover).
*   Ảnh: Tỷ lệ `aspect-[4/3]` hoặc `aspect-video`, bo góc trên.
*   Thông tin: Tên địa điểm (bold, Slate-900), Điểm rating (chữ Sunset Orange kèm icon sao), Giá tiền (Ocean Blue, bold).
