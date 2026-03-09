import type {
  FileView as FileViewOriginal,
  ViewStateResult
} from 'obsidian';

import type { TFile } from './TFile.ts';

import { castTo } from '../internal/Cast.ts';
import { noop } from '../internal/Noop.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { ItemView } from './ItemView.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

export abstract class FileView extends ItemView {
  public allowNoFile = false;
  public file: null | TFile = null;
  public override navigation = true;

  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    return strictMock(this);
  }

  public override asOriginalType__(): FileViewOriginal {
    return castTo<FileViewOriginal>(this);
  }

  public canAcceptExtension(_extension: string): boolean {
    return false;
  }

  public getDisplayText(): string {
    return this.file?.basename ?? '';
  }

  public override getState(): Record<string, unknown> {
    return { ...super.getState() };
  }

  public override onload(): void {
    noop();
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- Implements async obsidian.d.ts interface.
  public async onLoadFile(_file: TFile): Promise<void> {
    noop();
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- Implements async obsidian.d.ts interface.
  public async onRename(_file: TFile): Promise<void> {
    noop();
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- Implements async obsidian.d.ts interface.
  public async onUnloadFile(_file: TFile): Promise<void> {
    noop();
  }

  public override async setState(state: unknown, result: ViewStateResult): Promise<void> {
    await super.setState(state, result);
  }
}
