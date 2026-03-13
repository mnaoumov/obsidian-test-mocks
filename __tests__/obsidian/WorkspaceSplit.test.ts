import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from '../../src/obsidian/App.ts';
import { WorkspaceSplit } from '../../src/obsidian/WorkspaceSplit.ts';

describe('WorkspaceSplit', () => {
  it('should create an instance via create__', async () => {
    const app = await App.createConfigured__();
    const split = WorkspaceSplit.create2__(app.workspace, 'vertical');
    expect(split).toBeInstanceOf(WorkspaceSplit);
  });
});
