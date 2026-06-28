import type { BasesView as BasesViewOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { noop } from '../internal/noop.ts';
import { ensureGenericObject } from '../internal/type-guards.ts';
import { App } from './App.ts';
import { BasesQueryResult } from './BasesQueryResult.ts';
import { BasesView } from './BasesView.ts';
import { BasesViewConfig } from './BasesViewConfig.ts';
import { QueryController } from './QueryController.ts';

class ConcreteBasesView extends BasesView {
  public readonly type = 'concrete';

  public constructor(controller: QueryController) {
    super(controller);
  }

  public onDataUpdated(): void {
    noop();
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

  describe('type', () => {
    it('should expose the concrete view type', () => {
      const view = createBasesView();
      expect(view.type).toBe('concrete');
    });
  });

  describe('app', () => {
    it('should expose an App instance', () => {
      const view = createBasesView();
      expect(view.app).toBeInstanceOf(App);
    });
  });

  describe('config', () => {
    it('should expose a BasesViewConfig instance', () => {
      const view = createBasesView();
      expect(view.config).toBeInstanceOf(BasesViewConfig);
    });
  });

  describe('allProperties', () => {
    it('should default to an empty array', () => {
      const view = createBasesView();
      expect(view.allProperties).toEqual([]);
    });
  });

  describe('data', () => {
    it('should expose a BasesQueryResult instance', () => {
      const view = createBasesView();
      expect(view.data).toBeInstanceOf(BasesQueryResult);
    });
  });

  describe('onDataUpdated', () => {
    it('should not throw', () => {
      const view = createBasesView();
      expect(() => {
        view.onDataUpdated();
      }).not.toThrow();
    });
  });

  describe('createFileForView', () => {
    it('should resolve', async () => {
      const view = createBasesView();
      await expect(view.createFileForView()).resolves.toBeUndefined();
    });
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
