import type { View as ViewOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { Menu } from './Menu.ts';
import { View } from './View.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

class ConcreteView extends View {
  public getDisplayText(): string {
    return 'Test View';
  }

  public getViewType(): string {
    return 'test';
  }

  public override async onClose(): Promise<void> {
    await super.onClose();
  }

  public override async onOpen(): Promise<void> {
    await super.onOpen();
  }
}

class MinimalView extends View {
  public getDisplayText(): string {
    return 'Minimal View';
  }

  public getViewType(): string {
    return 'minimal';
  }

  public override async onClose(): Promise<void> {
    await super.onClose();
  }

  public override async onOpen(): Promise<void> {
    await super.onOpen();
  }
}

describe('View', () => {
  function createView(): ConcreteView {
    const app = App.createConfigured__();
    const leaf = WorkspaceLeaf.create2__(app);
    return new ConcreteView(leaf);
  }

  it('should have app property', () => {
    const view = createView();
    expect(view.app).toBeDefined();
  });

  it('should have containerEl', () => {
    const view = createView();
    expect(view.containerEl).toBeInstanceOf(HTMLElement);
  });

  it('should have a leaf reference', () => {
    const view = createView();
    expect(view.leaf).toBeInstanceOf(WorkspaceLeaf);
  });

  describe('getState / setState', () => {
    it('should return empty object by default', () => {
      const view = createView();
      expect(view.getState()).toEqual({});
    });

    it('should set and get state', async () => {
      const view = createView();
      await view.setState({ key: 'value' }, { history: false });
      expect(view.getState()).toEqual({ key: 'value' });
    });
  });

  describe('getEphemeralState / setEphemeralState', () => {
    it('should return empty object by default', () => {
      const view = createView();
      expect(view.getEphemeralState()).toEqual({});
    });

    it('should set and get ephemeral state', () => {
      const view = createView();
      const SCROLL_VALUE = 100;
      view.setEphemeralState({ scroll: SCROLL_VALUE });
      expect(view.getEphemeralState()).toEqual({ scroll: SCROLL_VALUE });
    });
  });

  describe('icon', () => {
    it('should default to the generic document glyph Obsidian uses', () => {
      const view = createView();
      expect(view.icon).toBe('lucide-file');
    });
  });

  describe('getIcon', () => {
    it('should return the icon', () => {
      const view = createView();
      view.icon = 'lucide-star';
      expect(view.getIcon()).toBe('lucide-star');
    });

    it('should fall back to the generic document glyph when the icon is emptied', () => {
      const view = createView();
      view.icon = '';
      expect(view.getIcon()).toBe('lucide-file');
    });
  });

  describe('onPaneMenu', () => {
    it('should not throw', () => {
      const view = createView();
      expect(() => {
        view.onPaneMenu(Menu.create2__().asOriginalType2__(), 'tab-header');
      }).not.toThrow();
    });
  });

  describe('onResize', () => {
    it('should not throw', () => {
      const view = createView();
      expect(() => {
        view.onResize();
      }).not.toThrow();
    });
  });

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original', () => {
      const view = createView();
      const original: ViewOriginal = view.asOriginalType2__();
      expect(original).toBe(view);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const view = createView();
      const mock = View.fromOriginalType2__(view.asOriginalType2__());
      expect(mock).toBe(view);
    });
  });

  describe('constructor2__()', () => {
    it('should be callable without throwing', () => {
      const view = createView();
      expect(() => {
        view.constructor2__(view.leaf);
      }).not.toThrow();
    });
  });

  describe('navigation', () => {
    it('should default to false, as the base view does in Obsidian', () => {
      const view = createView();
      expect(view.navigation).toBe(false);
    });
  });

  describe('onOpen', () => {
    it('should resolve without error', async () => {
      const view = createView();
      await expect(view.onOpen()).resolves.toBeUndefined();
    });
  });

  describe('onClose', () => {
    it('should resolve without error', async () => {
      const view = createView();
      await expect(view.onClose()).resolves.toBeUndefined();
    });
  });

  describe('base onOpen', () => {
    it('should resolve without error when not overridden', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const view = new MinimalView(leaf);
      const onOpen = view.onOpen.bind(view);
      await expect(onOpen()).resolves.toBeUndefined();
    });
  });

  describe('base onClose', () => {
    it('should resolve without error when not overridden', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const view = new MinimalView(leaf);
      const onClose = view.onClose.bind(view);
      await expect(onClose()).resolves.toBeUndefined();
    });
  });
  describe('open() / close()', () => {
    it('should append the view\'s element to the container and load it', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const view = new MinimalView(leaf);
      const containerEl = createDiv();

      await view.open(containerEl);

      expect(containerEl.contains(view.containerEl)).toBe(true);
      expect(view._loaded).toBe(true);
    });

    it('should detach the view\'s element and unload it on close', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const view = new MinimalView(leaf);
      const containerEl = createDiv();
      await view.open(containerEl);

      await view.close();

      expect(containerEl.contains(view.containerEl)).toBe(false);
      expect(view._loaded).toBe(false);
    });
  });
});
