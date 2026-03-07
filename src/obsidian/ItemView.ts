import type { IconName } from 'obsidian';

import { View } from './View.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

export abstract class ItemView extends View {
  public contentEl: HTMLElement = createDiv();

  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    ItemView.__constructor(this, leaf);
  }

  public static override __constructor(_instance: ItemView, _leaf: WorkspaceLeaf): void {
    // Spy hook.
  }

  public addAction(_icon: IconName, _title: string, _callback: (evt: MouseEvent) => unknown): HTMLElement {
    return createDiv();
  }
}
