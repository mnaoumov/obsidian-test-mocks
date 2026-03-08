import type { DataAdapter } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from '../../src/obsidian/App.ts';
import { FileSystemAdapter } from '../../src/obsidian/FileSystemAdapter.ts';
import { WorkspaceSplit } from '../../src/obsidian/WorkspaceSplit.ts';

describe('WorkspaceSplit', () => {
  it('should create an instance via create__', () => {
    const app = App.create__(FileSystemAdapter.create__('/test') as unknown as DataAdapter, '');
    const split = WorkspaceSplit.create__(app.workspace, 'vertical');
    expect(split).toBeInstanceOf(WorkspaceSplit);
  });
});
