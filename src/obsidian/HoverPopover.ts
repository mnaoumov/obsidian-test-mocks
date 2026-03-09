import type {
  HoverParent,
  HoverPopover as HoverPopoverOriginal,
  PopoverState,
  WorkspaceLeaf
} from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { Component } from './Component.ts';

export class HoverPopover extends Component {
  public hoverEl: HTMLElement;
  public state: PopoverState = 0;

  public constructor(_parent: HoverParent, _targetEl: HTMLElement | null, _waitTime?: number, _staticPos?: null) {
    super();
    this.hoverEl = createDiv();
  }

  public static create2__(parent: HoverParent, targetEl: HTMLElement | null, waitTime?: number, staticPos?: null): HoverPopover {
    return strictMock(new HoverPopover(parent, targetEl, waitTime, staticPos));
  }

  public static forLeaf__(_leaf: WorkspaceLeaf): HoverPopover | null {
    return null;
  }

  public override asOriginalType__(): HoverPopoverOriginal {
    return castTo<HoverPopoverOriginal>(this);
  }
}
