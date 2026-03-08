import type {
  HoverParent,
  HoverPopover as RealHoverPopover,
  PopoverState,
  WorkspaceLeaf
} from 'obsidian';

import {
  strictCastTo,
  strictMock
} from '../internal/StrictMock.ts';
import { Component } from './Component.ts';

export class HoverPopover extends Component {
  public hoverEl: HTMLElement;
  public state: PopoverState = 0;

  public constructor(_parent: HoverParent, _targetEl: HTMLElement | null, _waitTime?: number, _staticPos?: null) {
    super();
    this.hoverEl = createDiv();
    const mock = strictMock(this);
    HoverPopover.constructor__(mock, _parent, _targetEl, _waitTime, _staticPos);
    return mock;
  }

  public static override constructor__(
    _instance: HoverPopover,
    _parent: HoverParent,
    _targetEl: HTMLElement | null,
    _waitTime?: number,
    _staticPos?: null
  ): void {
    // Spy hook.
  }

  public static forLeaf(_leaf: WorkspaceLeaf): HoverPopover | null {
    return null;
  }

  public override asReal__(): RealHoverPopover {
    return strictCastTo<RealHoverPopover>(this);
  }
}
