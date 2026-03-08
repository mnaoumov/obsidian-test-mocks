import {
  describe,
  expect,
  it
} from 'vitest';

import type { Workspace } from '../../src/obsidian/Workspace.ts';

import { castTo } from '../../src/internal/Cast.ts';
import { WorkspaceTabs } from '../../src/obsidian/WorkspaceTabs.ts';

describe('WorkspaceTabs', () => {
  it('should create an instance via create__', () => {
    const tabs = WorkspaceTabs.create__(castTo<Workspace>({}));
    expect(tabs).toBeInstanceOf(WorkspaceTabs);
  });
});
