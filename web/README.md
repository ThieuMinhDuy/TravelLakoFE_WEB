# TravelLako Web Frontend (SPA)

Dự án Web Frontend của **TravelLako** được xây dựng theo **Kiến trúc B: SPA + NestJS REST API**, sử dụng **React + Vite + TypeScript**.

## 🚀 Công nghệ sử dụng

- **Core Framework**: React 19 + TypeScript (Strict Mode)
- **Build Tool**: Vite
- **Routing**: React Router (hỗ trợ Lazy Loading & Route Guard)
- **State Management**: Zustand (Global state) & React Context
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
│   ├── config/             # Cấu hình Axios, biến hằng số
│   ├── features/           # Module hóa theo tính năng nghiệp vụ
│   │   ├── admin/          # Quản trị (Địa điểm, người dùng, review)
│   │   ├── auth/           # Đăng nhập, đăng ký, OTP
│   │   ├── diary/          # Nhật ký chuyến đi, feedback
│   │   ├── places/         # Khám phá, lọc địa điểm, chi tiết
│   │   └── trips/          # Lập lịch trình, quản lý chuyến đi
│   ├── hooks/              # Custom Hooks (Generic hooks: usePagination, useDebounce...)
│   ├── layouts/            # Layouts (MainLayout, AuthLayout, AdminLayout)
│   ├── routes/             # Định tuyến SPA & Protected Route (RBAC)
│   ├── services/           # Tầng tích hợp API client
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
# Cài đặt thư viện
npm install

# Chạy môi trường phát triển (Dev)
npm run dev

# Kiểm tra kiểu và Build production
npm run build

# Chạy test
npm run test
```
