import type { BasesView as BasesViewOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { ensureGenericObject } from '../internal/type-guards.ts';
import { App } from './App.ts';
import { BasesView } from './BasesView.ts';
import { QueryController } from './QueryController.ts';

class ConcreteBasesView extends BasesView {
  public constructor(controller: QueryController) {
    super(controller);
  }
}

describe('BasesView', () => {
  function createBasesView(): ConcreteBasesView {
    const app = App.createConfigured__();
    const controller = QueryController.create2__(app, null, createDiv());
    return new ConcreteBasesView(controller);
  }

  it('should create an instance', () => {
    const view = createBasesView();
    expect(view).toBeInstanceOf(BasesView);
  });

  it('should throw when accessing an unmocked property', () => {
    const view = createBasesView();
    const record = ensureGenericObject(view);
    expect(() => record['nonExistentProperty']).toThrow();
  });

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original obsidian type', () => {
      const view = createBasesView();
      const original: BasesViewOriginal = view.asOriginalType2__();
      expect(original).toBe(view);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const view = createBasesView();
      const mock = BasesView.fromOriginalType2__(view.asOriginalType2__());
      expect(mock).toBe(view);
    });
  });
});
