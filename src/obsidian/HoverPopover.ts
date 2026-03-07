import type {
  HoverParent,
  PopoverState,
  WorkspaceLeaf
} from 'obsidian';

import { Component } from './Component.ts';

export class HoverPopover extends Component {
  public hoverEl: HTMLElement = createDiv();
  public state: PopoverState = 0;

  public constructor(_parent: HoverParent, _targetEl: HTMLElement | null, _waitTime?: number, _staticPos?: null) {
    super();
  }

  public static forLeaf(_leaf: WorkspaceLeaf): HoverPopover | null {
    return null;
  }
}
