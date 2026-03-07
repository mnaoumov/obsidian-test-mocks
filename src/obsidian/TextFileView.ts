import type { TFile } from './TFile.ts';

import {
  noop,
  noopAsync
} from '../internal/Noop.ts';
import { EditableFileView } from './EditableFileView.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

export abstract class TextFileView extends EditableFileView {
  public data = '';

  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  public abstract clear(): void;

  public abstract getViewData(): string;

  public async onLoadFile(_file: TFile): Promise<void> {
    await noopAsync();
  }

  public async onUnloadFile(_file: TFile): Promise<void> {
    await noopAsync();
  }

  public requestSave(): void {
    noop();
  }

  public async save(_clear?: boolean): Promise<void> {
    await noopAsync();
  }

  public abstract setViewData(data: string, clear: boolean): void;
}
