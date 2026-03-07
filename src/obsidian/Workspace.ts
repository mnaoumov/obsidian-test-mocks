import type {
  Constructor,
  MarkdownFileInfo,
  OpenViewState,
  PaneType,
  Side,
  SplitDirection,
  View,
  WorkspaceParent,
  WorkspaceWindowInitData
} from 'obsidian';
import type {
  EnsureSideLeafOptions,
  SetActiveLeafParams
} from 'obsidian-typings';

import type { TFile } from './TFile.ts';

import { noopAsync } from '../internal/Noop.ts';
import { debounce } from './debounce.ts';
import { Events } from './Events.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';
import { WorkspaceRibbon } from './WorkspaceRibbon.ts';
import { WorkspaceRoot } from './WorkspaceRoot.ts';
import { WorkspaceSidedock } from './WorkspaceSidedock.ts';
import { WorkspaceWindow } from './WorkspaceWindow.ts';

function noop(): void {
  // Does nothing.
}

export class Workspace extends Events {
  public activeEditor: MarkdownFileInfo | null = null;
  public activeLeaf: null | WorkspaceLeaf = null;
  public layoutReady = false;
  public leftRibbon = new WorkspaceRibbon();
  public leftSplit = new WorkspaceSidedock();
  public requestSaveLayout = debounce(noop);
  public rightRibbon = new WorkspaceRibbon();
  public rightSplit = new WorkspaceSidedock();
  public rootSplit = new WorkspaceRoot();

  private _containerEl?: HTMLElement;
  private _layoutReadyCallbacks: Array<() => unknown> = [];
  private _leaves: WorkspaceLeaf[] = [];

  public get containerEl(): HTMLElement {
    this._containerEl ??= createDiv();
    return this._containerEl;
  }

  public set containerEl(el: HTMLElement) {
    this._containerEl = el;
  }

  public async changeLayout(_workspace: unknown): Promise<void> {
    await noopAsync();
  }

  public createLeafBySplit(_leaf: WorkspaceLeaf, _direction?: SplitDirection, _before?: boolean): WorkspaceLeaf {
    const leaf = new WorkspaceLeaf();
    this._leaves.push(leaf);
    return leaf;
  }

  public createLeafInParent(_parent: WorkspaceParent, _index: number): WorkspaceLeaf {
    const leaf = new WorkspaceLeaf();
    this._leaves.push(leaf);
    return leaf;
  }

  public detachLeavesOfType(viewType: string): void {
    const toDetach = this._leaves.filter((leaf) => leaf.getViewState().type === viewType);
    for (const leaf of toDetach) {
      leaf.detach();
    }
    this._leaves = this._leaves.filter((leaf) => leaf.getViewState().type !== viewType);
  }

  public async duplicateLeaf(_leaf: WorkspaceLeaf, _leafType?: boolean | PaneType, _direction?: SplitDirection): Promise<WorkspaceLeaf> {
    const leaf = new WorkspaceLeaf();
    this._leaves.push(leaf);
    await noopAsync();
    return leaf;
  }

  public async ensureSideLeaf(
    _type: string,
    _side: Side,
    _options?: EnsureSideLeafOptions
  ): Promise<WorkspaceLeaf> {
    const leaf = new WorkspaceLeaf();
    this._leaves.push(leaf);
    await noopAsync();
    return leaf;
  }

  public getActiveFile(): null | TFile {
    if (this.activeLeaf) {
      return this.activeLeaf.file;
    }
    return null;
  }

  public getActiveViewOfType<T extends View>(_type: Constructor<T>): null | T {
    return null;
  }

  public getGroupLeaves(group: string): WorkspaceLeaf[] {
    return this._leaves.filter((leaf) => leaf.getGroup() === group);
  }

  public getLastOpenFiles(): string[] {
    return [];
  }

  public getLayout(): Record<string, unknown> {
    return {};
  }

  public getLeaf(newLeaf?: boolean | PaneType): WorkspaceLeaf {
    if (newLeaf === true || newLeaf === 'tab' || newLeaf === 'split' || newLeaf === 'window') {
      const leaf = new WorkspaceLeaf();
      this._leaves.push(leaf);
      return leaf;
    }

    if (this.activeLeaf) {
      return this.activeLeaf;
    }

    const leaf = new WorkspaceLeaf();
    this._leaves.push(leaf);
    this.activeLeaf = leaf;
    return leaf;
  }

  public getLeafById(id: string): null | WorkspaceLeaf {
    return this._leaves.find((leaf) => leaf.id === id) ?? null;
  }

  public getLeavesOfType(viewType: string): WorkspaceLeaf[] {
    return this._leaves.filter((leaf) => leaf.getViewState().type === viewType);
  }

  public getLeftLeaf(_split: boolean): null | WorkspaceLeaf {
    const leaf = new WorkspaceLeaf();
    this._leaves.push(leaf);
    return leaf;
  }

  public getMostRecentLeaf(_root?: WorkspaceParent): null | WorkspaceLeaf {
    if (this._leaves.length === 0) {
      return null;
    }
    return this._leaves[this._leaves.length - 1] ?? null;
  }

  public getRightLeaf(_split: boolean): null | WorkspaceLeaf {
    const leaf = new WorkspaceLeaf();
    this._leaves.push(leaf);
    return leaf;
  }

  public getUnpinnedLeaf(): WorkspaceLeaf {
    const unpinned = this._leaves.find((leaf) => !leaf.isPinned());
    if (unpinned) {
      return unpinned;
    }
    const leaf = new WorkspaceLeaf();
    this._leaves.push(leaf);
    return leaf;
  }

  public iterateAllLeaves(callback: (leaf: WorkspaceLeaf) => unknown): void {
    for (const leaf of this._leaves) {
      callback(leaf);
    }
  }

  public iterateRootLeaves(callback: (leaf: WorkspaceLeaf) => unknown): void {
    for (const leaf of this._leaves) {
      callback(leaf);
    }
  }

  public moveLeafToPopout(leaf: WorkspaceLeaf, _data?: WorkspaceWindowInitData): WorkspaceWindow {
    if (!this._leaves.includes(leaf)) {
      this._leaves.push(leaf);
    }
    return new WorkspaceWindow();
  }

  public onLayoutReady(callback: () => unknown): void {
    if (this.layoutReady) {
      callback();
    } else {
      this._layoutReadyCallbacks.push(callback);
    }
  }

  public async openLinkText(_linktext: string, _sourcePath: string, _newLeaf?: boolean | PaneType, _openViewState?: OpenViewState): Promise<void> {
    await noopAsync();
  }

  public openPopoutLeaf(_data?: WorkspaceWindowInitData): WorkspaceLeaf {
    const leaf = new WorkspaceLeaf();
    this._leaves.push(leaf);
    return leaf;
  }

  public async revealLeaf(leaf: WorkspaceLeaf): Promise<void> {
    this.setActiveLeaf(leaf);
    await noopAsync();
  }

  public setActiveLeaf(leaf: WorkspaceLeaf, _params?: SetActiveLeafParams): void {
    this.activeLeaf = leaf;
    if (!this._leaves.includes(leaf)) {
      this._leaves.push(leaf);
    }
    this.trigger('active-leaf-change', leaf);
  }

  public setLayoutReady(): void {
    this.layoutReady = true;
    for (const callback of this._layoutReadyCallbacks) {
      callback();
    }
    this._layoutReadyCallbacks = [];
  }

  public splitActiveLeaf(_direction?: SplitDirection): WorkspaceLeaf {
    const leaf = new WorkspaceLeaf();
    this._leaves.push(leaf);
    return leaf;
  }

  public updateOptions(): void {
    noop();
  }
}
