# Ảnh du lịch cho giao diện TripMate

Ảnh được tải về ngày 24 tháng 11 năm 2026 và phục vụ phần trình bày giao diện. Đây không phải dữ liệu địa điểm được lấy từ backend.

| Tệp | Tác giả | Nguồn | Giấy phép |
| --- | --- | --- | --- |
| `ha-long.jpg` | Mustang Joe | [Hạ Long Bay Panorama](https://commons.wikimedia.org/wiki/File:H%E1%BA%A1_Long_Bay_Panorama,_Vietnam.jpg) | CC0 1.0 |
| `hoi-an.jpg` | lumoplank | [Hoi An HoiAn1435](https://commons.wikimedia.org/wiki/File:Hoi_An_-_HoiAn1435.jpg) | CC0 1.0 |
| `da-nang.jpg` | Quangpraha | [Da Nang Vietnam](https://commons.wikimedia.org/wiki/File:Da_Nang,_Vietnam.jpg) | CC0 1.0 |
| `ha-noi.jpg` | Daderot | [Hoan Kiem Lake DSC03693](https://commons.wikimedia.org/wiki/File:Hoan_Kiem_Lake_-_Hanoi,_Vietnam_-_DSC03693.JPG) | CC0 1.0 |

Giấy phép: https://creativecommons.org/publicdomain/zero/1.0/

Ảnh Hạ Long, Đà Nẵng và Hà Nội đã giảm kích thước và nén lại JPEG; ảnh Hội An sử dụng bản thumbnail của Wikimedia. Không thay đổi nội dung cảnh chụp.

`index.ts` cung cấp đường dẫn ảnh, mô tả thay thế, tác giả và nguồn cho module khám phá. Trang chủ của module dùng Hạ Long làm banner và các ảnh còn lại cho phần cảm hứng du lịch; không sửa CSS của trang chủ cũ. Với ảnh ngoài banner, dùng thẻ `img` có `alt`, kích thước xác định và `loading="lazy"` nếu ở dưới màn hình đầu tiên.

Không dùng một ảnh minh họa chung để đại diện cho địa điểm cụ thể khác trong dữ liệu API. Ảnh của bản ghi địa điểm vẫn lấy từ trường `images` của backend.
