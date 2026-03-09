import type {
  HoverParent as HoverParentOriginal,
  HoverPopover as HoverPopoverOriginal,
  PopoverState as PopoverStateOriginal,
  WorkspaceLeaf as WorkspaceLeafOriginal
} from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { Component } from './Component.ts';

export class HoverPopover extends Component {
  public hoverEl: HTMLElement;
  public state: PopoverStateOriginal = 0;

  public constructor(_parent: HoverParentOriginal, _targetEl: HTMLElement | null, _waitTime?: number, _staticPos?: null) {
    super();
    this.hoverEl = createDiv();
  }

  public static create2__(parent: HoverParentOriginal, targetEl: HTMLElement | null, waitTime?: number, staticPos?: null): HoverPopover {
    return strictMock(new HoverPopover(parent, targetEl, waitTime, staticPos));
  }

  public static forLeaf__(_leaf: WorkspaceLeafOriginal): HoverPopover | null {
    return null;
  }

  public override asOriginalType__(): HoverPopoverOriginal {
    return castTo<HoverPopoverOriginal>(this);
  }
}
