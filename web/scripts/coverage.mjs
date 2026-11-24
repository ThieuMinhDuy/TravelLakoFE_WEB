/**
 * Chạy `vitest run --coverage` với thư mục làm việc có ổ đĩa viết hoa.
 *
 * Trên Windows, terminal (VS Code, Git Bash) có thể mở dự án dưới dạng `d:\...`. Khi đó file đã chạy
 * được ghi theo `d:\` còn file chưa có test lại được liệt kê theo `D:\`, báo cáo đếm mỗi file hai lần
 * và tỉ lệ coverage bị sai. Trên macOS / Linux script này không thay đổi gì.
 */
import { spawnSync } from 'node:child_process';

const cwd = process.cwd().replace(/^[a-z]:/, (drive) => drive.toUpperCase());
const args = ['vitest', 'run', '--coverage', ...process.argv.slice(2)];

const { status } = spawnSync('npx', args, { cwd, stdio: 'inherit', shell: true });
process.exit(status ?? 1);
