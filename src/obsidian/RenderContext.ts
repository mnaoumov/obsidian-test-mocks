import type {
  HoverPopover,
  RenderContext as RenderContextOriginal
} from 'obsidian';

import type { App } from './App.ts';

import { castTo } from '../internal/Cast.ts';
import { noop } from '../internal/Noop.ts';
import { strictMock } from '../internal/StrictMock.ts';

export class RenderContext {
  public hoverPopover: HoverPopover | null = null;

  protected constructor(_app: App) {
    noop();
  }

  public static create__(app: App): RenderContext {
    return strictMock(new RenderContext(app));
  }

  public asOriginalType__(): RenderContextOriginal {
    return castTo<RenderContextOriginal>(this);
  }
}
