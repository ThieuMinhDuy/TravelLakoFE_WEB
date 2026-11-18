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
      include: ['tests/**/*.test.{ts,tsx}'],
      css: false,
      restoreMocks: true,
    },
  })
);
