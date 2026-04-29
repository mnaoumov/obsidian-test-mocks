// eslint-disable-next-line import-x/no-namespace -- Namespace import needed to pass entire module to jest.mock factory.
import * as obsidianMocks from '../obsidian/index.ts';
import { setup } from './setup.ts';

setup();

interface JestMock {
  mock(moduleName: string, factory: () => unknown): void;
}

declare const jest: JestMock;

jest.mock('obsidian', () => obsidianMocks);
