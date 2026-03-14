import type { View as ViewOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from '../../src/obsidian/App.ts';
import { WorkspaceLeaf } from '../../src/obsidian/WorkspaceLeaf.ts';

// Concrete subclass for testing the abstract View
class ConcreteView extends (await import('../../src/obsidian/View.ts')).View {
  public getDisplayText(): string {
    return 'Test View';
  }

  public getViewType(): string {
    return 'test';
  }
}

describe('View', () => {
  async function createView(): Promise<ConcreteView> {
    const app = await App.createConfigured__();
    const leaf = WorkspaceLeaf.create2__(app);
    return new ConcreteView(leaf);
  }

  it('should have app property', async () => {
    const view = await createView();
    expect(view.app).toBeDefined();
  });

  it('should have containerEl', async () => {
    const view = await createView();
    expect(view.containerEl).toBeInstanceOf(HTMLElement);
  });

  it('should have a leaf reference', async () => {
    const view = await createView();
    expect(view.leaf).toBeInstanceOf(WorkspaceLeaf);
  });

  describe('getState / setState', () => {
    it('should return empty object by default', async () => {
      const view = await createView();
      expect(view.getState()).toEqual({});
    });

    it('should set and get state', async () => {
      const view = await createView();
      await view.setState({ key: 'value' }, { history: false });
      expect(view.getState()).toEqual({ key: 'value' });
    });
  });

  describe('getEphemeralState / setEphemeralState', () => {
    it('should return empty object by default', async () => {
      const view = await createView();
      expect(view.getEphemeralState()).toEqual({});
    });

    it('should set and get ephemeral state', async () => {
      const view = await createView();
      const SCROLL_VALUE = 100;
      view.setEphemeralState({ scroll: SCROLL_VALUE });
      expect(view.getEphemeralState()).toEqual({ scroll: SCROLL_VALUE });
    });
  });

  describe('getIcon', () => {
    it('should return the icon', async () => {
      const view = await createView();
      expect(view.getIcon()).toBe('');
    });
  });

  describe('onPaneMenu', () => {
    it('should not throw', async () => {
      const view = await createView();
      expect(() => {
        view.onPaneMenu({} as never, 'tab-header');
      }).not.toThrow();
    });
  });

  describe('onResize', () => {
    it('should not throw', async () => {
      const view = await createView();
      expect(() => {
        view.onResize();
      }).not.toThrow();
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', async () => {
      const view = await createView();
      const original: ViewOriginal = view.asOriginalType__();
      expect(original).toBe(view);
    });
  });
});
