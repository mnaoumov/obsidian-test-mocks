import type { BasesView as BasesViewOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { BasesView } from './BasesView.ts';
import { QueryController } from './QueryController.ts';

class ConcreteBasesView extends BasesView {
  public constructor(controller: QueryController) {
    super(controller);
  }
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

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original obsidian type', async () => {
      const view = await createBasesView();
      const original: BasesViewOriginal = view.asOriginalType2__();
      expect(original).toBe(view);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', async () => {
      const view = await createBasesView();
      const mock = BasesView.fromOriginalType2__(view.asOriginalType2__());
      expect(mock).toBe(view);
    });
  });
});
