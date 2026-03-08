import type {
  HoverPopover,
  RenderContext as RealRenderContext
} from 'obsidian';
import { strictCastTo } from '../internal/StrictMock.ts';

export class RenderContext {
  public hoverPopover: HoverPopover | null = null;

  public asReal__(): RealRenderContext {
    return strictCastTo<RealRenderContext>(this);
  }
}
