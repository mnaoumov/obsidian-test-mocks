import type {
  HoverParent,
  HoverPopover as HoverPopoverOriginal,
  PopoverState,
  WorkspaceLeaf
} from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { Component } from './Component.ts';

export class HoverPopover extends Component {
  public hoverEl: HTMLElement;
  public state: PopoverState = 0;

  public constructor(_parent: HoverParent, _targetEl: HTMLElement | null, _waitTime?: number, _staticPos?: null) {
    super();
    this.hoverEl = createDiv();
    return strictMock(this);
  }

  public static forLeaf(_leaf: WorkspaceLeaf): HoverPopover | null {
    return null;
  }

  public override asOriginalType__(): HoverPopoverOriginal {
    return castTo<HoverPopoverOriginal>(this);
  }
}
