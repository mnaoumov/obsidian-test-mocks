import { defineConfig } from 'vitest/config';

export const config = defineConfig({
  test: {
    coverage: {
      include: ['src/**/*.ts'],
      provider: 'v8',
      reporter: ['json-summary', 'text', 'lcov', 'html'],
      reportsDirectory: './coverage'
    },
    environment: 'jsdom',
    exclude: ['node_modules', 'dist'],
    globals: false,
    include: ['__tests__/**/*.test.ts'],
    setupFiles: ['src/globals/index.ts']
  }
});
