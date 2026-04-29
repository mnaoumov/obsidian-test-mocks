import type { Config } from 'jest';

import { join } from 'node:path';

export const jestConfig: Config = {
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^obsidian$': '<rootDir>/dist/lib/esm/obsidian/index.mjs'
  },
  rootDir: join(import.meta.dirname, '..'),
  setupFiles: ['./dist/lib/esm/globals/jest-setup.mjs'],
  testMatch: ['**/jest/*.jest.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json', useESM: true }]
  }
};
