# TripMate - Web Frontend (SPA)

Chào mừng bạn đến với repository Frontend của dự án **TripMate** (Bài tập lớn môn Lập trình Web nâng cao). Đây là nơi quản lý toàn bộ mã nguồn giao diện người dùng của nền tảng web lập kế hoạch, gợi ý lịch trình và khám phá các địa điểm du lịch tại Việt Nam.

---

## 📌 1. Kiến Trúc Ứng Dụng Frontend (Architecture)

Ứng dụng Frontend được xây dựng theo mô hình **Single Page Application (SPA)** hoàn chỉnh:

* **Core Framework:** **React 19** kết hợp **TypeScript (Strict Mode: `strict: true`)**.
* **Build Tool & Dev Server:** **Vite** (Hot Module Replacement - HMR siêu tốc, tối ưu hóa quá trình build đóng gói).
* **Định tuyến (Client-side Routing):** **React Router** (Hỗ trợ Lazy Loading, Code-Splitting và Route Guards).
* **Styling & Design System:** **Tailwind CSS v4** (Tối ưu hóa biến theme `@theme`, Google Fonts *Be Vietnam Pro* & *Plus Jakarta Sans* hiển thị chuẩn 100% Tiếng Việt).
* **Tầng Kết Nối API:** **Axios** (Được cấu hình tập trung với Request/Response Interceptors, tự động đính kèm Token xác thực và xử lý mã lỗi toàn cục).

---

## 🎯 2. Các Mô Hình & Yêu Cầu Kỹ Thuật Bắt Buộc (Frontend)

Mã nguồn Frontend đáp ứng đầy đủ các tiêu chuẩn kỹ thuật trong đề cương đánh giá của môn học:

### 2.1. Mô hình Tổ chức Thư mục: Feature-based Architecture
Thay vì gom nhóm mã nguồn chung chung theo loại file, dự án tổ chức theo **từng phân hệ nghiệp vụ độc lập (Feature)** nhằm đảm bảo tính module hóa cao, dễ mở rộng và độc lập:
* `src/features/auth`: Giao diện và logic Đăng ký, Đăng nhập, Xác thực OTP.
* `src/features/places`: Tìm kiếm, bộ lọc đa năng, danh sách địa điểm, chi tiết địa điểm & đánh giá.
* `src/features/trips`: Lập kế hoạch chuyến đi, giao diện kéo thả timeline lịch trình theo ngày.
* `src/features/diary`: Viết nhật ký hành trình sau chuyến đi, tải ảnh kỷ niệm.
* `src/features/admin`: Quản lý danh mục địa điểm, kiểm duyệt người dùng, dashboard số liệu thống kê.

### 2.2. Mô hình Thiết kế React (Design Patterns)
* **Compound Component Pattern:** Áp dụng cho các cụm giao diện phức tạp có chia sẻ trạng thái nội bộ như `<FilterGroup>` (bao gồm `<FilterGroup.Category>`, `<FilterGroup.PriceRange>`), `<Modal>` và hệ thống `<Tabs>`.
* **Generic Custom Hooks:** Dự án triển khai các custom hook tái sử dụng cao với TypeScript Generics:
  * `usePagination<T>`: Quản lý logic phân trang dữ liệu linh hoạt cho mọi danh sách.
  * `useDebounce<T>`: Trì hoãn xử lý tìm kiếm theo từ khóa để tối ưu hiệu năng gọi API.
  * `useDocumentTitle`: Cập nhật tiêu đề trang động cho từng route (tối ưu trải nghiệm và SEO cho SPA).

### 2.3. Mô hình Quản lý Trạng thái (State Management)
* **Global State (Zustand):** Sử dụng Zustand cho trạng thái toàn cục thường xuyên thay đổi (phiên đăng nhập người dùng `useAuthStore`, kế hoạch chuyến đi đang thao tác `useTripStore`, bộ lọc tìm kiếm `useFilterStore`).
* **UI/Local State (React Context):** Dùng Context API cho các trạng thái ít biến động toàn ứng dụng như thông báo hệ thống (`ToastContext`) và giao diện (`ThemeContext`).

### 2.4. Phân Quyền Phía Client: RBAC (Role-Based Access Control)
* Hệ thống phân định rõ ràng 3 vai trò phía giao diện:
  1. **Khách (Guest):** Xem danh sách điểm đến, bài viết cẩm nang, tìm kiếm và xem chi tiết.
  2. **Thành viên (Member/User):** Lưu địa điểm yêu thích, tạo và quản lý lịch trình cá nhân, viết đánh giá, viết nhật ký.
  3. **Quản trị viên (Admin):** Toàn quyền truy cập phân hệ quản trị, quản lý dữ liệu địa điểm, người dùng, xem thống kê.
* **Bảo vệ Route (Route Guard):** Sử dụng component `ProtectedRoute` kết hợp React Router và Zustand store để chặn truy cập trái phép, tự động chuyển hướng người dùng chưa đăng nhập về trang `/login` hoặc hiển thị trang từ chối quyền truy cập (403).

### 2.5. Tối Ưu Hiệu Năng (Performance)
* **Code-Splitting & Lazy Loading:** Toàn bộ các trang nghiệp vụ đều được tách gói và tải lười thông qua `React.lazy()` và `<Suspense>`.
* **Tối ưu Re-render:** Sử dụng có chọn lọc `React.memo`, `useMemo`, `useCallback` ở các component tính toán ngân sách và bảng Timeline lịch trình.
* **Virtualization:** Tích hợp kỹ thuật ảo hóa danh sách (`@tanstack/react-virtual`) hoặc phân trang cho danh mục điểm đến có số lượng bản ghi lớn ($\ge 200$ mục).

### 2.6. Kiểm Thử Tự Động (Automated Testing)
* Sử dụng **Vitest** kết hợp **React Testing Library** và `jsdom`.
* Bộ test bao gồm tối thiểu **15 test cases**:
  * Unit test cho các hàm tiện ích, formatters, type guards và Zustand stores.
  * Integration test tương tác người dùng trên form đăng nhập, bộ lọc tìm kiếm bằng `@testing-library/user-event`.
  * Async test tích hợp mock API axios.
  * Độ phủ code (coverage) đạt tối thiểu **$\ge 50\%$** ở các thư mục logic nghiệp vụ chính.

---

## 📁 3. Cấu Trúc Thư Mục Frontend (`web/`)

```
web/
├── public/                 # Favicon và SVG icons của ứng dụng
├── src/
│   ├── assets/             # Tài nguyên hình ảnh, banners, logo
│   ├── components/         # Components giao diện dùng chung
│   │   ├── common/         # Button, Input, Modal, Table, Toast...
│   │   ├── compound/       # Compound Components (FilterGroup, Tabs...)
│   │   └── layout/         # Header, Footer, Sidebar
│   ├── config/             # Axios instance với interceptors, constants
│   ├── features/           # Cấu trúc thư mục theo tính năng (Feature-based)
│   │   ├── admin/          # Phân hệ quản trị
│   │   ├── auth/           # Xác thực, OTP
│   │   ├── diary/          # Nhật ký hành trình
│   │   ├── places/         # Danh mục địa điểm, review
│   │   └── trips/          # Kế hoạch & timeline chuyến đi
│   ├── hooks/              # Custom Generic Hooks (useDebounce, usePagination...)
│   ├── layouts/            # Khung bố cục (MainLayout, AuthLayout, AdminLayout)
│   ├── routes/             # Định tuyến React Router & ProtectedRoute
│   ├── services/           # Tầng gọi API client theo từng domain
│   ├── store/              # Zustand Global State
│   ├── types/              # Kiểu dữ liệu TypeScript & DTOs
│   ├── utils/              # Tiện ích, formatters, type guards
│   ├── App.tsx             # Component gốc
│   ├── index.css           # Cấu hình Tailwind CSS v4 & Color variables
│   └── main.tsx            # Entry point của ứng dụng React
├── tests/                  # Bộ kiểm thử Vitest + React Testing Library
├── .env.example            # File mẫu cấu hình URL kết nối API
├── .gitignore              # Cấu hình bỏ qua tệp của Git
├── index.html              # File HTML chính (Mount root div, nạp Google Fonts)
├── package.json            # Danh sách thư viện & scripts
├── tsconfig.json           # Cấu hình TypeScript (strict: true)
└── vite.config.ts          # Cấu hình build Vite & Tailwind v4
```

---

## 🛠 4. Hướng Dẫn Cài Đặt & Chạy Dự Án

### Yêu cầu môi trường:
* **Node.js**: Phiên bản `18.x` hoặc `20.x` trở lên ([Tải tại đây](https://nodejs.org/)).
* **Package Manager**: `npm` (đi kèm Node.js) hoặc `pnpm` / `yarn`.

### Các bước cài đặt:

1. **Di chuyển vào thư mục ứng dụng web:**
   ```bash
   cd web
   ```

2. **Cấu hình biến môi trường kết nối API:**
   Tạo file `.env` từ file mẫu `.env.example`:
   ```bash
   # Trên Windows PowerShell:
   Copy-Item .env.example .env

   # Trên Linux / macOS:
   cp .env.example .env
   ```

3. **Cài đặt các gói thư viện (Dependencies):**
   ```bash
   npm install
   ```

4. **Khởi chạy môi trường phát triển (Development Server):**
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy tại địa chỉ: `http://localhost:5173`.

5. **Kiểm tra kiểu dữ liệu (Type check) và Build sản phẩm (Production):**
   ```bash
   npm run build
   ```
   Kết quả đóng gói tối ưu sẽ nằm trong thư mục `web/dist/`.

6. **Chạy kiểm thử tự động (Testing):**
   ```bash
   # Chạy toàn bộ 15+ test cases:
   npm run test

   # Chạy test và xuất báo cáo độ phủ (Coverage):
   npm run test:coverage
   ```

---

## 👥 5. Phân Quyền Kiểm Thử (Theo Ma Trận RBAC)

| Vai trò | Quyền hạn trên giao diện |
|---|---|
| **Admin** | Truy cập phân hệ `/admin`, quản trị địa điểm, kiểm duyệt đánh giá, xem thống kê |
| **Member** | Đăng nhập tài khoản, tạo và sắp xếp lịch trình, lưu yêu thích, viết review & nhật ký |
| **Guest** | Xem công khai danh sách điểm đến, tìm kiếm, xem chi tiết địa điểm |
