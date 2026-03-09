import {
  describe,
  expect,
  it
} from 'vitest';

import { WorkspaceFloating } from '../../src/obsidian/WorkspaceFloating.ts';

describe('WorkspaceFloating', () => {
  it('should create an instance via create__', () => {
    const floating = WorkspaceFloating.create2__();
    expect(floating).toBeInstanceOf(WorkspaceFloating);
  });
});
