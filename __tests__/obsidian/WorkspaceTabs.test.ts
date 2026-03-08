import type { DataAdapter } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from '../../src/obsidian/App.ts';
import { FileSystemAdapter } from '../../src/obsidian/FileSystemAdapter.ts';
import { WorkspaceTabs } from '../../src/obsidian/WorkspaceTabs.ts';

describe('WorkspaceTabs', () => {
  it('should create an instance via create__', () => {
    const app = App.create__(FileSystemAdapter.create__('/test') as unknown as DataAdapter, '');
    const tabs = WorkspaceTabs.create__(app.workspace);
    expect(tabs).toBeInstanceOf(WorkspaceTabs);
  });
});
