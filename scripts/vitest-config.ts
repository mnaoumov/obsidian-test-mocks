import { defineConfig } from 'vitest/config';

export const config = defineConfig({
  test: {
    coverage: {
      exclude: [
        'src/**/*.test.ts',
        'src/**/index.ts',
        'src/globals/jest-setup.ts',
        'src/globals/setup.ts',
        'src/globals/vitest-setup.ts',
        'src/obsidian-typings/jest-setup.ts',
        'src/obsidian-typings/setup.ts',
        'src/obsidian-typings/vitest-setup.ts'
      ],
      include: ['src/**/*.ts'],
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage'
    },
    environment: 'jsdom',
    exclude: ['node_modules', 'dist', 'src/jest'],
    globals: false,
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
    server: {
      // eslint-disable-next-line unicorn/name-replacements -- `deps` is Vitest's option name, which has to be spelled the way Vitest reads it.
      deps: {
        inline: ['@obsidian-typings', 'obsidian-dev-utils']
      }
    },
    setupFiles: ['src/globals/vitest-setup.ts']
  }
});
