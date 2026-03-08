import { describe, expect, it } from 'vitest';

import { WorkspaceFloating } from 'obsidian';

describe('WorkspaceFloating', () => {
  it('should create an instance via create__', () => {
    const floating = WorkspaceFloating.create__();
    expect(floating).toBeInstanceOf(WorkspaceFloating);
  });
});
