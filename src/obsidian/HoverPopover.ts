/**
 * @file
 *
 * Mock of Obsidian's `HoverPopover`, the floating preview shown when hovering a link.
 */

import type {
  HoverParent as HoverParentOriginal,
  HoverPopover as HoverPopoverOriginal,
  Point as PointOriginal,
  PopoverState as PopoverStateOriginal,
  WorkspaceLeaf as WorkspaceLeafOriginal
} from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { Component } from './Component.ts';

/**
 * Mock of Obsidian's `HoverPopover`.
 *
 * Nothing is shown and no timer runs: the popover owns a detached {@link HoverPopover.hoverEl} and its state
 * stays where it was set.
 */
export class HoverPopover extends Component {
  /**
   * The popover's element, which holds the preview content.
   */
  public hoverEl: HTMLElement;

  /**
   * The popover's lifecycle state (showing, hiding and so on); starts at `0`.
   */
  public state: PopoverStateOriginal = 0;

  /**
   * Creates a popover for a hover parent.
   *
   * @param parent - The hover parent the popover attaches to.
   * @param targetEl - The element being hovered, or `null` when there is none.
   * @param waitTime - The delay, in milliseconds, before the popover shows.
   * @param staticPos - A fixed position to show the popover at, instead of next to `targetEl`.
   */
  public constructor(parent: HoverParentOriginal, targetEl: HTMLElement | null, waitTime?: number, staticPos?: null | PointOriginal) {
    super();
    this.hoverEl = createDiv();
    const self = strictProxy(this);
    self.constructor2__(parent, targetEl, waitTime, staticPos);
    return self;
  }

  /**
   * Mock-only factory: creates a hover popover, spyable via `vi.spyOn(HoverPopover, 'create2__')`. The subclass
   * variant of {@link Component.create__}.
   *
   * @param parent - The hover parent the popover attaches to.
   * @param targetEl - The element being hovered, or `null` when there is none.
   * @param waitTime - The delay, in milliseconds, before the popover shows.
   * @param staticPos - A fixed position to show the popover at.
   * @returns The new hover popover.
   */
  public static create2__(parent: HoverParentOriginal, targetEl: HTMLElement | null, waitTime?: number, staticPos?: null | PointOriginal): HoverPopover {
    return new HoverPopover(parent, targetEl, waitTime, staticPos);
  }

  /**
   * Mock-only: looks up the hover popover open for a leaf. The mock tracks none, so it always returns `null`.
   *
   * @param _leaf - The leaf to look up.
   * @returns Always `null`.
   */
  public static forLeaf__(_leaf: WorkspaceLeafOriginal): HoverPopover | null {
    return null;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `HoverPopover` as this mock.
   *
   * @param value - The value typed as the original `HoverPopover`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType2__(value: HoverPopoverOriginal): HoverPopover {
    return strictProxy(value, HoverPopover);
  }

  /**
   * Mock-only: views this mock as Obsidian's `HoverPopover` type.
   *
   * @returns The same object, typed as the original `HoverPopover`.
   */
  public asOriginalType2__(): HoverPopoverOriginal {
    return strictProxy<HoverPopoverOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(HoverPopover.prototype, 'constructor2__')`.
   *
   * @param _parent - The hover parent the popover was created with.
   * @param _targetEl - The target element the popover was created with.
   * @param _waitTime - The wait time the popover was created with.
   * @param _staticPos - The static position the popover was created with.
   */
  public constructor2__(_parent: HoverParentOriginal, _targetEl: HTMLElement | null, _waitTime?: number, _staticPos?: null | PointOriginal): void {
    noop();
  }
}
