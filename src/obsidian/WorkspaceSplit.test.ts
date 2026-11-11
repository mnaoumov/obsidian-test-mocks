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

  describe('direction / setDirection()', () => {
    it('should keep the direction it was created with', () => {
      const app = App.createConfigured__();
      const split = WorkspaceSplit.create2__(app.workspace, 'horizontal');
      expect(split.direction).toBe('horizontal');
    });

    it('should change the direction', () => {
      const app = App.createConfigured__();
      const split = WorkspaceSplit.create2__(app.workspace, 'horizontal');
      split.setDirection('vertical');
      expect(split.direction).toBe('vertical');
    });

    it('should not allow a single child', () => {
      const app = App.createConfigured__();
      expect(WorkspaceSplit.create2__(app.workspace, 'vertical').allowSingleChild).toBe(false);
    });
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

  describe('recomputeChildrenDimensions()', () => {
    it('should scale the children to add up to 100 when every child has a dimension', () => {
      const app = App.createConfigured__();
      const split = WorkspaceSplit.create2__(app.workspace, 'vertical');
      const first = WorkspaceSplit.create2__(app.workspace, 'vertical');
      const second = WorkspaceSplit.create2__(app.workspace, 'vertical');
      split.insertChild(0, first);
      split.insertChild(1, second);
      first.setDimension(10);
      second.setDimension(30);
      split.recomputeChildrenDimensions();
      expect(first.dimension).toBe(25);
      expect(second.dimension).toBe(75);
    });

    it('should clear every dimension when any child has none', () => {
      const app = App.createConfigured__();
      const split = WorkspaceSplit.create2__(app.workspace, 'vertical');
      const first = WorkspaceSplit.create2__(app.workspace, 'vertical');
      const second = WorkspaceSplit.create2__(app.workspace, 'vertical');
      split.insertChild(0, first);
      split.insertChild(1, second);
      first.setDimension(10);
      split.recomputeChildrenDimensions();
      expect(first.dimension).toBeNull();
      expect(second.dimension).toBeNull();
    });
  });

  describe('serialize()', () => {
    it('should record the type and the direction', () => {
      const app = App.createConfigured__();
      const split = WorkspaceSplit.create2__(app.workspace, 'horizontal', 'my-split');
      expect(split.serialize()).toEqual({ children: [], direction: 'horizontal', id: 'my-split', type: 'split' });
    });
  });
});
