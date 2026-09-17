/**
 * @file
 *
 * Mock of Obsidian's `RenderContext`, the context Bases values are rendered in.
 */

import type {
  HoverPopover as HoverPopoverOriginal,
  RenderContext as RenderContextOriginal
} from 'obsidian';

import type { App } from './App.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

/**
 * Mock of Obsidian's `RenderContext`, which provides utilities for rendering Bases values and acts as the hover
 * parent for popovers they open.
 */
export class RenderContext {
  /**
   * The hover popover currently attached to this context, or `null` when none is open.
   */
  public hoverPopover: HoverPopoverOriginal | null = null;

  /**
   * Creates a render context. Use {@link RenderContext.create__} from outside the class.
   *
   * @param app - The app instance.
   */
  protected constructor(app: App) {
    const self = strictProxy(this);
    self.constructor__(app);
    return self;
  }

  /**
   * Mock-only factory: creates a render context, spyable via `vi.spyOn(RenderContext, 'create__')`.
   *
   * @param app - The app instance.
   * @returns The new render context.
   */
  public static create__(app: App): RenderContext {
    return new RenderContext(app);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `RenderContext` as this mock.
   *
   * @param value - The value typed as the original `RenderContext`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: RenderContextOriginal): RenderContext {
    return strictProxy(value, RenderContext);
  }

  /**
   * Mock-only: views this mock as Obsidian's `RenderContext` type.
   *
   * @returns The same object, typed as the original `RenderContext`.
   */
  public asOriginalType__(): RenderContextOriginal {
    return strictProxy<RenderContextOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(RenderContext.prototype, 'constructor__')`.
   *
   * @param _app - The app the context was created with.
   */
  public constructor__(_app: App): void {
    noop();
  }
}
