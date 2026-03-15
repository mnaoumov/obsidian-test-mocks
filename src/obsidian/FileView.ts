import type {
  FileView as FileViewOriginal,
  ViewStateResult as ViewStateResultOriginal
} from 'obsidian';

import type { TFile } from './TFile.ts';

import { castTo } from '../internal/cast.ts';
import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { ItemView } from './ItemView.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

export abstract class FileView extends ItemView {
  public allowNoFile = false;
  public file: null | TFile = null;
  public override navigation = true;

  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    const self = strictMock(this);
    self.constructor4__(leaf);
    return self;
  }

  public static override fromOriginalType__(value: FileViewOriginal): FileView {
    return castTo<FileView>(value);
  }

  public override asOriginalType__(): FileViewOriginal {
    return castTo<FileViewOriginal>(this);
  }

  public canAcceptExtension(_extension: string): boolean {
    return false;
  }

  public constructor4__(_leaf: WorkspaceLeaf): void {
    noop();
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

  public async onLoadFile(_file: TFile): Promise<void> {
    await noopAsync();
  }

  public async onRename(_file: TFile): Promise<void> {
    await noopAsync();
  }

  public async onUnloadFile(_file: TFile): Promise<void> {
    await noopAsync();
  }

  public override async setState(state: unknown, result: ViewStateResultOriginal): Promise<void> {
    await super.setState(state, result);
  }
}
