import type {
  HoverParent as HoverParentOriginal,
  HoverPopover as HoverPopoverOriginal,
  Point as PointOriginal,
  PopoverState as PopoverStateOriginal,
  WorkspaceLeaf as WorkspaceLeafOriginal
} from 'obsidian';

import { noop } from '../internal/noop.ts';
import {
  mergePrototype,
  strictProxyForce
} from '../internal/strict-proxy.ts';
import { Component } from './Component.ts';

export class HoverPopover extends Component {
  public hoverEl: HTMLElement;
  public state: PopoverStateOriginal = 0;

  public constructor(_parent: HoverParentOriginal, _targetEl: HTMLElement | null, _waitTime?: number, _staticPos?: null | PointOriginal) {
    super();
    this.hoverEl = createDiv();
    const self = strictProxyForce(this);
    self.constructor2__(_parent, _targetEl, _waitTime, _staticPos);
    return self;
  }

  public static create2__(parent: HoverParentOriginal, targetEl: HTMLElement | null, waitTime?: number, staticPos?: null | PointOriginal): HoverPopover {
    return new HoverPopover(parent, targetEl, waitTime, staticPos);
  }

  public static forLeaf__(_leaf: WorkspaceLeafOriginal): HoverPopover | null {
    return null;
  }

  public static fromOriginalType2__(value: HoverPopoverOriginal): HoverPopover {
    return mergePrototype(HoverPopover, value);
  }

  public asOriginalType2__(): HoverPopoverOriginal {
    return strictProxyForce<HoverPopoverOriginal>(this);
  }

  public constructor2__(_parent: HoverParentOriginal, _targetEl: HTMLElement | null, _waitTime?: number, _staticPos?: null | PointOriginal): void {
    noop();
  }
}
