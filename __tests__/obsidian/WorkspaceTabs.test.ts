import {
  describe,
  expect,
  it
} from 'vitest';

import { WorkspaceTabs } from '../../src/obsidian/WorkspaceTabs.ts';

describe('WorkspaceTabs', () => {
  it('should create an instance via create__', () => {
    const tabs = WorkspaceTabs.create__();
    expect(tabs).toBeInstanceOf(WorkspaceTabs);
  });
});
