import type { TextFileView as TextFileViewOriginal } from 'obsidian';

import type { TFile } from './TFile.ts';

import { castTo } from '../internal/cast.ts';
import {
  noop,
  noopAsync
} from '../internal/noop.ts';
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
    await noopAsync();
  }

  public override async onUnloadFile(_file: TFile): Promise<void> {
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
