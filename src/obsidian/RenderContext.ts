import type {
  HoverPopover as HoverPopoverOriginal,
  RenderContext as RenderContextOriginal
} from 'obsidian';

import type { App } from './App.ts';

import {
  createMockOf,
  createMockOfUnsafe
} from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';

export class RenderContext {
  public hoverPopover: HoverPopoverOriginal | null = null;

  protected constructor(_app: App) {
    const self = createMockOf(this);
    self.constructor__(_app);
    return self;
  }

  public static create__(app: App): RenderContext {
    return new RenderContext(app);
  }

  public static fromOriginalType__(value: RenderContextOriginal): RenderContext {
    return createMockOfUnsafe<RenderContext>(value);
  }

  public asOriginalType__(): RenderContextOriginal {
    return createMockOfUnsafe<RenderContextOriginal>(this);
  }

  public constructor__(_app: App): void {
    noop();
  }
}
