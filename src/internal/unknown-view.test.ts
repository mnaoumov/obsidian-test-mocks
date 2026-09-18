import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { App } from '../obsidian/App.ts';
import { WorkspaceLeaf } from '../obsidian/WorkspaceLeaf.ts';
import { EmptyView } from './empty-view.ts';
import { UnknownView } from './unknown-view.ts';

const UNKNOWN_TYPE = 'canvas';

function createUnknownView(): UnknownView {
  const app = App.createConfigured__();
  return UnknownView.create3__(WorkspaceLeaf.create2__(app), UNKNOWN_TYPE);
}

describe('UnknownView', () => {
  describe('create3__()', () => {
    it('should create an instance that is also an empty view, as in Obsidian', () => {
      const view = createUnknownView();
      expect(view).toBeInstanceOf(UnknownView);
      expect(view).toBeInstanceOf(EmptyView);
    });

    it('should call the construction hook', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const spy = vi.spyOn(UnknownView.prototype, 'constructor5__');
      UnknownView.create3__(leaf, UNKNOWN_TYPE);
      expect(spy).toHaveBeenCalledWith(leaf, UNKNOWN_TYPE);
      spy.mockRestore();
    });
  });

  describe('getDisplayText()', () => {
    it('should answer the view type it could not build', () => {
      expect(createUnknownView().getDisplayText()).toBe(UNKNOWN_TYPE);
    });
  });

  describe('getIcon()', () => {
    it('should answer Obsidian\'s ghost glyph', () => {
      expect(createUnknownView().getIcon()).toBe('lucide-ghost');
    });
  });

  describe('getViewType()', () => {
    it('should keep the view type it could not build', () => {
      expect(createUnknownView().getViewType()).toBe(UNKNOWN_TYPE);
    });
  });

  describe('navigation', () => {
    it('should navigate, as the empty view it extends does', () => {
      expect(createUnknownView().navigation).toBe(true);
    });
  });
});
