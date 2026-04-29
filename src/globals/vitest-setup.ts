import { vi } from 'vitest';

import { setup } from './setup.ts';

setup();

// eslint-disable-next-line no-restricted-syntax -- Dynamic import required by vi.mock factory to lazily resolve the module.
vi.mock('obsidian', async () => await import('../obsidian/index.ts'));
