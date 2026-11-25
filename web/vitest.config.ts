import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

// Kế thừa cấu hình Vite (alias @, plugin React, Tailwind) để test chạy giống môi trường thật
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./tests/setup.ts'],
      // tests/: test của codebase, auth, profile, admin, trips · src/**/__tests__: test đặt cạnh feature (explore)
      include: ['tests/**/*.test.{ts,tsx}', 'src/**/__tests__/**/*.test.{ts,tsx}'],
      css: false,
      restoreMocks: true,
      coverage: {
        provider: 'v8',
        reporter: ['text-summary', 'text', 'html'],
        // Đo trên thư mục logic chính (gọi API, state, hook, hàm xử lý dữ liệu).
        // Giao diện thuần (pages, components) được kiểm tra qua test tương tác của từng feature.
        include: [
          'src/services/**',
          'src/store/**',
          'src/utils/**',
          'src/hooks/**',
          'src/lib/**',
          'src/contexts/**',
          'src/features/*/hooks/**',
          'src/features/*/utils/**',
          'src/features/*/services/**',
          'src/features/*/schemas.ts',
        ],
        // File chỉ re-export, không có logic
        exclude: ['**/index.ts'],
        thresholds: { lines: 50, statements: 50, functions: 50, branches: 50 },
      },
    },
  })
);
