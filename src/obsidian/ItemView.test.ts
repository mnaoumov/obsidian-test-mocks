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

async function createItemView(): Promise<ConcreteItemView> {
  const app = await App.createConfigured__();
  const leaf = WorkspaceLeaf.create2__(app);
  return new ConcreteItemView(leaf);
}

describe('ItemView', () => {
  it('should create an instance', async () => {
    const view = await createItemView();
    expect(view).toBeInstanceOf(ItemView);
  });

  it('should have a contentEl', async () => {
    const view = await createItemView();
    expect(view.contentEl).toBeInstanceOf(HTMLElement);
  });

  describe('addAction', () => {
    it('should return an HTMLElement', async () => {
      const view = await createItemView();
      const el = view.addAction('star', 'Star', () => {
        // Noop
      });
      expect(el).toBeInstanceOf(HTMLElement);
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', async () => {
      const view = await createItemView();
      const original: ItemViewOriginal = view.asOriginalType__();
      expect(original).toBe(view);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', async () => {
      const view = await createItemView();
      const mock = ItemView.fromOriginalType__(view.asOriginalType__());
      expect(mock).toBe(view);
    });
  });
});
