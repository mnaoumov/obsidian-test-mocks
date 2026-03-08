import {
  describe,
  expect,
  it
} from 'vitest';

import { createMockApp } from '../../src/helpers/createMockApp.ts';
import { WorkspaceTabs } from '../../src/obsidian/WorkspaceTabs.ts';

describe('WorkspaceTabs', () => {
  it('should create an instance via create__', async () => {
    const app = await createMockApp();
    const tabs = WorkspaceTabs.create__(app.workspace);
    expect(tabs).toBeInstanceOf(WorkspaceTabs);
  });
});
