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

import {
  createMockOf,
  createMockOfUnsafe
} from '../internal/create-mock-of.ts';
import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';
import { Events } from './Events.ts';
import { debounce } from './functions/debounce.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';
import { WorkspaceRibbon } from './WorkspaceRibbon.ts';
import { WorkspaceRoot } from './WorkspaceRoot.ts';
import { WorkspaceSidedock } from './WorkspaceSidedock.ts';
import { WorkspaceWindow } from './WorkspaceWindow.ts';

export class Workspace extends Events {
  public activeEditor: MarkdownFileInfoOriginal | null = null;
  public activeLeaf: null | WorkspaceLeaf = null;
  public containerEl: HTMLElement;
  public layoutReady = false;
  public leftRibbon: WorkspaceRibbon;
  public leftSplit: WorkspaceSidedock;

  public requestSaveLayout = debounce(() => {
    noop();
  });

  public rightRibbon: WorkspaceRibbon;
  public rightSplit: WorkspaceSidedock;

  public rootSplit: WorkspaceRoot;

  private readonly app: App;

  private layoutReadyCallbacks: (() => unknown)[] = [];
  private leaves: WorkspaceLeaf[] = [];
  protected constructor(app: App, containerEl: HTMLElement) {
    super();
    this.app = app;
    this.containerEl = containerEl;
    this.leftRibbon = WorkspaceRibbon.create__(this, 'left');
    this.leftSplit = WorkspaceSidedock.create3__(this, 'vertical', 'left');
    this.rightRibbon = WorkspaceRibbon.create__(this, 'right');
    this.rightSplit = WorkspaceSidedock.create3__(this, 'vertical', 'right');
    this.rootSplit = WorkspaceRoot.create3__(this, 'vertical');
    const self = createMockOf(this);
    self.constructor2__(app, containerEl);
    return self;
  }

  public static create2__(app: App, containerEl: HTMLElement): Workspace {
    return new Workspace(app, containerEl);
  }

  public static fromOriginalType2__(value: WorkspaceOriginal): Workspace {
    return createMockOfUnsafe<Workspace>(value);
  }

  public asOriginalType2__(): WorkspaceOriginal {
    return createMockOfUnsafe<WorkspaceOriginal>(this);
  }

  public async changeLayout(_workspace: unknown): Promise<void> {
    await noopAsync();
  }

  public constructor2__(_app: App, _containerEl: HTMLElement): void {
    noop();
  }

  public createLeafBySplit(_leaf: WorkspaceLeaf, _direction?: SplitDirectionOriginal, _before?: boolean): WorkspaceLeaf {
    const leaf = WorkspaceLeaf.create2__(this.app);
    this.leaves.push(leaf);
    return leaf;
  }

  public createLeafInParent(_parent: WorkspaceParentOriginal, _index: number): WorkspaceLeaf {
    const leaf = WorkspaceLeaf.create2__(this.app);
    this.leaves.push(leaf);
    return leaf;
  }

  public detachLeavesOfType(viewType: string): void {
    const toDetach = this.leaves.filter((leaf) => leaf.getViewState().type === viewType);
    for (const leaf of toDetach) {
      leaf.detach();
    }
    this.leaves = this.leaves.filter((leaf) => leaf.getViewState().type !== viewType);
  }

  public async duplicateLeaf(_leaf: WorkspaceLeaf, _leafType?: boolean | PaneTypeOriginal, _direction?: SplitDirectionOriginal): Promise<WorkspaceLeaf> {
    await noopAsync();
    const leaf = WorkspaceLeaf.create2__(this.app);
    this.leaves.push(leaf);
    return leaf;
  }

  public async ensureSideLeaf(
    _type: string,
    _side: SideOriginal,
    _options?: EnsureSideLeafOptions
  ): Promise<WorkspaceLeaf> {
    await noopAsync();
    const leaf = WorkspaceLeaf.create2__(this.app);
    this.leaves.push(leaf);
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
    return this.leaves.filter((leaf) => leaf.getGroup__() === group);
  }

  public getLastOpenFiles(): string[] {
    return [];
  }

  public getLayout(): Record<string, unknown> {
    return {};
  }

  public getLeaf(newLeaf?: boolean | PaneTypeOriginal): WorkspaceLeaf {
    if (newLeaf === true || newLeaf === 'tab' || newLeaf === 'split' || newLeaf === 'window') {
      const leaf = WorkspaceLeaf.create2__(this.app);
      this.leaves.push(leaf);
      return leaf;
    }

    if (this.activeLeaf) {
      return this.activeLeaf;
    }

    const leaf = WorkspaceLeaf.create2__(this.app);
    this.leaves.push(leaf);
    this.activeLeaf = leaf;
    return leaf;
  }

  public getLeafById(id: string): null | WorkspaceLeaf {
    return this.leaves.find((leaf) => leaf.id__ === id) ?? null;
  }

  public getLeavesOfType(viewType: string): WorkspaceLeaf[] {
    return this.leaves.filter((leaf) => leaf.getViewState().type === viewType);
  }

  public getLeftLeaf(_split: boolean): null | WorkspaceLeaf {
    const leaf = WorkspaceLeaf.create2__(this.app);
    this.leaves.push(leaf);
    return leaf;
  }

  public getMostRecentLeaf(_root?: WorkspaceParentOriginal): null | WorkspaceLeaf {
    if (this.leaves.length === 0) {
      return null;
    }
    return ensureNonNullable(this.leaves[this.leaves.length - 1]);
  }

  public getRightLeaf(_split: boolean): null | WorkspaceLeaf {
    const leaf = WorkspaceLeaf.create2__(this.app);
    this.leaves.push(leaf);
    return leaf;
  }

  public getUnpinnedLeaf(): WorkspaceLeaf {
    const unpinned = this.leaves.find((leaf) => !leaf.isPinned__());
    if (unpinned) {
      return unpinned;
    }
    const leaf = WorkspaceLeaf.create2__(this.app);
    this.leaves.push(leaf);
    return leaf;
  }

  public iterateAllLeaves(callback: (leaf: WorkspaceLeaf) => unknown): void {
    for (const leaf of this.leaves) {
      callback(leaf);
    }
  }

  public iterateRootLeaves(callback: (leaf: WorkspaceLeaf) => unknown): void {
    for (const leaf of this.leaves) {
      callback(leaf);
    }
  }

  public moveLeafToPopout(leaf: WorkspaceLeaf, _data?: WorkspaceWindowInitDataOriginal): WorkspaceWindow {
    if (!this.leaves.includes(leaf)) {
      this.leaves.push(leaf);
    }
    return WorkspaceWindow.create3__(this);
  }

  public onLayoutReady(callback: () => unknown): void {
    if (this.layoutReady) {
      callback();
    } else {
      this.layoutReadyCallbacks.push(callback);
    }
  }

  public async openLinkText(
    linktext: string,
    sourcePath: string,
    newLeaf?: boolean | PaneTypeOriginal,
    _openViewState?: OpenViewStateOriginal
  ): Promise<void> {
    const file = this.app.metadataCache.getFirstLinkpathDest(linktext, sourcePath);
    if (!file) {
      return;
    }

    const leaf = this.getLeaf(newLeaf);
    await leaf.openFile(file);
    this.setActiveLeaf(leaf);
  }

  public openPopoutLeaf(_data?: WorkspaceWindowInitDataOriginal): WorkspaceLeaf {
    const leaf = WorkspaceLeaf.create2__(this.app);
    this.leaves.push(leaf);
    return leaf;
  }

  public removeLeaf__(leaf: WorkspaceLeaf): void {
    this.leaves = this.leaves.filter((l) => l !== leaf);
    if (this.activeLeaf === leaf) {
      this.activeLeaf = null;
    }
  }

  public async revealLeaf(leaf: WorkspaceLeaf): Promise<void> {
    await noopAsync();
    this.setActiveLeaf(leaf);
  }

  public setActiveLeaf(leaf: WorkspaceLeaf, _params?: SetActiveLeafParams): void {
    this.activeLeaf = leaf;
    if (!this.leaves.includes(leaf)) {
      this.leaves.push(leaf);
    }
    this.trigger('active-leaf-change', leaf);
  }

  public setLayoutReady__(): void {
    this.layoutReady = true;
    for (const callback of this.layoutReadyCallbacks) {
      callback();
    }
    this.layoutReadyCallbacks = [];
  }

  public splitActiveLeaf(_direction?: SplitDirectionOriginal): WorkspaceLeaf {
    const leaf = WorkspaceLeaf.create2__(this.app);
    this.leaves.push(leaf);
    return leaf;
  }

  public updateOptions(): void {
    noop();
  }
}
