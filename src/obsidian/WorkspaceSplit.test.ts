import type { WorkspaceSplit as WorkspaceSplitOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { WorkspaceSplit } from './WorkspaceSplit.ts';

describe('WorkspaceSplit', () => {
  it('should create an instance via create2__', () => {
    const app = App.createConfigured__();
    const split = WorkspaceSplit.create2__(app.workspace, 'vertical');
    expect(split).toBeInstanceOf(WorkspaceSplit);
  });

  describe('asOriginalType4__()', () => {
    it('should return the same instance typed as the original', () => {
      const app = App.createConfigured__();
      const split = WorkspaceSplit.create2__(app.workspace, 'vertical');
      const original: WorkspaceSplitOriginal = split.asOriginalType4__();
      expect(original).toBe(split);
    });
  });

  describe('fromOriginalType4__', () => {
    it('should return the same instance typed as the mock type', () => {
      const app = App.createConfigured__();
      const split = WorkspaceSplit.create2__(app.workspace, 'vertical');
      const mock = WorkspaceSplit.fromOriginalType4__(split.asOriginalType4__());
      expect(mock).toBe(split);
    });
  });
});
