import { defineConfig } from 'vitest/config';

export const config = defineConfig({
  test: {
    coverage: {
      exclude: [
        'src/**/*.test.ts',
        'src/**/index.ts',
        'src/globals/jest-setup.ts',
        'src/globals/setup.ts',
        'src/globals/vitest-setup.ts'
      ],
      include: ['src/**/*.ts'],
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage'
    },
    environment: 'jsdom',
    exclude: ['node_modules', 'dist', 'src/jest'],
    globals: false,
    include: ['src/**/*.test.ts'],
    setupFiles: ['src/globals/vitest-setup.ts']
  }
});
