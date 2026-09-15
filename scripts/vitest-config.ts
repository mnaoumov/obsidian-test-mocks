import { defineConfig } from 'vitest/config';

const SHARED_EXCLUDE = ['node_modules', 'dist', 'docs/dist', 'src/jest'];

// Every test under `scripts/` -- the vendored docs generator, the custom ESLint rules, and the script
// helpers. Deliberately the whole tree rather than `scripts/docs-gen/**`, which is what it used to be:
// That narrower glob left `scripts/helpers/**/*.test.ts` collected by the jsdom project below, where
// mocking a node builtin does not work. A `vi.mock('node:fs')` with no factory is a silent no-op there --
// not even the test file's own import is replaced -- so a suite written against it reads the real disk
// and passes only where the real answer happens to match. See AGENTS.md, "The two Vitest projects".
const SCRIPTS_TEST_FILES = 'scripts/**/*.test.ts';
const DOCS_SITE_TEST_FILES = 'docs/src/**/*.test.ts';

const BIG_TIMEOUT_IN_MILLISECONDS = 30_000;

// Vitest 4 projects do NOT inherit the root-level `test` options, so a project that omits `testTimeout`
// silently runs on the built-in 5000 ms default -- nothing warns, and nothing in the config hints that one
// project is on a tighter budget than its sibling. Spreading the budget into EVERY project makes that
// omission impossible rather than merely unlikely; `obsidian-integration-testing` carries the same object
// for the same reason, after its release gate went flaky on exactly this. The budget covers two costs a
// per-suite number cannot see: v8 coverage instrumentation, which `npm run test:coverage` -- the release
// gate, via `npm run version` -- runs `src/**` under, and the CPU contention of a busy machine. Suites that
// are genuinely slow in their own right -- rendering an OG image to a bitmap with satori + resvg, building
// A ts-morph Project -- sit comfortably inside it. It is a ceiling rather than a floor, so the fast suites
// sharing it cost nothing.
const SHARED_TEST_DEFAULTS = { testTimeout: BIG_TIMEOUT_IN_MILLISECONDS };

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
        // jsdom, and must not load the Obsidian mocks (the docs generator reads this repo's own sources
        // with ts-morph, so a global `obsidian` mock would only get in the way).
        test: {
          ...SHARED_TEST_DEFAULTS,
          environment: 'node',
          exclude: [...SHARED_EXCLUDE],
          include: [SCRIPTS_TEST_FILES, DOCS_SITE_TEST_FILES],
          name: 'unit-tests:scripts',
          setupFiles: []
        }
      },
      {
        // Only `src/**` runs under jsdom with the Obsidian mocks -- the include is narrow on purpose, so
        // A test added anywhere else cannot be collected here by accident.
        test: {
          ...SHARED_TEST_DEFAULTS,
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
