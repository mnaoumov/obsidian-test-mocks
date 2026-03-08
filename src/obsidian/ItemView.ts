import type { IconName } from 'obsidian';

import { strictMock } from '../internal/StrictMock.ts';
import { View } from './View.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

export abstract class ItemView extends View {
  public contentEl: HTMLElement;

  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.contentEl = createDiv();
    const mock = strictMock(this);
    ItemView.constructor__(mock, leaf);
    return mock;
  }

  public static override constructor__(_instance: ItemView, _leaf: WorkspaceLeaf): void {
    // Spy hook.
  }

  public addAction(_icon: IconName, _title: string, _callback: (evt: MouseEvent) => unknown): HTMLElement {
    return createDiv();
  }
}
