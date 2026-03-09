import type {
  Constructor,
  MarkdownFileInfo,
  OpenViewState,
  PaneType,
  Side,
  SplitDirection,
  View,
  Workspace as WorkspaceOriginal,
  WorkspaceParent,
  WorkspaceWindowInitData
} from 'obsidian';

import type {
  EnsureSideLeafOptions,
  SetActiveLeafParams
} from '../internal/Types.ts';
import type { App } from './App.ts';
import type { TFile } from './TFile.ts';

import { castTo } from '../internal/Cast.ts';
import { noop } from '../internal/Noop.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { debounce } from './debounce.ts';
import { Events } from './Events.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';
import { WorkspaceRibbon } from './WorkspaceRibbon.ts';
import { WorkspaceRoot } from './WorkspaceRoot.ts';
import { WorkspaceSidedock } from './WorkspaceSidedock.ts';
import { WorkspaceWindow } from './WorkspaceWindow.ts';

export class Workspace extends Events {
  public activeEditor: MarkdownFileInfo | null = null;
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
    this.leftSplit = WorkspaceSidedock.create__(this, 'vertical', 'left');
    this.rightRibbon = WorkspaceRibbon.create__(this, 'right');
    this.rightSplit = WorkspaceSidedock.create__(this, 'vertical', 'right');
    this.rootSplit = WorkspaceRoot.create__(this, 'vertical');
  }

  public static create__(app: App, containerEl: HTMLElement): Workspace {
    return strictMock(new Workspace(app, containerEl));
  }

  public _setLayoutReady(): void {
    this.layoutReady = true;
    for (const callback of this._layoutReadyCallbacks) {
      callback();
    }
    this._layoutReadyCallbacks = [];
  }

  public override asOriginalType__(): WorkspaceOriginal {
    return castTo<WorkspaceOriginal>(this);
  }

  public async changeLayout(_workspace: unknown): Promise<void> {
    // Empty async — layout changes are not simulated.
  }

  public createLeafBySplit(_leaf: WorkspaceLeaf, _direction?: SplitDirection, _before?: boolean): WorkspaceLeaf {
    const leaf = WorkspaceLeaf.create__(this._app);
    this._leaves.push(leaf);
    return leaf;
  }

  public createLeafInParent(_parent: WorkspaceParent, _index: number): WorkspaceLeaf {
    const leaf = WorkspaceLeaf.create__(this._app);
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
  public async duplicateLeaf(_leaf: WorkspaceLeaf, _leafType?: boolean | PaneType, _direction?: SplitDirection): Promise<WorkspaceLeaf> {
    const leaf = WorkspaceLeaf.create__(this._app);
    this._leaves.push(leaf);
    return leaf;
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- Implements async obsidian.d.ts interface.
  public async ensureSideLeaf(
    _type: string,
    _side: Side,
    _options?: EnsureSideLeafOptions
  ): Promise<WorkspaceLeaf> {
    const leaf = WorkspaceLeaf.create__(this._app);
    this._leaves.push(leaf);
    return leaf;
  }

  public getActiveFile(): null | TFile {
    if (this.activeLeaf) {
      return this.activeLeaf._file;
    }
    return null;
  }

  public getActiveViewOfType<T extends View>(_type: Constructor<T>): null | T {
    return null;
  }

  public getGroupLeaves(group: string): WorkspaceLeaf[] {
    return this._leaves.filter((leaf) => leaf._getGroup() === group);
  }

  public getLastOpenFiles(): string[] {
    return [];
  }

  public getLayout(): Record<string, unknown> {
    return {};
  }

  public getLeaf(newLeaf?: boolean | PaneType): WorkspaceLeaf {
    if (newLeaf === true || newLeaf === 'tab' || newLeaf === 'split' || newLeaf === 'window') {
      const leaf = WorkspaceLeaf.create__(this._app);
      this._leaves.push(leaf);
      return leaf;
    }

    if (this.activeLeaf) {
      return this.activeLeaf;
    }

    const leaf = WorkspaceLeaf.create__(this._app);
    this._leaves.push(leaf);
    this.activeLeaf = leaf;
    return leaf;
  }

  public getLeafById(id: string): null | WorkspaceLeaf {
    return this._leaves.find((leaf) => leaf._id === id) ?? null;
  }

  public getLeavesOfType(viewType: string): WorkspaceLeaf[] {
    return this._leaves.filter((leaf) => leaf.getViewState().type === viewType);
  }

  public getLeftLeaf(_split: boolean): null | WorkspaceLeaf {
    const leaf = WorkspaceLeaf.create__(this._app);
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
    const leaf = WorkspaceLeaf.create__(this._app);
    this._leaves.push(leaf);
    return leaf;
  }

  public getUnpinnedLeaf(): WorkspaceLeaf {
    const unpinned = this._leaves.find((leaf) => !leaf._isPinned());
    if (unpinned) {
      return unpinned;
    }
    const leaf = WorkspaceLeaf.create__(this._app);
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
    return WorkspaceWindow.create2__(this);
  }

  public onLayoutReady(callback: () => unknown): void {
    if (this.layoutReady) {
      callback();
    } else {
      this._layoutReadyCallbacks.push(callback);
    }
  }

  public async openLinkText(_linktext: string, _sourcePath: string, _newLeaf?: boolean | PaneType, _openViewState?: OpenViewState): Promise<void> {
    // Empty async — link navigation is not simulated.
  }

  public openPopoutLeaf(_data?: WorkspaceWindowInitData): WorkspaceLeaf {
    const leaf = WorkspaceLeaf.create__(this._app);
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

  public splitActiveLeaf(_direction?: SplitDirection): WorkspaceLeaf {
    const leaf = WorkspaceLeaf.create__(this._app);
    this._leaves.push(leaf);
    return leaf;
  }

  public updateOptions(): void {
    // Empty — options update is not simulated.
  }
}
