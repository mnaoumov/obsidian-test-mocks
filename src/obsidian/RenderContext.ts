import type {
  HoverPopover as HoverPopoverOriginal,
  RenderContext as RenderContextOriginal
} from 'obsidian';

import type { App } from './App.ts';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';

export class RenderContext {
  public hoverPopover: HoverPopoverOriginal | null = null;

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
