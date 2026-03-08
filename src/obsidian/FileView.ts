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
    const mock = strictMock(this);
    FileView.constructor__(mock, leaf);
    return mock;
  }

  public static override constructor__(_instance: FileView, _leaf: WorkspaceLeaf): void {
    // Spy hook.
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
  }

  public async onLoadFile(_file: TFile): Promise<void> {
  }

  public async onRename(_file: TFile): Promise<void> {
  }

  public async onUnloadFile(_file: TFile): Promise<void> {
  }

  public override async setState(state: unknown, result: ViewStateResult): Promise<void> {
    await super.setState(state, result);
  }
}
