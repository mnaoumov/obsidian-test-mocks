import type { TextFileView as TextFileViewOriginal } from 'obsidian';

import type { TFile } from './TFile.ts';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { EditableFileView } from './EditableFileView.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

export abstract class TextFileView extends EditableFileView {
  public data = '';

  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    const self = strictMock(this);
    self.constructor6__(leaf);
    return self;
  }

  public override asOriginalType__(): TextFileViewOriginal {
    return castTo<TextFileViewOriginal>(this);
  }

  public abstract clear(): void;

  public constructor6__(_leaf: WorkspaceLeaf): void {
    noop();
  }

  public abstract getViewData(): string;

  public override async onLoadFile(_file: TFile): Promise<void> {
    // Lifecycle hook for subclasses to override.
  }

  public override async onUnloadFile(_file: TFile): Promise<void> {
    // Lifecycle hook for subclasses to override.
  }

  public requestSave(): void {
    // Scheduling hint — not simulated.
  }

  public async save(_clear?: boolean): Promise<void> {
    // Empty async — save is not simulated.
  }

  public abstract setViewData(data: string, clear: boolean): void;
}
