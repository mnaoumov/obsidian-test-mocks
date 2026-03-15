import type { QueryController as QueryControllerOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { QueryController } from './QueryController.ts';

describe('QueryController', () => {
  it('should create an instance via create2__', async () => {
    const app = await App.createConfigured__();
    const ctrl = QueryController.create2__(app, null, createDiv());
    expect(ctrl).toBeInstanceOf(QueryController);
  });

  it('should accept optional currentFile parameter', async () => {
    const app = await App.createConfigured__();
    const ctrl = QueryController.create2__(app, null, createDiv(), null);
    expect(ctrl).toBeInstanceOf(QueryController);
  });

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original', async () => {
      const app = await App.createConfigured__();
      const ctrl = QueryController.create2__(app, null, createDiv());
      const original: QueryControllerOriginal = ctrl.asOriginalType2__();
      expect(original).toBe(ctrl);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', async () => {
      const app = await App.createConfigured__();
      const ctrl = QueryController.create2__(app, null, createDiv());
      const mock = QueryController.fromOriginalType2__(ctrl.asOriginalType2__());
      expect(mock).toBe(ctrl);
    });
  });
});
