import type {
  IconName,
  ItemView as ItemViewOriginal
} from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { View } from './View.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

export abstract class ItemView extends View {
  public contentEl: HTMLElement;

  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.contentEl = createDiv();
    return strictMock(this);
  }

  public addAction(_icon: IconName, _title: string, _callback: (evt: MouseEvent) => unknown): HTMLElement {
    return createDiv();
  }

  public override asOriginalType__(): ItemViewOriginal {
    return castTo<ItemViewOriginal>(this);
  }
}
