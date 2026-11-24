# TripMate Web Frontend (SPA)

Dự án Web Frontend của **TripMate** được xây dựng theo **Kiến trúc B: SPA + Express REST API**, sử dụng **React + Vite + TypeScript**.

## 🚀 Công nghệ sử dụng

- **Core Framework**: React 19 + TypeScript (Strict Mode)
- **Build Tool**: Vite
- **Routing**: React Router (Lazy Loading cho Admin/Hồ sơ/popup xác thực, Route Guard)
- **State Management**: Zustand (Global state) + TanStack Query (server state)
- **Styling**: Tailwind CSS v4
- **API Client**: Axios (Cấu hình Interceptors tập trung)
- **Testing**: Vitest + React Testing Library

## 📁 Cấu trúc thư mục (Feature-based Architecture)

```
web/
├── public/                 # Static assets (favicon, icons)
├── src/
│   ├── assets/             # Hình ảnh, SVG, fonts dùng chung
│   ├── components/         # Reusable UI components
│   │   ├── common/         # Button, Input, Modal, Toast...
│   │   ├── layout/         # Header, Footer, Sidebar
│   │   └── compound/       # Compound Components (FilterGroup, Tabs...)
│   ├── config/             # Biến môi trường, hằng số
│   ├── features/           # Module hóa theo tính năng nghiệp vụ
│   │   ├── admin/          # Quản trị (Địa điểm, người dùng, review)
│   │   ├── auth/           # Đăng nhập, đăng ký, OTP
│   │   ├── explore/        # Trang chủ, thành phố, địa điểm, review, yêu thích
│   │   └── profile/        # Hồ sơ, các tab cá nhân và cài đặt
│   ├── contexts/           # React Context (LocaleContext, ToastContext)
│   ├── hooks/              # Generic hooks: usePagination, useDebounce, useDocumentTitle...
│   ├── layouts/            # Layouts (MainLayout, AdminLayout) — màn auth là popup
│   ├── routes/             # Định tuyến SPA & Protected Route (RBAC)
│   ├── lib/                # QueryClient, query keys và quy tắc làm mới cache
│   ├── services/           # Axios client + interceptors, ApiError
│   ├── store/              # Global state (Zustand)
│   ├── types/              # TypeScript types / interfaces / DTOs
│   ├── utils/              # Tiện ích, formatters, type guards
│   ├── App.tsx             # Root Component
│   ├── index.css           # Tailwind CSS directives
│   └── main.tsx            # Entry point
├── tests/                  # Bộ kiểm thử Vitest + React Testing Library
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🛠 Hướng dẫn chạy dự án

```bash
# Cài đặt thư viện (đúng version trong package-lock.json)
npm ci

# Chạy môi trường phát triển (Dev)
npm run dev

# Kiểm tra kiểu và Build production
npm run build

# Chạy test / test kèm độ phủ
npm run test
npm run test:coverage
```

## Kiểm tra sau khi ghép nhánh

Chạy tại thư mục `web`:

```powershell
npm ci
npm run test:all
npm run build
```

`test:all` chạy bộ test chung trong `tests/` và bộ Explore trong `src/features/explore/__tests__/`, mỗi bộ có config/setup riêng. `npm test` tiếp tục chỉ chạy bộ chung để giữ tương thích.

Nghiệp vụ riêng đặt trong `features/<tên>/`; API tài nguyên, hook generic và quy ước cache dùng chung đặt trong `services/`, `hooks/`, `lib/`. Giữ import công khai ổn định khi tích hợp, không sao chép service/store để tránh conflict. Trips/diary hiện còn route placeholder; chưa có feature tương ứng trong bản này.
