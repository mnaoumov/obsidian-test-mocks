import type { RenderContext as RenderContextOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { RenderContext } from './RenderContext.ts';

describe('RenderContext', () => {
  it('should create an instance via create__', () => {
    const app = App.createConfigured__();
    const context = RenderContext.create__(app);
    expect(context).toBeInstanceOf(RenderContext);
  });

  it('should have hoverPopover default to null', () => {
    const app = App.createConfigured__();
    const context = RenderContext.create__(app);
    expect(context.hoverPopover).toBeNull();
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const app = App.createConfigured__();
      const context = RenderContext.create__(app);
      const original: RenderContextOriginal = context.asOriginalType__();
      expect(original).toBe(context);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const app = App.createConfigured__();
      const context = RenderContext.create__(app);
      const mock = RenderContext.fromOriginalType__(context.asOriginalType__());
      expect(mock).toBe(context);
    });
  });
});
