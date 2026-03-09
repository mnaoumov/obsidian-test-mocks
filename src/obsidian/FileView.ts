import type {
  FileView as FileViewOriginal,
  ViewStateResult
} from 'obsidian';

import type { TFile } from './TFile.ts';

import { castTo } from '../internal/Cast.ts';
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

  // eslint-disable-next-line @typescript-eslint/no-empty-function -- Override point for subclasses.
  public override onload(): void {
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function -- Override point for subclasses.
  public async onLoadFile(_file: TFile): Promise<void> {
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function -- Override point for subclasses.
  public async onRename(_file: TFile): Promise<void> {
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function -- Override point for subclasses.
  public async onUnloadFile(_file: TFile): Promise<void> {
  }

  public override async setState(state: unknown, result: ViewStateResult): Promise<void> {
    await super.setState(state, result);
  }
}
