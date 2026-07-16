# TravelLako Frontend Workspace

Chào mừng bạn đến với repository Frontend của dự án **TravelLako**. Đây là nơi quản lý toàn bộ mã nguồn giao diện người dùng bao gồm cả nền tảng Web và Mobile.

## 📌 Cấu trúc Repository

Repository này được tổ chức theo mô hình multi-project, phân tách rõ ràng giữa Web và Mobile để hỗ trợ việc phát triển song song hiệu quả:

```
travel-lako-frontend/
├── web/                 # Ứng dụng Web (React + Vite + TypeScript)
├── mobile/              # Ứng dụng Mobile (React Native + Expo)
├── docs/                # Thư mục chứa tài liệu hướng dẫn và kiến trúc
├── .gitignore           # File cấu hình Git ignore dùng chung cho dự án
└── README.md            # Tài liệu tổng quan này
```

---

## 💻 1. Web Application (`web/`)

Ứng dụng Web được xây dựng dựa trên:
- **Core**: React
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Vanilla CSS

### Cấu trúc Thư mục chính trong `web/src/`
- `/assets`: Chứa tài nguyên tĩnh như hình ảnh, logo, icon toàn cục.
- `/components`: Các component UI dùng chung (Atoms, Molecules như Button, Input, Modal, v.v.).
- `/config`: Các cấu hình dùng chung như biến môi trường, định tuyến gốc.
- `/features`: Tổ chức mã nguồn theo chức năng nghiệp vụ (ví dụ: Auth, Tour, Booking, Profile, v.v.). Mỗi feature sẽ đóng gói các components, hooks, services, types riêng biệt.
- `/hooks`: Các React Custom Hooks dùng chung toàn ứng dụng.
- `/layouts`: Định nghĩa khung giao diện cho các nhóm trang (MainLayout, AuthLayout, AdminLayout).
- `/pages`: Các component đại diện cho một trang hoàn chỉnh, ánh xạ trực tiếp tới các URL.
- `/routes`: Định nghĩa và cấu hình Router (React Router).
- `/services`: Tích hợp API client (Axios configuration, common interceptors).
- `/store`: Quản lý state toàn cục (Zustand / Redux Toolkit).
- `/styles`: Định nghĩa CSS chung, hệ màu (colors), typography, variables.
- `/types`: Định nghĩa kiểu dữ liệu TypeScript dùng chung.
- `/utils`: Các hàm tiện ích dùng chung (formatters, validators).

---

## 📱 2. Mobile Application (`mobile/`)

Ứng dụng Mobile được xây dựng dựa trên:
- **Framework**: React Native + Expo
- **Routing**: Expo Router (Định tuyến dựa trên cấu trúc file)
- **Language**: TypeScript

### Cấu trúc Thư mục chính trong `mobile/`
- `/app`: Các route/màn hình được cấu trúc tự động qua Expo Router (chia theo nhóm `(auth)`, `(tabs)`).
- `/assets`: Các hình ảnh tĩnh, splash screen, favicon, icon ứng dụng.
- `/src/components`: Các component native dùng chung.
- `/src/constants`: Các hằng số thiết kế (Theme màu, Spacing, Typography).
- `/src/hooks`: Custom hooks dùng chung cho môi trường native (Keyboard, DeviceTheme).
- `/src/services`: Tích hợp kết nối API.
- `/src/store`: Quản lý state của app.
- `/src/types`: Định nghĩa TypeScript dùng chung.
- `/src/utils`: Các hàm bổ trợ.

---

## 📚 3. Tài liệu (`docs/`)

Xem thêm các hướng dẫn chi tiết trong thư mục `docs/`:
- `01_Introduction.md`: Giới thiệu tổng quan & Kiến trúc dự án.
- `02_Data_Models.md`: Định nghĩa cấu trúc dữ liệu và Interfaces.
- `03_UI_Flow_and_Features.md`: Sơ đồ luồng giao diện & Các tính năng.
- `04_API_Reference.md`: Tài liệu tham chiếu API chi tiết.
- `05_Git_Workflow.md`: Quy trình làm việc với Git & Commit Standards.
- `06_Design_System.md`: Hệ thống thiết kế UI/UX (Màu sắc, Typography, Spacing, Thư viện).

---

Chúc bạn có trải nghiệm lập trình tuyệt vời cùng TravelLako!
