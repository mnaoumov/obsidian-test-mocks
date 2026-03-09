import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export const vitestConfig = defineConfig({
  resolve: {
    alias: {
      'obsidian': fileURLToPath(new URL('../src/obsidian/index.ts', import.meta.url))
    }
  },
  test: {
    coverage: {
      include: ['src/**/*.ts'],
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage'
    },
    environment: 'jsdom',
    exclude: ['node_modules', 'dist'],
    globals: false,
    include: ['__tests__/**/*.test.ts'],
    setupFiles: ['./src/globals/index.ts']
  }
});
