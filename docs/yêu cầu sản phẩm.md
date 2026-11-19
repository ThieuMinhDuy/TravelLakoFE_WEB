# Đề tài Bài tập lớn cuối kỳ – Lập trình Web nâng cao

## 1. Thông tin chung

Bài thi cuối kỳ là một dự án web hoàn chỉnh, làm theo nhóm 3–4 sinh viên

* **Chọn đề:** mỗi nhóm chọn 1 trong 5 đề gợi ý ở mục 3, hoặc tự đề xuất đề tài theo mục 4.
* **Công nghệ:** không bắt buộc Next.js. Nhóm chọn một trong ba kiến trúc ở mục 2; TypeScript là bắt buộc.
* **Phân công:** mỗi thành viên phụ trách ít nhất một module/tính năng trọn vẹn; lịch sử commit Git phải thể hiện đóng góp của từng người.

## 2. Yêu cầu kỹ thuật chung (bắt buộc với mọi đề tài)

Mọi đề tài, kể cả đề tự chọn, phải đáp ứng đủ 8 nhóm yêu cầu dưới đây; yêu cầu riêng của từng đề ở mục 3 là phần cộng thêm.

**Chọn một trong ba kiến trúc:**

| Kiến trúc | Frontend | Backend | Xác thực |
| --- | --- | --- | --- |
| A. Next.js full-stack | Next.js App Router | Route Handler + Server Action | Auth.js (NextAuth v5) |
| B. SPA + NestJS | React + Vite (React Router) | NestJS REST API | JWT, Guard của NestJS |
| C. Next.js + NestJS | Next.js App Router | NestJS REST API | Auth.js hoặc JWT từ NestJS |

Cơ sở dữ liệu tự chọn (PostgreSQL, MySQL, MongoDB, SQLite…) cùng ORM tương ứng (Prisma, TypeORM, Mongoose…). Không dùng dữ liệu giả cứng trong code cho chức năng chính.

| # | Nhóm yêu cầu | Tiêu chí tối thiểu |
| --- | --- | --- |
| 1 | TypeScript | strict: true; không dùng any trừ chỗ có chú thích lý do; có ít nhất 1 generic tự viết, dùng utility type (Partial, Pick, Omit, Record…) và type guard; kiểu dữ liệu dùng chung giữa các tầng |
| 2 | Kiến trúc & pattern React | Cấu trúc thư mục theo feature; ít nhất 2 custom hook có kiểu generic; áp dụng ít nhất 1 pattern trong HOC / Render Props / Compound Component, giải thích lý do chọn |
| 3 | Quản lý state | Dùng Redux Toolkit (createSlice, createAsyncThunk hoặc RTK Query) hoặc Zustand cho state toàn cục; Context cho state ít thay đổi (theme, ngôn ngữ…); báo cáo giải thích vì sao chọn giải pháp đó |
| 4 | Hiệu năng | Có code-splitting (React.lazy/dynamic import) và memo/useMemo/useCallback ở chỗ có lý do; danh sách dài (≥ 200 dòng) dùng virtualization hoặc phân trang; ảnh chụp Profiler hoặc Lighthouse trước/sau tối ưu |
| 5 | Kiểm thử | Jest/Vitest + React Testing Library: ≥ 15 test case, gồm unit test hàm/reducer, test component có tương tác người dùng, test bất đồng bộ có mock API; coverage ≥ 50% ở thư mục logic chính |
| 6 | Xác thực & phân quyền | Đăng ký/đăng nhập; ít nhất 2 vai trò với ma trận phân quyền (RBAC); bảo vệ nhiều lớp: chặn ở route (Middleware/Guard) **và** kiểm tra lại ở tầng xử lý dữ liệu |
| 7 | Backend & API | Kiểm tra đầu vào ở server (DTO + ValidationPipe hoặc Zod); trả mã lỗi HTTP đúng (400, 401, 403, 404); định dạng lỗi thống nhất. Với NestJS: chia Module – Controller – Service, dùng DI, có ít nhất 1 Interceptor và 1 Exception Filter |
| 8 | Render & SEO | Nếu dùng Next.js: chọn đúng CSR/SSR/SSG/ISR cho từng loại trang và ghi lý do trong báo cáo; có loading.tsx/error.tsx; Metadata API, sitemap, robots. Nếu dùng kiến trúc B: lazy route, trang lỗi/404, title động cho từng trang |

Ngoài ra: dùng Git (commit theo từng tính năng, khuyến khích nhánh + pull request), có file .env.example, không commit secret, giao diện dùng được trên màn hình điện thoại.

## 3. Năm đề tài gợi ý

Mỗi đề gồm chức năng bắt buộc, yêu cầu kỹ thuật riêng (cộng thêm vào mục 2) và phần nâng cao để lấy điểm tối đa. Kiến trúc ghi trong mỗi đề chỉ là gợi ý.

| Đề | Tên | Vai trò | Trọng tâm kỹ thuật | Kiến trúc gợi ý |
| --- | --- | --- | --- | --- |
| 1 | Chợ đồ cũ sinh viên | Khách, Thành viên, Admin | SSG/ISR, SEO, tìm kiếm lọc | A hoặc C |
| 2 | Hệ thống học trực tuyến (LMS) mini | Học viên, Giảng viên, Admin | RBAC theo sở hữu, quiz, tiến độ | C |
| 3 | Quản lý dự án nhóm kiểu Kanban | Owner, Member, Viewer | State phức tạp, optimistic update | B |
| 4 | Đặt lịch sân thể thao | Khách đặt, Chủ sân, Admin | Nghiệp vụ trùng lịch, form phức tạp | B hoặc C |
| 5 | Cổng tuyển dụng thực tập | Ứng viên, Nhà tuyển dụng, Admin | SEO nâng cao, upload file, quy trình trạng thái | A |

### Đề 1. Chợ đồ cũ sinh viên

Sinh viên đăng bán giáo trình, đồ điện tử, đồ dùng ký túc xá đã qua sử dụng; người mua tìm kiếm, lưu tin và gửi đề nghị mua. Không có thanh toán trực tuyến.

**Chức năng bắt buộc**

* Khách: xem danh sách tin, tìm theo từ khóa, lọc theo danh mục, khoảng giá, tình trạng, khu vực; sắp xếp; xem chi tiết tin.
* Thành viên: đăng/sửa/ẩn tin của mình (nhiều ảnh), lưu tin yêu thích, gửi đề nghị mua, chấp nhận/từ chối đề nghị, đánh dấu “đã bán”, đánh giá người bán sau giao dịch.
* Admin: duyệt tin mới, xử lý tin bị báo cáo vi phạm, khóa tài khoản, quản lý danh mục, xem thống kê.

**Yêu cầu kỹ thuật riêng**

* Trang danh mục dùng SSG, trang chi tiết tin dùng ISR (có generateStaticParams + revalidate), trang quản lý tin cá nhân dùng SSR; cập nhật tin thì gọi revalidate đúng trang.
* Bộ lọc đồng bộ với URL (search params) để chia sẻ link kết quả; ô tìm kiếm có debounce.
* SEO: metadata động theo tin, JSON-LD Product, opengraph-image.tsx sinh ảnh chia sẻ, sitemap động.
* Ảnh dùng next/image; Lighthouse trang chi tiết đạt Performance và SEO ≥ 85.
* Người dùng chỉ sửa/xóa được tin của chính mình: kiểm tra quyền sở hữu ở Server Action/API, không chỉ ẩn nút trên giao diện.

**Nâng cao (cộng điểm):** chat giữa người mua và người bán (polling hoặc WebSocket); đăng nhập bằng Google chỉ cho email trường; gợi ý tin tương tự.

### Đề 2. Hệ thống học trực tuyến (LMS) mini

Giảng viên tạo khóa học gồm chương, bài học và bài kiểm tra trắc nghiệm; học viên đăng ký, học theo thứ tự và theo dõi tiến độ.

**Chức năng bắt buộc**

* Học viên: xem danh mục khóa học công khai, ghi danh, học bài (video nhúng + nội dung Markdown), đánh dấu hoàn thành, làm quiz có giới hạn thời gian, xem điểm và % tiến độ, hỏi đáp dưới bài học.
* Giảng viên: tạo/sửa khóa học, chương, bài học (kéo thả để sắp xếp), soạn ngân hàng câu hỏi, xem kết quả và tiến độ của học viên trong khóa mình dạy, xuất bảng điểm CSV.
* Admin: duyệt khóa học trước khi công khai, quản lý người dùng và vai trò, thống kê số ghi danh.

**Yêu cầu kỹ thuật riêng**

* Backend NestJS: tối thiểu 4 module (Auth, Users, Courses, Quizzes); RolesGuard + decorator @Roles; thêm một guard kiểm tra quyền sở hữu (giảng viên chỉ sửa khóa của mình, học viên chỉ vào bài của khóa đã ghi danh).
* Chấm quiz ở server: client không bao giờ nhận đáp án đúng trước khi nộp; hết giờ thì server từ chối bài nộp.
* Trình làm quiz viết bằng Compound Component (ví dụ <Quiz>, <Quiz.Question>, <Quiz.Timer>, <Quiz.Submit>).
* State bài đang làm quản lý bằng Redux Toolkit hoặc Zustand, giữ lại khi tải lại trang (persist).
* Trang danh mục khóa học công khai render sẵn (SSG/ISR), trang học bài chỉ vào được khi đã đăng nhập và ghi danh.
* Test: unit test cho hàm tính điểm và tiến độ (cả trường hợp biên), test service NestJS bằng mock repository.

**Nâng cao (cộng điểm):** trộn thứ tự câu hỏi/đáp án mỗi lần làm; cấp chứng chỉ PDF khi hoàn thành 100%; tài liệu API bằng Swagger.

### Đề 3. Quản lý dự án nhóm kiểu Kanban

Ứng dụng cho nhóm làm việc chung: mỗi dự án có bảng Kanban, các thẻ công việc di chuyển giữa các cột, giao người làm và hạn chót. Đây là ứng dụng nội bộ sau đăng nhập nên phù hợp kiến trúc SPA + NestJS.

**Chức năng bắt buộc**

* Tạo workspace/dự án, mời thành viên bằng email, gán vai trò Owner / Member / Viewer theo từng dự án.
* Bảng Kanban: thêm/sửa/xóa cột; thẻ có tiêu đề, mô tả, nhãn, độ ưu tiên, người được giao, hạn chót, checklist con, bình luận; kéo thả thẻ giữa các cột và đổi thứ tự.
* Lọc thẻ theo người làm, nhãn, hạn chót; chế độ xem dạng bảng (list view).
* Nhật ký hoạt động của dự án (ai làm gì, lúc nào); trang “Việc của tôi” gộp thẻ từ mọi dự án.
* Dashboard dự án: số thẻ theo cột, thẻ quá hạn, khối lượng việc theo thành viên (biểu đồ).

**Yêu cầu kỹ thuật riêng**

* Redux Toolkit với state chuẩn hóa (createEntityAdapter) cho cột và thẻ; selector có memo (createSelector).
* Kéo thả dùng optimistic update: giao diện đổi ngay, API lỗi thì hoàn tác và báo lỗi.
* Hiệu năng: bảng 500 thẻ vẫn mượt; kéo một thẻ không làm re-render các thẻ khác (nộp ảnh Profiler chứng minh); list view dùng virtualization.
* NestJS: phân quyền theo vai trò trong từng dự án (không phải vai trò toàn hệ thống) bằng Guard đọc projectId từ request; Viewer gọi API sửa phải nhận 403.
* Nhật ký hoạt động ghi bằng Interceptor, không viết rải rác trong từng handler.
* Test: reducer kéo thả (đổi cột, đổi thứ tự), test component thẻ bằng RTL + userEvent, test hoàn tác khi API lỗi.

**Nâng cao (cộng điểm):** cập nhật thời gian thực khi thành viên khác thay đổi bảng (WebSocket/Socket.IO qua NestJS Gateway); undo/redo; thông báo thẻ sắp đến hạn.

### Đề 4. Đặt lịch sân thể thao

Nền tảng cho chủ sân (bóng đá mini, cầu lông, pickleball…) đăng sân và khung giờ; khách tìm sân trống và đặt theo giờ. Trọng tâm là nghiệp vụ chống đặt trùng.

**Chức năng bắt buộc**

* Khách: tìm sân theo môn, khu vực, ngày, giờ; xem lịch trống dạng lưới ngày × khung giờ; đặt một hoặc nhiều khung liên tiếp; hủy đặt trước giờ chơi theo quy định; xem lịch sử đặt; đánh giá sân.
* Chủ sân: quản lý cụm sân và từng sân con, cấu hình giờ mở cửa, bảng giá theo khung giờ (giờ vàng, cuối tuần), khóa lịch bảo trì, xác nhận/từ chối đơn, xem doanh thu theo ngày/tháng.
* Admin: duyệt chủ sân mới, quản lý người dùng, xử lý khiếu nại.
* Đơn đặt có vòng đời trạng thái: Chờ xác nhận → Đã xác nhận → Hoàn thành, hoặc Đã hủy / Từ chối.

**Yêu cầu kỹ thuật riêng**

* Không để hai đơn trùng cùng sân, cùng khung giờ, kể cả khi hai người bấm đặt cùng lúc: xử lý bằng ràng buộc CSDL hoặc transaction, trả 409 Conflict; báo cáo mô tả cách thử.
* Tính giá và kiểm tra quy tắc hủy nằm trong Service ở server, viết dưới dạng hàm thuần có unit test đầy đủ trường hợp biên (qua nửa đêm, giờ vàng, hủy sát giờ).
* Chuyển trạng thái đơn biểu diễn bằng union type + hàm kiểm tra chuyển trạng thái hợp lệ; server từ chối chuyển sai.
* Form cấu hình bảng giá có validate ở cả client và server, dùng chung schema/kiểu.
* Lưới lịch trống là component tái sử dụng cho cả khách và chủ sân (Render Props hoặc Compound Component); đổi tuần không re-render toàn trang.
* Nếu dùng Next.js: trang giới thiệu sân render sẵn có SEO (JSON-LD SportsActivityLocation hoặc LocalBusiness), lịch trống lấy dữ liệu mới mỗi lần xem.

**Nâng cao (cộng điểm):** giữ chỗ tạm 5 phút khi đang đặt; đặt lịch cố định hàng tuần; bản đồ vị trí sân; gửi email xác nhận.

### Đề 5. Cổng tuyển dụng thực tập cho sinh viên

Doanh nghiệp đăng tin tuyển thực tập; sinh viên tạo hồ sơ, nộp CV và theo dõi trạng thái ứng tuyển. Trang tin tuyển dụng cần được Google tìm thấy nên đề này nhấn mạnh SEO và chiến lược render.

**Chức năng bắt buộc**

* Ứng viên: tìm việc theo từ khóa, kỹ năng, địa điểm, hình thức (onsite/remote), có lương hay không; lưu tin; tạo hồ sơ nhiều bước (thông tin, học vấn, kỹ năng, dự án); tải CV PDF; ứng tuyển; theo dõi trạng thái.
* Nhà tuyển dụng: trang công ty, đăng/sửa/đóng tin tuyển, xem danh sách ứng viên theo tin, chuyển trạng thái hồ sơ (Đã nộp → Đang xem xét → Mời phỏng vấn → Đạt / Không đạt), ghi chú nội bộ.
* Admin: duyệt tài khoản doanh nghiệp, ẩn tin vi phạm, thống kê số tin và lượt ứng tuyển.

**Yêu cầu kỹ thuật riêng**

* Next.js App Router với bảng chiến lược render cho từng trang trong báo cáo: trang chủ SSG, trang tin tuyển và trang công ty ISR, trang kết quả tìm kiếm SSR, dashboard nhà tuyển dụng render theo phiên.
* Dùng route group tách khu công khai và khu quản trị, layout lồng nhau, loading.tsx/error.tsx/not-found.tsx cho từng khu.
* SEO nâng cao: JSON-LD JobPosting hợp lệ (kiểm tra bằng Rich Results Test), canonical, sitemap động chỉ gồm tin còn hạn, opengraph-image.tsx; tin hết hạn trả 404 hoặc noindex.
* Auth.js với Credentials + 1 OAuth provider; khai báo thêm kiểu role cho Session/JWT; Middleware chặn theo vai trò và Server Action kiểm tra lại quyền.
* Upload CV: chỉ nhận PDF ≤ 5 MB, kiểm tra ở server; chỉ ứng viên đó và nhà tuyển dụng của tin được tải CV.
* Form hồ sơ nhiều bước lưu nháp giữa các bước (Zustand persist hoặc Redux), validate từng bước.

**Nâng cao (cộng điểm):** gợi ý việc làm theo mức khớp kỹ năng; thông báo khi trạng thái hồ sơ thay đổi; đa ngôn ngữ Việt/Anh với hreflang.

## 4. Đề tài tự chọn

Nhóm được tự đề xuất đề tài nếu đạt độ khó tương đương 5 đề gợi ý và được giảng viên duyệt trước khi làm.

**Điều kiện tối thiểu**

* Đáp ứng đủ 8 nhóm yêu cầu chung ở mục 2.
* Có ít nhất 3 vai trò người dùng (tính cả khách chưa đăng nhập) và ít nhất 5 thực thể dữ liệu có quan hệ với nhau.
* Có ít nhất 1 nghiệp vụ “khó” ngoài CRUD: quy trình nhiều trạng thái, tính toán theo quy tắc, xử lý tranh chấp dữ liệu, phân quyền theo sở hữu…
* Không chọn đề trùng bài thực hành hoặc ví dụ giỏ hàng trên lớp;

**Nộp đề xuất (tối đa 2 trang) gồm:** tên đề tài và bài toán giải quyết; danh sách vai trò và chức năng chính; kiến trúc đã chọn (A/B/C) và lý do; nghiệp vụ khó của đề; dự kiến phân công thành viên.

Ví dụ hướng đề phù hợp: quản lý câu lạc bộ và sự kiện sinh viên có bán vé; đặt món căng-tin theo khung giờ lấy; quản lý phòng trọ và hóa đơn điện nước; diễn đàn hỏi đáp học tập có vote và điểm uy tín.

## 5. Sản phẩm nộp và tiêu chí đánh giá

**Sản phẩm nộp**

1. Link repository Git (đặt tên <MãNhóm>\_LTWNC\_CuoiKy), có README hướng dẫn cài đặt, chạy, tài khoản demo cho từng vai trò và script tạo dữ liệu mẫu (seed).
2. Quyển báo cáo (file PDF), tối đa 20 trang, theo yêu cầu bên dưới.
3. Video demo 5–10 phút chạy các luồng chính.
4. Link triển khai (Vercel, Render, Railway…) — khuyến khích, được tính vào điểm nâng cao.

**Yêu cầu quyển báo cáo**

* **Độ dài:** tối đa 20 trang nội dung, không tính trang bìa, mục lục và tài liệu tham khảo. Không dán nguyên đoạn code dài; chỉ trích đoạn ngắn cần minh họa và ghi đường dẫn file trong repo.
* **Trình bày:** khổ A4, có trang bìa (tên đề tài, mã nhóm, họ tên và mã sinh viên các thành viên), mục lục, đánh số trang, hình và bảng có chú thích.
* **Nội dung bắt buộc:**
  1. Giới thiệu đề tài, vai trò người dùng và danh sách chức năng đã làm (đánh dấu chức năng chưa hoàn thành nếu có).
  2. Kiến trúc hệ thống (A/B/C) kèm sơ đồ, cấu trúc thư mục, sơ đồ CSDL.
  3. Ma trận phân quyền và các lớp bảo vệ đã cài đặt.
  4. Giải thích các lựa chọn kỹ thuật: giải pháp state, pattern React, chiến lược render từng trang (nếu dùng Next.js).
  5. Minh chứng hiệu năng (Profiler/Lighthouse trước và sau) và kết quả kiểm thử, coverage.
  6. Ảnh chụp giao diện các màn hình chính.
  7. Bảng phân công: công việc cụ thể và % đóng góp của từng thành viên.
  8. Kết luận: kết quả đạt được, hạn chế, hướng phát triển.
* Báo cáo vượt quá 20 trang nội dung sẽ bị trừ điểm phần báo cáo.

Điểm cá nhân = điểm nhóm điều chỉnh theo mức đóng góp (lịch sử commit + phần trả lời khi bảo vệ). Thành viên không giải thích được phần code mình phụ trách có bị trừ điểm riêng.