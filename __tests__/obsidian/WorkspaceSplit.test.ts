import {
  describe,
  expect,
  it
} from 'vitest';

import type { Workspace } from '../../src/obsidian/Workspace.ts';

import { castTo } from '../../src/internal/Cast.ts';
import { WorkspaceSplit } from '../../src/obsidian/WorkspaceSplit.ts';

describe('WorkspaceSplit', () => {
  it('should create an instance via create__', () => {
    const split = WorkspaceSplit.create__(castTo<Workspace>({}), 'vertical');
    expect(split).toBeInstanceOf(WorkspaceSplit);
  });
});
