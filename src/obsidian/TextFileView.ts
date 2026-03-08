import type { TextFileView as TextFileViewOriginal } from 'obsidian';

import type { TFile } from './TFile.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { EditableFileView } from './EditableFileView.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

export abstract class TextFileView extends EditableFileView {
  public data = '';

  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    const mock = strictMock(this);
    TextFileView.constructor__(mock, leaf);
    return mock;
  }

  public static override constructor__(_instance: TextFileView, _leaf: WorkspaceLeaf): void {
    // Spy hook.
  }

  public override asOriginalType__(): TextFileViewOriginal {
    return castTo<TextFileViewOriginal>(this);
  }

  public abstract clear(): void;

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
