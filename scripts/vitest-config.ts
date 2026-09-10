import { defineConfig } from 'vitest/config';

const SHARED_EXCLUDE = ['node_modules', 'dist', 'docs/dist', 'src/jest'];

// Every test under `scripts/` -- the vendored docs generator, the custom ESLint rules, and the script
// Helpers. Deliberately the whole tree rather than `scripts/docs-gen/**`, which is what it used to be:
// That narrower glob left `scripts/helpers/**/*.test.ts` collected by the jsdom project below, where
// Mocking a node builtin does not work. A `vi.mock('node:fs')` with no factory is a silent no-op there --
// Not even the test file's own import is replaced -- so a suite written against it reads the real disk
// And passes only where the real answer happens to match. See AGENTS.md, "The two Vitest projects".
const SCRIPTS_TEST_FILES = 'scripts/**/*.test.ts';
const DOCS_SITE_TEST_FILES = 'docs/src/**/*.test.ts';

// Rendering an OG image to a bitmap (satori + resvg) and building a ts-morph Project are genuinely slow.
// Under the full aggregate they lose the CPU race and the default 5000 ms times them out. It is a budget
// Rather than a floor, so the fast helper suites sharing it cost nothing.
const NODE_TEST_TIMEOUT_IN_MILLISECONDS = 30_000;

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
        // The scripts tree and the documentation site are plain Node tooling: they must NOT run under
        // Jsdom, and must not load the Obsidian mocks (the docs generator reads this repo's own sources
        // With ts-morph, so a global `obsidian` mock would only get in the way).
        test: {
          environment: 'node',
          exclude: [...SHARED_EXCLUDE],
          include: [SCRIPTS_TEST_FILES, DOCS_SITE_TEST_FILES],
          name: 'unit-tests:scripts',
          setupFiles: [],
          testTimeout: NODE_TEST_TIMEOUT_IN_MILLISECONDS
        }
      },
      {
        // Only `src/**` runs under jsdom with the Obsidian mocks -- the include is narrow on purpose, so
        // A test added anywhere else cannot be collected here by accident.
        test: {
          environment: 'jsdom',
          exclude: [...SHARED_EXCLUDE],
          include: ['src/**/*.test.ts'],
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
