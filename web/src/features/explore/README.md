# Module khám phá của WinLT

Module dùng API thực tế của TravelLako và tham khảo hình thức Figma. Các file triển khai nằm trong `features/explore/`; ảnh minh họa nằm trong `assets/travel/`. Không thêm thư viện hay sửa các file barrel `hooks/index.ts`, `services/index.ts`, `types/index.ts` dùng chung.

## Tích hợp

Điểm nối duy nhất vào ứng dụng hiện tại là `src/routes/AppRoutes.tsx`: import `ExplorePage`, thay nội dung các route `/`, `/cities`, `/places`, `/favorites`, và thêm `/cities/:id`, `/places/:type/:id`. Route yêu thích tiếp tục dùng `ProtectedRoute` của dự án. Khi ghép nhánh khác, giữ phần auth/profile/trips của các thành viên và áp dụng lại các route trên.

Không đổi `HomePage.tsx`, header/footer, store xác thực hoặc cấu hình Axios. Header hiện có tìm kiếm thành phố bằng `/cities?search=...`; khung tìm kiếm mới trên trang chủ tìm địa điểm bằng `/places?search=...`.

## Đối chiếu API và giao diện

Kiểm tra API thực tế ngày 25 tháng 11 năm 2026 (giờ Việt Nam): các endpoint danh sách công khai trả HTTP 200 và mảng rỗng. Không thêm dữ liệu giả vào giao diện hoặc database để che trạng thái này.

| Giao diện            | API                                                                      | Quy tắc                                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Thành phố            | `GET /cities`, `GET /cities/:id`                                         | Danh sách thành phố được trả đầy đủ; tìm tên không dấu và phân trang ở client                                                                                 |
| Danh sách địa điểm   | `GET /places/:type`                                                      | `city`, `search`; hotel: `stars`, `minPrice/maxPrice`; attraction: `minFee/maxFee`; restaurant: `cuisineType`, `minPrice/maxPrice`; cafe: `minPrice/maxPrice` |
| Tất cả loại địa điểm | Tổng hợp 4 API theo loại                                                 | Gửi bộ lọc tương ứng cho từng loại; một request lỗi thì báo lỗi, không tuyên bố danh sách rỗng                                                                |
| Chi tiết             | `GET /places/:type/:id`                                                  | Ảnh, mô tả, địa chỉ, giá, tọa độ và rating từ API                                                                                                             |
| Đánh giá             | `GET /reviews/:itemType/:itemId`, `POST /reviews`, `DELETE /reviews/:id` | Đọc công khai; gửi/xóa cần đăng nhập; số sao nguyên 1–5 và nội dung không rỗng                                                                                |
| Yêu thích            | `GET /favorites`, `POST /favorites`, `DELETE /favorites/:id`             | Xóa bằng ID bản ghi favorite; cache tách theo user                                                                                                            |
| Quản trị nội dung    | `/admin/cities`, `/admin/places/:type`, `/admin/reviews`                 | Đã khai báo adapter riêng; chưa thay các màn Admin hiện có để tránh viết chồng nhánh Hoàng                                                                    |

`type` trên URL địa điểm là chữ thường; `itemType` của review/favorite được ánh xạ sang `Attraction`, `Hotel`, `Restaurant`, `Cafe`.

Swagger chưa có `page/limit` cho API địa điểm: phân trang dùng toàn bộ kết quả đã lọc từ server, không gửi tham số phân trang giả. Khi backend hỗ trợ phân trang thực, cập nhật service và hook thay vì cắt tiếp trang dữ liệu server.

Không có trường giờ mở cửa, tiện ích hay cờ nổi bật trong schema đã kiểm tra nên chưa đưa các mục này vào giao diện. Không có luồng booking/thanh toán tương ứng Figma nên không dựng form đặt tour. Hạng sao khách sạn được tách riêng với rating cộng đồng.

Ảnh minh họa trang chủ không tạo ra bản ghi thành phố/địa điểm. Card và gallery chỉ dùng ảnh của bản ghi tương ứng, không có ảnh thì dùng placeholder trung tính. Không tự thêm giá, review, số lượng địa điểm, số sao hay giờ mở cửa. Giá thiếu hiển thị “Chưa có giá tham khảo”, giá 0 hiển thị “Miễn phí”.

## Cấu trúc

- `ExplorePage.tsx`: điểm vào, tải lười các trang và tiêu đề tab.
- `pages/`: trang chủ, thành phố, danh sách, chi tiết và yêu thích.
- `components/`: card, skeleton HOC, gallery dùng native dialog, bản đồ Leaflet tải lười, form review và nút yêu thích.
- `services/`: ánh xạ contract và request qua Axios client hiện có.
- `hooks/`: React Query, debounce và phân trang generic thuộc riêng module.
- `explore.css`: selector giới hạn dưới `.explore` và tiền tố `explore-`.

## Kiểm thử

Từ thư mục `web`:

```powershell
npx vitest run --config vitest.explore.config.ts
npm run build
```

Chạy giao diện bằng `npm run dev` và mở `http://localhost:5173`. Backend hiện cho phép CORS của origin này, nhưng không trả `Access-Control-Allow-Origin` cho `http://127.0.0.1:5173`. Không sửa Axios hoặc nới bảo mật backend để che khác biệt này.

Config kiểm thử riêng để tránh đụng config của hai nhánh khác. Fixture chỉ được dùng trong test. Test kiểm tra debounce, URL/Back, tham số giá, phân trang, phân biệt dữ liệu rỗng/lỗi, redirect đăng nhập, ID favorite và validation/gửi review.

Các thao tác ghi dữ liệu thật và tài khoản Admin cần kiểm tra tích hợp với phiên đăng nhập hợp lệ; không tự tạo tài khoản hoặc ghi dữ liệu lên server production khi kiểm tra giao diện.
