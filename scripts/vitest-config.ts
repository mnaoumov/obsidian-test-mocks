import { defineConfig } from 'vitest/config';

const SHARED_EXCLUDE = ['node_modules', 'dist', 'docs/dist', 'src/jest'];

const DOCS_GENERATOR_TEST_FILES = 'scripts/docs-gen/**/*.test.ts';
const DOCS_SITE_TEST_FILES = 'docs/src/**/*.test.ts';

// Rendering an OG image to a bitmap (satori + resvg) and building a ts-morph Project are genuinely slow.
// Under the full aggregate they lose the CPU race and the default 5000 ms times them out.
const DOCS_TEST_TIMEOUT_IN_MILLISECONDS = 30_000;

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
    globals: false,
    projects: [
      {
        // The documentation pipeline is plain Node tooling: it must NOT run under jsdom, and must not
        // Load the Obsidian mocks (the generator reads this repo's own sources with ts-morph, so a
        // Global `obsidian` mock would only get in the way).
        test: {
          environment: 'node',
          exclude: [...SHARED_EXCLUDE],
          include: [DOCS_GENERATOR_TEST_FILES, DOCS_SITE_TEST_FILES],
          name: 'unit-tests:docs',
          setupFiles: [],
          testTimeout: DOCS_TEST_TIMEOUT_IN_MILLISECONDS
        }
      },
      {
        test: {
          environment: 'jsdom',
          exclude: [...SHARED_EXCLUDE, DOCS_GENERATOR_TEST_FILES, DOCS_SITE_TEST_FILES],
          include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
          name: 'unit-tests',
          server: {
            // eslint-disable-next-line unicorn/name-replacements -- `deps` is Vitest's option name, which has to be spelled the way Vitest reads it.
            deps: {
              inline: ['@obsidian-typings', 'obsidian-dev-utils']
            }
          },
          setupFiles: ['src/globals/vitest-setup.ts']
        }
      }
    ]
  }
});
