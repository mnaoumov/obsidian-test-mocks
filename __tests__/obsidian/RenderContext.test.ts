import type { RenderContext as RenderContextOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from '../../src/obsidian/App.ts';
import { RenderContext } from '../../src/obsidian/RenderContext.ts';

describe('RenderContext', () => {
  it('should create an instance via create__', async () => {
    const app = await App.createConfigured__();
    const ctx = RenderContext.create__(app);
    expect(ctx).toBeInstanceOf(RenderContext);
  });

  it('should have hoverPopover default to null', async () => {
    const app = await App.createConfigured__();
    const ctx = RenderContext.create__(app);
    expect(ctx.hoverPopover).toBeNull();
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', async () => {
      const app = await App.createConfigured__();
      const ctx = RenderContext.create__(app);
      const original: RenderContextOriginal = ctx.asOriginalType__();
      expect(original).toBe(ctx);
    });
  });
});
