import type { BasesView as BasesViewOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from '../../src/obsidian/App.ts';
import { BasesView } from '../../src/obsidian/BasesView.ts';
import { QueryController } from '../../src/obsidian/QueryController.ts';

class ConcreteBasesView extends BasesView {
  // Intentionally empty for testing.
}

describe('BasesView', () => {
  async function createBasesView(): Promise<ConcreteBasesView> {
    const app = await App.createConfigured__();
    const controller = QueryController.create2__(app, null, createDiv());
    return new ConcreteBasesView(controller);
  }

  it('should create an instance', async () => {
    const view = await createBasesView();
    expect(view).toBeInstanceOf(BasesView);
  });

  it('should throw when accessing an unmocked property', async () => {
    const view = await createBasesView();
    const record = view as unknown as Record<string, unknown>;
    expect(() => record['nonExistentProperty']).toThrow();
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original obsidian type', async () => {
      const view = await createBasesView();
      const original: BasesViewOriginal = view.asOriginalType__();
      expect(original).toBe(view);
    });
  });
});
