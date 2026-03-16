import type {
  HoverPopover as HoverPopoverOriginal,
  RenderContext as RenderContextOriginal
} from 'obsidian';

import type { App } from './App.ts';

import { noop } from '../internal/noop.ts';
import { strictProxyForce } from '../internal/strict-proxy.ts';

export class RenderContext {
  public hoverPopover: HoverPopoverOriginal | null = null;

  protected constructor(_app: App) {
    const self = strictProxyForce(this);
    self.constructor__(_app);
    return self;
  }

  public static create__(app: App): RenderContext {
    return new RenderContext(app);
  }

  public static fromOriginalType__(value: RenderContextOriginal): RenderContext {
    return strictProxyForce(value, RenderContext);
  }

  public asOriginalType__(): RenderContextOriginal {
    return strictProxyForce<RenderContextOriginal>(this);
  }

  public constructor__(_app: App): void {
    noop();
  }
}
