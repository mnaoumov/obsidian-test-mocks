import type {
  HoverPopover,
  RenderContext as RenderContextOriginal
} from 'obsidian';

import { castTo } from '../internal/Cast.ts';

export class RenderContext {
  public hoverPopover: HoverPopover | null = null;

  public asOriginalType__(): RenderContextOriginal {
    return castTo<RenderContextOriginal>(this);
  }
}
