import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from '../../src/obsidian/App.ts';
import { WorkspaceTabs } from '../../src/obsidian/WorkspaceTabs.ts';

describe('WorkspaceTabs', () => {
  it('should create an instance via create__', async () => {
    const app = await App.createConfigured__();
    const tabs = WorkspaceTabs.create2__(app.workspace);
    expect(tabs).toBeInstanceOf(WorkspaceTabs);
  });
});
