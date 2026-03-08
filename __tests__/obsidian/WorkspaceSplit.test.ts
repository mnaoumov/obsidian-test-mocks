import {
  describe,
  expect,
  it
} from 'vitest';

import { WorkspaceSplit } from '../../src/obsidian/WorkspaceSplit.ts';

describe('WorkspaceSplit', () => {
  it('should create an instance via create__', () => {
    const split = WorkspaceSplit.create__(undefined, 'vertical');
    expect(split).toBeInstanceOf(WorkspaceSplit);
  });
});
