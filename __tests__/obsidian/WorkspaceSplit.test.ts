import {
  describe,
  expect,
  it
} from 'vitest';

import { createMockApp } from '../../src/helpers/createMockApp.ts';
import { WorkspaceSplit } from '../../src/obsidian/WorkspaceSplit.ts';

describe('WorkspaceSplit', () => {
  it('should create an instance via create__', async () => {
    const app = await createMockApp();
    const split = WorkspaceSplit.create2__(app.workspace, 'vertical');
    expect(split).toBeInstanceOf(WorkspaceSplit);
  });
});
