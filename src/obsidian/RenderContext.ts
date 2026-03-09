import type {
  HoverPopover,
  RenderContext as RenderContextOriginal
} from 'obsidian';

import type { App } from './App.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';

export class RenderContext {
  public hoverPopover: HoverPopover | null = null;

  protected constructor(_app: App) {
    const mock = strictMock(this);
    RenderContext.constructor__(mock, _app);
    return mock;
  }

  public static constructor__(_instance: RenderContext, _app: App): void {
    // Spy hook.
  }

  public static create__(_app: App): RenderContext {
    return new RenderContext(_app);
  }

  public asOriginalType__(): RenderContextOriginal {
    return castTo<RenderContextOriginal>(this);
  }
}
