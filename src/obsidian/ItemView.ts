import type {
  IconName as IconNameOriginal,
  ItemView as ItemViewOriginal
} from 'obsidian';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { View } from './View.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

export abstract class ItemView extends View {
  public contentEl: HTMLElement;

  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.contentEl = createDiv();
    const self = createMockOfUnsafe(this);
    self.constructor3__(leaf);
    return self;
  }

  public static fromOriginalType3__(value: ItemViewOriginal): ItemView {
    return createMockOfUnsafe<ItemView>(value);
  }

  public addAction(_icon: IconNameOriginal, _title: string, _callback: (evt: MouseEvent) => unknown): HTMLElement {
    return createDiv();
  }

  public asOriginalType3__(): ItemViewOriginal {
    return createMockOfUnsafe<ItemViewOriginal>(this);
  }

  public constructor3__(_leaf: WorkspaceLeaf): void {
    noop();
  }
}
