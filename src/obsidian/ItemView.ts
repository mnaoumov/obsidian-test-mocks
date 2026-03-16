import type {
  IconName as IconNameOriginal,
  ItemView as ItemViewOriginal
} from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxyForce } from '../internal/strict-proxy.ts';
import { View } from './View.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

export abstract class ItemView extends View {
  public contentEl: HTMLElement;

  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.contentEl = createDiv();
    const self = strictProxyForce(this);
    self.constructor3__(leaf);
    return self;
  }

  public static fromOriginalType3__(value: ItemViewOriginal): ItemView {
    return strictProxyForce(value, ItemView);
  }

  public addAction(_icon: IconNameOriginal, _title: string, _callback: (evt: MouseEvent) => unknown): HTMLElement {
    return createDiv();
  }

  public asOriginalType3__(): ItemViewOriginal {
    return strictProxyForce<ItemViewOriginal>(this);
  }

  public constructor3__(_leaf: WorkspaceLeaf): void {
    noop();
  }
}
