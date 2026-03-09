import type {
  Constructor as ConstructorOriginal,
  MarkdownFileInfo as MarkdownFileInfoOriginal,
  OpenViewState as OpenViewStateOriginal,
  PaneType as PaneTypeOriginal,
  Side as SideOriginal,
  SplitDirection as SplitDirectionOriginal,
  View as ViewOriginal,
  Workspace as WorkspaceOriginal,
  WorkspaceParent as WorkspaceParentOriginal,
  WorkspaceWindowInitData as WorkspaceWindowInitDataOriginal
} from 'obsidian';

import type {
  EnsureSideLeafOptions,
  SetActiveLeafParams
} from '../internal/types.ts';
import type { App } from './App.ts';
import type { TFile } from './TFile.ts';

import { castTo } from '../internal/cast.ts';
import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { debounce } from './debounce.ts';
import { Events } from './Events.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';
import { WorkspaceRibbon } from './WorkspaceRibbon.ts';
import { WorkspaceRoot } from './WorkspaceRoot.ts';
import { WorkspaceSidedock } from './WorkspaceSidedock.ts';
import { WorkspaceWindow } from './WorkspaceWindow.ts';

export class Workspace extends Events {
  public activeEditor: MarkdownFileInfoOriginal | null = null;
  public activeLeaf: null | WorkspaceLeaf = null;
  public layoutReady = false;
  public leftRibbon: WorkspaceRibbon;
  public leftSplit: WorkspaceSidedock;
  public requestSaveLayout = debounce(() => {
    noop();
  });

  public rightRibbon: WorkspaceRibbon;
  public rightSplit: WorkspaceSidedock;
  public rootSplit: WorkspaceRoot;

  public get containerEl(): HTMLElement {
    this._containerEl ??= createDiv();
    return this._containerEl;
  }

  public set containerEl(el: HTMLElement) {
    this._containerEl = el;
  }

  private readonly _app: App;
  private _containerEl?: HTMLElement;

  private _layoutReadyCallbacks: (() => unknown)[] = [];
  private _leaves: WorkspaceLeaf[] = [];
  protected constructor(_app: App, containerEl: HTMLElement) {
    super();
    this._app = _app;
    this._containerEl = containerEl;
    this.leftRibbon = WorkspaceRibbon.create__(this, 'left');
    this.leftSplit = WorkspaceSidedock.create2__(this, 'vertical', 'left');
    this.rightRibbon = WorkspaceRibbon.create__(this, 'right');
    this.rightSplit = WorkspaceSidedock.create2__(this, 'vertical', 'right');
    this.rootSplit = WorkspaceRoot.create2__(this, 'vertical');
  }

  public static create2__(app: App, containerEl: HTMLElement): Workspace {
    return strictMock(new Workspace(app, containerEl));
  }

  public override asOriginalType__(): WorkspaceOriginal {
    return castTo<WorkspaceOriginal>(this);
  }

  public async changeLayout(_workspace: unknown): Promise<void> {
    await noopAsync();
  }

  public createLeafBySplit(_leaf: WorkspaceLeaf, _direction?: SplitDirectionOriginal, _before?: boolean): WorkspaceLeaf {
    const leaf = WorkspaceLeaf.create2__(this._app);
    this._leaves.push(leaf);
    return leaf;
  }

  public createLeafInParent(_parent: WorkspaceParentOriginal, _index: number): WorkspaceLeaf {
    const leaf = WorkspaceLeaf.create2__(this._app);
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

  // eslint-disable-next-line @typescript-eslint/require-await -- Implements async obsidian.d.ts interface.
  public async duplicateLeaf(_leaf: WorkspaceLeaf, _leafType?: boolean | PaneTypeOriginal, _direction?: SplitDirectionOriginal): Promise<WorkspaceLeaf> {
    const leaf = WorkspaceLeaf.create2__(this._app);
    this._leaves.push(leaf);
    return leaf;
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- Implements async obsidian.d.ts interface.
  public async ensureSideLeaf(
    _type: string,
    _side: SideOriginal,
    _options?: EnsureSideLeafOptions
  ): Promise<WorkspaceLeaf> {
    const leaf = WorkspaceLeaf.create2__(this._app);
    this._leaves.push(leaf);
    return leaf;
  }

  public getActiveFile(): null | TFile {
    if (this.activeLeaf) {
      return this.activeLeaf.file__;
    }
    return null;
  }

  public getActiveViewOfType<T extends ViewOriginal>(_type: ConstructorOriginal<T>): null | T {
    return null;
  }

  public getGroupLeaves(group: string): WorkspaceLeaf[] {
    return this._leaves.filter((leaf) => leaf.getGroup__() === group);
  }

  public getLastOpenFiles(): string[] {
    return [];
  }

  public getLayout(): Record<string, unknown> {
    return {};
  }

  public getLeaf(newLeaf?: boolean | PaneTypeOriginal): WorkspaceLeaf {
    if (newLeaf === true || newLeaf === 'tab' || newLeaf === 'split' || newLeaf === 'window') {
      const leaf = WorkspaceLeaf.create2__(this._app);
      this._leaves.push(leaf);
      return leaf;
    }

    if (this.activeLeaf) {
      return this.activeLeaf;
    }

    const leaf = WorkspaceLeaf.create2__(this._app);
    this._leaves.push(leaf);
    this.activeLeaf = leaf;
    return leaf;
  }

  public getLeafById(id: string): null | WorkspaceLeaf {
    return this._leaves.find((leaf) => leaf.id__ === id) ?? null;
  }

  public getLeavesOfType(viewType: string): WorkspaceLeaf[] {
    return this._leaves.filter((leaf) => leaf.getViewState().type === viewType);
  }

  public getLeftLeaf(_split: boolean): null | WorkspaceLeaf {
    const leaf = WorkspaceLeaf.create2__(this._app);
    this._leaves.push(leaf);
    return leaf;
  }

  public getMostRecentLeaf(_root?: WorkspaceParentOriginal): null | WorkspaceLeaf {
    if (this._leaves.length === 0) {
      return null;
    }
    return this._leaves[this._leaves.length - 1] ?? null;
  }

  public getRightLeaf(_split: boolean): null | WorkspaceLeaf {
    const leaf = WorkspaceLeaf.create2__(this._app);
    this._leaves.push(leaf);
    return leaf;
  }

  public getUnpinnedLeaf(): WorkspaceLeaf {
    const unpinned = this._leaves.find((leaf) => !leaf.isPinned__());
    if (unpinned) {
      return unpinned;
    }
    const leaf = WorkspaceLeaf.create2__(this._app);
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

  public moveLeafToPopout(leaf: WorkspaceLeaf, _data?: WorkspaceWindowInitDataOriginal): WorkspaceWindow {
    if (!this._leaves.includes(leaf)) {
      this._leaves.push(leaf);
    }
    return WorkspaceWindow.create3__(this);
  }

  public onLayoutReady(callback: () => unknown): void {
    if (this.layoutReady) {
      callback();
    } else {
      this._layoutReadyCallbacks.push(callback);
    }
  }

  public async openLinkText(
    _linktext: string,
    _sourcePath: string,
    _newLeaf?: boolean | PaneTypeOriginal,
    _openViewState?: OpenViewStateOriginal
  ): Promise<void> {
    await noopAsync();
  }

  public openPopoutLeaf(_data?: WorkspaceWindowInitDataOriginal): WorkspaceLeaf {
    const leaf = WorkspaceLeaf.create2__(this._app);
    this._leaves.push(leaf);
    return leaf;
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- Implements async obsidian.d.ts interface.
  public async revealLeaf(leaf: WorkspaceLeaf): Promise<void> {
    this.setActiveLeaf(leaf);
  }

  public setActiveLeaf(leaf: WorkspaceLeaf, _params?: SetActiveLeafParams): void {
    this.activeLeaf = leaf;
    if (!this._leaves.includes(leaf)) {
      this._leaves.push(leaf);
    }
    this.trigger('active-leaf-change', leaf);
  }

  public setLayoutReady__(): void {
    this.layoutReady = true;
    for (const callback of this._layoutReadyCallbacks) {
      callback();
    }
    this._layoutReadyCallbacks = [];
  }

  public splitActiveLeaf(_direction?: SplitDirectionOriginal): WorkspaceLeaf {
    const leaf = WorkspaceLeaf.create2__(this._app);
    this._leaves.push(leaf);
    return leaf;
  }

  public updateOptions(): void {
    noop();
  }
}
