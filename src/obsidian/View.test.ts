import type { View as ViewOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { castTo } from '../internal/cast.ts';
import { App } from './App.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

interface ViewWithProtectedMethods {
  onClose(): Promise<void>;
  onOpen(): Promise<void>;
}

// eslint-disable-next-line no-restricted-syntax -- View is abstract; extending it requires a top-level await dynamic import to define ConcreteView at module scope.
class ConcreteView extends (await import('./View.ts')).View {
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

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original', async () => {
      const view = await createView();
      const original: ViewOriginal = view.asOriginalType2__();
      expect(original).toBe(view);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', async () => {
      // eslint-disable-next-line no-restricted-syntax -- View is abstract and must be dynamically imported to access the static method.
      const { View } = await import('./View.ts');
      const view = await createView();
      const mock = View.fromOriginalType2__(view.asOriginalType2__());
      expect(mock).toBe(view);
    });
  });

  describe('constructor2__()', () => {
    it('should be callable without throwing', async () => {
      const view = await createView();
      expect(() => {
        view.constructor2__(view.leaf);
      }).not.toThrow();
    });
  });

  describe('navigation', () => {
    it('should default to true', async () => {
      const view = await createView();
      expect(view.navigation).toBe(true);
    });
  });

  describe('onOpen', () => {
    it('should resolve without error', async () => {
      const view = await createView();
      // Access protected method for coverage.
      await expect(castTo<ViewWithProtectedMethods>(view).onOpen()).resolves.toBeUndefined();
    });
  });

  describe('onClose', () => {
    it('should resolve without error', async () => {
      const view = await createView();
      // Access protected method for coverage.
      await expect(castTo<ViewWithProtectedMethods>(view).onClose()).resolves.toBeUndefined();
    });
  });
});
