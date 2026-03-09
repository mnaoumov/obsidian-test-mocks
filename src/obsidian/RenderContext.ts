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
  }

  public static create__(app: App): RenderContext {
    return strictMock(new RenderContext(app));
  }

  public asOriginalType__(): RenderContextOriginal {
    return castTo<RenderContextOriginal>(this);
  }
}
