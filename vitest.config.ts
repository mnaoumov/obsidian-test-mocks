import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      'obsidian': fileURLToPath(new URL('./src/obsidian/index.ts', import.meta.url)),
      'obsidian-typings/implementations': fileURLToPath(new URL('./src/obsidian-typings/implementations/index.ts', import.meta.url))
    }
  },
  test: {
    include: ['__tests__/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    environment: 'node',
    globals: false,
    setupFiles: ['./src/globals/index.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage'
    }
  }
});
