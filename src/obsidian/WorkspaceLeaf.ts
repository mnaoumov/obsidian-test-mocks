import type {
  HoverPopover as HoverPopoverOriginal,
  IconName as IconNameOriginal,
  OpenViewState as OpenViewStateOriginal,
  View as ViewOriginal,
  ViewState as ViewStateOriginal,
  WorkspaceLeaf as WorkspaceLeafOriginal,
  WorkspaceMobileDrawer as WorkspaceMobileDrawerOriginal,
  WorkspaceTabs as WorkspaceTabsOriginal
} from 'obsidian';

import type { App } from './App.ts';
import type { TFile } from './TFile.ts';

import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { strictProxyForce } from '../internal/strict-proxy.ts';
import { WorkspaceItem } from './WorkspaceItem.ts';

let nextLeafId = 1;

export class WorkspaceLeaf extends WorkspaceItem {
  public hoverPopover: HoverPopoverOriginal | null = null;
  public id__: string;
  public readonly isDeferred = false;
  declare public parent: WorkspaceMobileDrawerOriginal | WorkspaceTabsOriginal;
  public view: null | ViewOriginal = null;

  public get file__(): null | TFile {
    return this.file;
  }

  private readonly app: App;
  private ephemeralState: Record<string, unknown> = {};
  private file: null | TFile = null;
  private group: null | string = null;
  private pinned = false;

  private viewState: ViewStateOriginal = { type: '' };

  protected constructor(app: App, id?: string) {
    super(app.workspace, id);
    this.app = app;
    this.id__ = id ?? String(nextLeafId++);
    const self = strictProxyForce(this);
    self.constructor3__(app, id);
    return self;
  }

  public static create2__(app: App, id?: string): WorkspaceLeaf {
    return new WorkspaceLeaf(app, id);
  }

  public static fromOriginalType3__(value: WorkspaceLeafOriginal): WorkspaceLeaf {
    return strictProxyForce(value, WorkspaceLeaf);
  }

  public asOriginalType3__(): WorkspaceLeafOriginal {
    return strictProxyForce<WorkspaceLeafOriginal>(this);
  }

  public constructor3__(_app: App, _id?: string): void {
    noop();
  }

  public detach(): void {
    this.app.workspace.removeLeaf__(this);
  }

  public getDisplayText(): string {
    if (this.view) {
      return this.view.getDisplayText();
    }
    return '';
  }

  public getEphemeralState(): Record<string, unknown> {
    return { ...this.ephemeralState };
  }

  public getGroup__(): null | string {
    return this.group;
  }

  public getIcon(): IconNameOriginal {
    if (this.view) {
      return this.view.getIcon();
    }
    return '';
  }

  public getViewState(): ViewStateOriginal {
    return { ...this.viewState };
  }

  public isPinned__(): boolean {
    return this.pinned;
  }

  public async loadIfDeferred(): Promise<void> {
    await noopAsync();
  }

  public onResize(): void {
    if (this.view) {
      this.view.onResize();
    }
  }

  public async openFile(file: TFile, _openState?: OpenViewStateOriginal): Promise<void> {
    await noopAsync();
    this.file = file;
  }

  public setEphemeralState(state: Record<string, unknown>): void {
    this.ephemeralState = { ...state };
  }

  public setGroup(group: null | string): void {
    this.group = group;
  }

  public setGroupMember(other: WorkspaceLeaf): void {
    this.group = other.getGroup__();
  }

  public setPinned(pinned: boolean): void {
    this.pinned = pinned;
  }

  public async setViewState(viewState: ViewStateOriginal, eState?: Record<string, unknown>): Promise<void> {
    await noopAsync();
    this.viewState = { ...viewState };
    if (eState) {
      this.ephemeralState = { ...eState };
    }
    this.trigger('view-state-change');
  }

  public togglePinned(): void {
    this.pinned = !this.pinned;
  }
}
