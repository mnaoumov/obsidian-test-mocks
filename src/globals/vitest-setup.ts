/**
 * @file
 *
 * Vitest setup entry point: installs Obsidian's global helpers and the mocked `app`, and redirects imports of
 * `obsidian` to this package's mocks.
 */

import { vi } from 'vitest';

import { setup } from './setup.ts';

setup();

// eslint-disable-next-line no-restricted-syntax -- Dynamic import required by vi.mock factory to lazily resolve the module.
vi.mock('obsidian', async () => await import('../obsidian/index.ts'));
