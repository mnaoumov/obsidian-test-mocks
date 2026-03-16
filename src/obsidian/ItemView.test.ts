import type { ItemView as ItemViewOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { ItemView } from './ItemView.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

class ConcreteItemView extends ItemView {
  public getDisplayText(): string {
    return 'Test Item View';
  }

  public getViewType(): string {
    return 'test-item';
  }
}

function createItemView(): ConcreteItemView {
  const app = App.createConfigured__();
  const leaf = WorkspaceLeaf.create2__(app);
  return new ConcreteItemView(leaf);
}

describe('ItemView', () => {
  it('should create an instance', () => {
    const view = createItemView();
    expect(view).toBeInstanceOf(ItemView);
  });

  it('should have a contentEl', () => {
    const view = createItemView();
    expect(view.contentEl).toBeInstanceOf(HTMLElement);
  });

  describe('addAction', () => {
    it('should return an HTMLElement', () => {
      const view = createItemView();
      const el = view.addAction('star', 'Star', () => {
        // Noop
      });
      expect(el).toBeInstanceOf(HTMLElement);
    });
  });

  describe('asOriginalType3__', () => {
    it('should return the same instance typed as the original', () => {
      const view = createItemView();
      const original: ItemViewOriginal = view.asOriginalType3__();
      expect(original).toBe(view);
    });
  });

  describe('fromOriginalType3__', () => {
    it('should return the same instance typed as the mock type', () => {
      const view = createItemView();
      const mock = ItemView.fromOriginalType3__(view.asOriginalType3__());
      expect(mock).toBe(view);
    });
  });
});
