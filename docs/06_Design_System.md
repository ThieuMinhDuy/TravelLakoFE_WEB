# Tài liệu 06: Design System & Quy chuẩn Giao diện (Modern Natural Travel)

Tài liệu này định nghĩa hệ thống thiết kế (Design System) của TravelLako dựa trên phong cách chủ đạo **"Modern Natural Travel"** — kết hợp sự tối giản tinh tế của **Apple**, tính chân thực du lịch của **Airbnb**, khoảng trắng thư thái của **Notion** và thông tin trực quan từ **Google Travel**.

> 💡 **Vai trò của File Thiết kế Figma (UI Kit Reference):**
> Dự án sử dụng file Figma [*FREE e-commerce website for travel agency*](https://www.figma.com/design/GhFdyDI68jSRbEp94NgCUS/FREE-e-commerce-website-for-travel-agency--Community---Copy-?node-id=201-2) làm **UI Kit & Thư viện thành phần tham khảo**.
> * **Kế thừa trực tiếp từ Figma:** Quy chuẩn Typography (`Open Sans`, `Podcast`/`Caveat`, `Inter`, `Poppins`), hệ thống phân cấp bố cục (Header, Hero Banner, Search Widget, Thẻ Card địa điểm, Layout Form Auth Split-Screen, DatePicker, Footer).
> * **Màu sắc giao diện:** Kế thừa hệ màu trung tính (`#FAFAFA`, `#FFFFFF`, `#E2E8F0`, `#333333`) và màu cam hổ phách (`#FA8B02` / `#D97706` Sunset Sand) của Figma làm màu nhấn nổi bật (Accent/Highlight), kết hợp cùng màu xanh `Ocean Azure` (`#0369A1`) cho các hành động thông minh đặc thù của TravelLako.
> * **Thành phần tự phát triển mới:** Các màn hình đặc thù của TravelLako (Bong bóng Chat AI, Kéo thả Timeline Day-by-Day, Bản đồ lộ trình Leaflet, Nhật ký hành trình) được thiết kế đồng nhất theo đúng token typography, bo góc và elevation của Figma.

---

## 1. Bảng Màu "Modern Natural Travel" (Color Palette)

Hệ màu mới loại bỏ hoàn toàn phong cách AI SaaS màu tím đậm hoặc các dải gradient gắt, tập trung vào trải nghiệm dịu mắt, hòa hợp thiên nhiên (biển, bầu trời, cây cỏ, đất cát).

### A. Màu Chính & Nhận Diện Thương Hiệu (Primary & Brand Palette)

| Loại màu | Token CSS | Hex Code | Cảm hứng / Mô tả | Ứng dụng |
| :--- | :--- | :--- | :--- | :--- |
| **Ocean Azure** | `--color-primary-600` | `#0369A1` | **Xanh đại dương sâu** (Sky-700) | Màu thương hiệu chính, Nút bấm CTA, Icon active |
| **Soft Sky** | `--color-primary-50` | `#F0F9FF` | **Xanh bầu trời dịu** (Sky-50) | Nền thẻ active, Highlight nhẹ, State hover |
| **Coastal Teal** | `--color-nature-600` | `#0D9488` | **Xanh ngọc / Cây cỏ** (Teal-600) | Tag địa điểm tự nhiên, Trạng thái an toàn |
| **Sunset Sand** | `--color-sand-500` | `#D97706` | **Màu cát nắng bãi biển** (Amber-600) | *Dùng rất hạn chế*: Đánh giá sao ⭐, Nút thả tim Yêu thích |

*Variants màu phụ phụ trợ*:
*   **Ocean Azure Hover:** `#075985` (Tailwind `sky-800`)
*   **Coastal Teal Light:** `#CCFBF1` (Tailwind `teal-100`)
*   **Sunset Sand Light:** `#FEF3C7` (Tailwind `amber-100`)

### B. Màu Phụ & Trung Tính (Backgrounds & Text Tokens)

| Loại màu | Token CSS | Hex Code | Mô tả | Ứng dụng |
| :--- | :--- | :--- | :--- | :--- |
| **App Background** | `--color-bg-app` | `#FAFAFA` | **Off-White dịu mắt** | Nền toàn bộ màn hình (giảm lóa so với pure white) |
| **Surface White** | `--color-bg-surface` | `#FFFFFF` | **Trắng tinh khiết** | Nền thẻ địa điểm (Card), Header, Bottom Navigation |
| **Subtle Slate** | `--color-bg-subtle` | `#F1F5F9` | **Xám Slate nhạt** (Slate-100) | Nền thanh tìm kiếm, Tab chưa chọn |
| **Primary Text** | `--color-text-main` | `#0F172A` | **Slate đậm** (Apple text) | Tiêu đề chính, Tên địa điểm (Độ tương phản 13.5:1) |
| **Secondary Text** | `--color-text-sub` | `#475569` | **Slate trung tính** (Slate-600) | Mô tả khoảng cách, giá cả, thời gian |
| **Subtle Border** | `--color-border` | `#E2E8F0` | **Viền xám siêu mảnh** | Đường phân cách 1px nhã nhặn |

### C. Màu Trạng Thái (Semantic Colors)
*   **Success (Check-in / Thành công):** `#0D9488` (Coastal Teal)
*   **Error (Thất bại / Cảnh báo lỗi):** `#EF4444` (Tailwind `red-500`)
*   **Warning (Cảnh báo nhạ):** `#D97706` (Sunset Sand)

### D. Nguyên tắc Áp dụng Màu sắc (Color Usage Principles)
*   **Ocean Azure (`#0369A1`):** Chỉ dành cho các tương tác hành động chính (nút CTA chính, tab active, liên kết điều hướng).
*   **Sunset Sand (`#D97706`):** Đóng vai trò là màu nhấn Accent hạn chế. Tuyệt đối **không lạm dụng** trên diện tích lớn để tránh gây chói mắt.
*   **Nền ứng dụng (App Background):** Sử dụng màu Off-White `#FAFAFA` giúp mắt thư thái khi lướt thông tin du lịch lâu dài.
*   **Thẻ thông tin (Cards):** Nền trắng tinh khôi `#FFFFFF` đặt nổi trên nền `#FAFAFA` với đường viền mảnh `#E2E8F0` tạo chiều sâu gọn gàng.
*   **Triết lý giao diện (Visual Philosophy):** Ưu tiên "Light, Minimal, Typographic". Hạn chế tối đa dải màu gradient gắt và giữ khoảng trống thở (whitespace) lớn chuẩn phong cách Notion & Apple.

---

## 2. Phông Chữ & Định Dạng (Typography chuẩn Figma)

Dựa trên phân tích toàn bộ **1,577 text nodes** từ file Figma gốc (*FREE e-commerce website for travel agency*):

*   **Font Family chính:**
    *   **Open Sans (Chủ đạo 96% hệ thống):** Dùng cho toàn bộ Body, Navigation, Buttons, Form Input, Card Titles và Section Headings.
        *   `Regular (400)`: Body paragraph, mô tả tour, placeholder input (`14px`, `16px`, `18px`, `20px`).
        *   `SemiBold (600)`: Menu điều hướng, Button CTA, Nhãn Form, Subtitles (`14px`, `15px`, `16px`, `18px`, `20px`, `24px`).
        *   `Bold (700)`: Tiêu đề gói tour ("Lucca Bike Tour", "Wine tasting"), Điểm đánh giá (`18px`, `20px`, `24px`, `32px`, `48px`).
        *   `ExtraBold (800)`: Tiêu đề lớn section ("Explore Our Popular Destinations", "The Most Popular Packages"), Giá tiền tour (`20px`, `24px`, `32px`, `48px`).
    *   **Podcast / Caveat (Script Title nghệ thuật):**
        *   Figma sử dụng font viết tay `Podcast` (Regular `72px`) cho câu slogan nổi bật trên Hero Banner: *"Enjoy in the best way!"* và *"Our team cares about your full relax"*.
        *   Giải pháp tối ưu web & Tiếng Việt: Sử dụng Google Fonts `Caveat` (hoặc font `Podcast` nhúng local) để đảm bảo hỗ trợ 100% tiếng Việt không bị lỗi dấu/méo chữ.
    *   **Inter & Poppins (Phụ trợ Calendar / Picker):**
        *   `Inter Regular (12px)`: Hiển thị thứ trong tuần trên lịch chọn ngày (Sun, Mon, Tue...).
        *   `Poppins Medium (10px)` & `Regular (15px)`: Ký tự ngày viết tắt và placeholder thẻ thanh toán.

*   **Cách tích hợp font trong React + Vite + Tailwind CSS v4:**
    Nhúng Google Fonts trong thẻ `<head>` của `web/index.html`:
    ```html
    <!-- index.html -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Inter:wght@400;500;600&family=Open+Sans:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600;1,700&family=Poppins:wght@400;500;600&display=swap"
      rel="stylesheet"
    />
    ```
    Cấu hình token font trong `web/src/index.css` (@theme Tailwind v4):
    ```css
    @theme {
      --font-sans: "Open Sans", system-ui, -apple-system, sans-serif;
      --font-heading: "Open Sans", sans-serif;
      --font-script: "Podcast", "Caveat", cursive;
      --font-calendar: "Inter", "Poppins", sans-serif;
    }
    ```

*   **Bảng quy chuẩn cỡ chữ (Font Sizes từ Figma):**
    *   `text-xs` (10px - 12px): Ký tự viết tắt lịch, badge phụ.
    *   `text-sm` (14px - 15px): Placeholder, text phụ, dropdown option.
    *   `text-base` (16px): Body text, menu navigation, input tiêu chuẩn.
    *   `text-lg` (18px): Nhãn trường tìm kiếm (Search Bar), subtitle.
    *   `text-xl` (20px): Tiêu đề thẻ Tour card, giá tiền trung bình.
    *   `text-2xl` (24px): Tiêu đề tour item lớn, title modal.
    *   `text-3xl` - `text-4xl` (32px - 48px): Section Title ("Explore Our Popular Destinations").
    *   `text-7xl` (72px): Hero display slogan (Font Script nghệ thuật).

---

## 3. Khoảng Cách & Bo Góc (Spacing & Border Radius)

*   **Spacing Scale:** Chuẩn hệ số 4px của Tailwind: `4px`, `8px`, `12px`, `16px` (khoảng cách chuẩn), `24px`, `32px`.
*   **Bo góc (Border Radius):**
    *   Button & Input: `rounded-xl` (12px).
    *   Cards & Modals: `rounded-2xl` (16px) hoặc `rounded-3xl` (24px).
    *   Pill badges & Status: `rounded-full` (9999px).

---

## 4. Công Nghệ & Thư Viện UI

### A. Web Frontend (React 19 + Vite + Tailwind CSS v4)
*   **Tailwind CSS v4**: Tích hợp với Vite qua `@tailwindcss/vite`. Cú pháp mới dùng `@import "tailwindcss"` trong CSS. Không cần file `tailwind.config.js` — cấu hình bảng màu và biến hệ thống trực tiếp trong CSS với directive `@theme`.
*   **Khai báo CSS Variables với `@theme` (Tailwind v4):** Định nghĩa trong `src/index.css`:
    ```css
    @import "tailwindcss";

    @theme {
      --color-oceanBlue: #0369A1;
      --color-oceanBlueDark: #075985;
      --color-oceanBlueLight: #F0F9FF;
      --color-softSky: #F0F9FF;

      --color-coastalTeal: #0D9488;
      --color-coastalTealLight: #CCFBF1;

      --color-sunsetOrange: #D97706;
      --color-sunsetOrangeDark: #B45309;
      --color-sunsetOrangeLight: #FEF3C7;
      --color-sunsetSand: #D97706;

      --color-slateDark: #0F172A;
      --color-slateMuted: #475569;
      --color-grayBg: #FAFAFA;
      --color-borderGray: #E2E8F0;
      --color-surfaceWhite: #FFFFFF;
      --color-bgSubtle: #F1F5F9;

      --color-bgApp: #FAFAFA;
      --color-textMain: #0F172A;
      --color-textSub: #475569;

      --font-sans: "Be Vietnam Pro", Inter, sans-serif;
      --font-heading: "Plus Jakarta Sans", "Be Vietnam Pro", sans-serif;
    }

    body {
      background-color: var(--color-bgApp);
      color: var(--color-textMain);
      font-family: var(--font-sans);
    }
    ```
*   **Lucide Icons**: Bộ SVG Icon tối giản, sắc nét — dùng thư viện `lucide-react`.
*   **Framer Motion**: Animation mượt mà cho page transitions và micro-interactions.
*   **Sonner**: Toast notifications đẹp, nhẹ.

### B. Mobile App (Expo / React Native)
*   **NativeWind**: Cấu hình bảng màu Tailwind tương thích chuẩn với nền tảng React Native.

---

## 5. Quy Chuẩn Thành Phần Giao Diện (Component Specs)

### A. Button (Nút bấm)
*   **Primary Button:** Background Ocean Azure (`#0369A1`), chữ trắng, bo góc `rounded-xl` / `rounded-full`. Hover: Ocean Azure Dark (`#075985`).
*   **Secondary Button:** Background Soft Sky (`#F0F9FF`), chữ Ocean Azure (`#0369A1`), viền nhạt.
*   **Outline Button:** Viền xám mảnh (`#E2E8F0`), nền trắng, chữ Slate Dark (`#0F172A`).

### B. Cards (Thẻ địa điểm & Chuyến đi)
*   Nền: White Surface (`#FFFFFF`).
*   Viền: `border border-borderGray` (`#E2E8F0`).
*   Bo góc: `rounded-2xl` (16px).
*   Đổ bóng: Soft Shadow (`shadow-sm`, nâng lên `shadow-md` khi hover).
*   Gợi ý ảnh: Hover hiệu ứng phóng nhẹ (`transform scale-105`).
