import type { ViewStateResult } from 'obsidian';

import type { TFile } from './TFile.ts';

import { strictMock } from '../internal/StrictMock.ts';
import { ItemView } from './ItemView.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

export abstract class FileView extends ItemView {
  public allowNoFile = false;
  public file: TFile | null = null;
  public override navigation = true;

  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    FileView.__constructor(this, leaf);
    return strictMock(this);
  }

  public static override __constructor(_instance: FileView, _leaf: WorkspaceLeaf): void {
    // Spy hook.
  }

  public canAcceptExtension(_extension: string): boolean {
    return false;
  }

  public getDisplayText(): string {
    return this.file?.basename ?? '';
  }

  public override getState(): Record<string, unknown> {
    return { ...super.getState() as Record<string, unknown> };
  }

  public async onLoadFile(_file: TFile): Promise<void> {
  }

  public override onload(): void {
  }

  public async onRename(_file: TFile): Promise<void> {
  }

  public async onUnloadFile(_file: TFile): Promise<void> {
  }

  public override async setState(state: unknown, result: ViewStateResult): Promise<void> {
    await super.setState(state, result);
  }
}
