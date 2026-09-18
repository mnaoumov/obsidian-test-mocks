import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { App } from '../obsidian/App.ts';
import { ItemView } from '../obsidian/ItemView.ts';
import { WorkspaceLeaf } from '../obsidian/WorkspaceLeaf.ts';
import { EmptyView } from './empty-view.ts';

describe('EmptyView', () => {
  describe('create2__()', () => {
    it('should create an instance', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const view = EmptyView.create2__(leaf);
      expect(view).toBeInstanceOf(EmptyView);
      expect(view).toBeInstanceOf(ItemView);
      expect(view.leaf).toBe(leaf);
    });

    it('should call the construction hook', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const spy = vi.spyOn(EmptyView.prototype, 'constructor4__');
      EmptyView.create2__(leaf);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('getDisplayText()', () => {
    it('should answer Obsidian\'s New tab label', () => {
      const app = App.createConfigured__();
      expect(WorkspaceLeaf.create2__(app)._empty.getDisplayText()).toBe('New tab');
    });
  });

  describe('getViewType()', () => {
    it('should answer the empty view type', () => {
      const app = App.createConfigured__();
      expect(WorkspaceLeaf.create2__(app)._empty.getViewType()).toBe('empty');
    });
  });

  describe('navigation', () => {
    it('should navigate, unlike the base view', () => {
      const app = App.createConfigured__();
      expect(WorkspaceLeaf.create2__(app)._empty.navigation).toBe(true);
    });
  });

  describe('getIcon()', () => {
    it('should inherit the base view\'s glyph', () => {
      const app = App.createConfigured__();
      expect(WorkspaceLeaf.create2__(app)._empty.getIcon()).toBe('lucide-file');
    });
  });
});
