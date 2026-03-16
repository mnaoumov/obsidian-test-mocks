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

export class HoverPopover extends Component {
  public hoverEl: HTMLElement;
  public state: PopoverStateOriginal = 0;

  public constructor(parent: HoverParentOriginal, targetEl: HTMLElement | null, waitTime?: number, staticPos?: null | PointOriginal) {
    super();
    this.hoverEl = createDiv();
    const self = strictProxy(this);
    self.constructor2__(parent, targetEl, waitTime, staticPos);
    return self;
  }

  public static create2__(parent: HoverParentOriginal, targetEl: HTMLElement | null, waitTime?: number, staticPos?: null | PointOriginal): HoverPopover {
    return new HoverPopover(parent, targetEl, waitTime, staticPos);
  }

  public static forLeaf__(_leaf: WorkspaceLeafOriginal): HoverPopover | null {
    return null;
  }

  public static fromOriginalType2__(value: HoverPopoverOriginal): HoverPopover {
    return strictProxy(value, HoverPopover);
  }

  public asOriginalType2__(): HoverPopoverOriginal {
    return strictProxy<HoverPopoverOriginal>(this);
  }

  public constructor2__(_parent: HoverParentOriginal, _targetEl: HTMLElement | null, _waitTime?: number, _staticPos?: null | PointOriginal): void {
    noop();
  }
}
