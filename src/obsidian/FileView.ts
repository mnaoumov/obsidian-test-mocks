import type { ViewStateResult } from 'obsidian';

import type { TFile } from './TFile.ts';

import {
  noop,
  noopAsync
} from '../internal/Noop.ts';
import { ItemView } from './ItemView.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

export abstract class FileView extends ItemView {
  public allowNoFile = false;
  public file: TFile | null = null;
  public override navigation = true;

  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  public canAcceptExtension(_extension: string): boolean {
    return false;
  }

  public getDisplayText(): string {
    return '';
  }

  public override getState(): Record<string, unknown> {
    return {};
  }

  public async onLoadFile(_file: TFile): Promise<void> {
    await noopAsync();
  }

  public override onload(): void {
    noop();
  }

  public async onRename(_file: TFile): Promise<void> {
    await noopAsync();
  }

  public async onUnloadFile(_file: TFile): Promise<void> {
    await noopAsync();
  }

  public override async setState(_state: unknown, _result: ViewStateResult): Promise<void> {
    await noopAsync();
  }
}
