import type {
  IconName as IconNameOriginal,
  ItemView as ItemViewOriginal
} from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { View } from './View.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

export abstract class ItemView extends View {
  public contentEl: HTMLElement;

  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.contentEl = createDiv();
    const self = strictMock(this);
    self.constructor3__(leaf);
    return self;
  }

  public addAction(_icon: IconNameOriginal, _title: string, _callback: (evt: MouseEvent) => unknown): HTMLElement {
    return createDiv();
  }

  public override asOriginalType__(): ItemViewOriginal {
    return castTo<ItemViewOriginal>(this);
  }

  public constructor3__(_leaf: WorkspaceLeaf): void {
    noop();
  }
}
