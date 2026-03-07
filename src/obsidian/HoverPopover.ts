import type {
  HoverParent,
  PopoverState,
  WorkspaceLeaf
} from 'obsidian';

import { strictMock } from '../internal/StrictMock.ts';
import { Component } from './Component.ts';

export class HoverPopover extends Component {
  public hoverEl: HTMLElement;
  public state: PopoverState = 0;

  public constructor(_parent: HoverParent, _targetEl: HTMLElement | null, _waitTime?: number, _staticPos?: null) {
    super();
    this.hoverEl = createDiv();
    HoverPopover.__constructor(this, _parent, _targetEl, _waitTime, _staticPos);
    return strictMock(this);
  }

  public static override __constructor(_instance: HoverPopover, _parent: HoverParent, _targetEl: HTMLElement | null, _waitTime?: number, _staticPos?: null): void {
    // Spy hook.
  }

  public static forLeaf(_leaf: WorkspaceLeaf): HoverPopover | null {
    return null;
  }
}
