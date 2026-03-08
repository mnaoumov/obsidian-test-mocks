import { castTo } from '../internal/Cast.ts';
import type {
  HoverPopover,
  RenderContext as RealRenderContext
} from 'obsidian';

export class RenderContext {
  public hoverPopover: HoverPopover | null = null;

  public asReal__(): RealRenderContext {
    return castTo<RealRenderContext>(this);
  }
}
