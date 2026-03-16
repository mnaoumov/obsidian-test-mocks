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
    const ctx = RenderContext.create__(app);
    expect(ctx).toBeInstanceOf(RenderContext);
  });

  it('should have hoverPopover default to null', () => {
    const app = App.createConfigured__();
    const ctx = RenderContext.create__(app);
    expect(ctx.hoverPopover).toBeNull();
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const app = App.createConfigured__();
      const ctx = RenderContext.create__(app);
      const original: RenderContextOriginal = ctx.asOriginalType__();
      expect(original).toBe(ctx);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const app = App.createConfigured__();
      const ctx = RenderContext.create__(app);
      const mock = RenderContext.fromOriginalType__(ctx.asOriginalType__());
      expect(mock).toBe(ctx);
    });
  });
});
