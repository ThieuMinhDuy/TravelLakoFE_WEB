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
│   │   ├── diary/          # Nhật ký chuyến đi, feedback
│   │   ├── places/         # Khám phá, lọc địa điểm, chi tiết
│   │   └── trips/          # Lập lịch trình, quản lý chuyến đi
│   ├── contexts/           # React Context (LocaleContext, ToastContext)
│   ├── hooks/              # Generic hooks: usePagination, useDebounce, useDocumentTitle...
│   ├── layouts/            # Layouts (MainLayout, AdminLayout) — màn auth là popup
│   ├── routes/             # Định tuyến SPA & Protected Route (RBAC)
│   ├── lib/                # QueryClient dùng chung
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
