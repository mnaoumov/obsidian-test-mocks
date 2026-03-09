import type {
  HoverPopover,
  IconName,
  OpenViewState,
  View,
  ViewState,
  WorkspaceLeaf as WorkspaceLeafOriginal
} from 'obsidian';

import type { App } from './App.ts';
import type { TFile } from './TFile.ts';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { WorkspaceItem } from './WorkspaceItem.ts';

let nextLeafId = 1;

export class WorkspaceLeaf extends WorkspaceItem {
  public hoverPopover: HoverPopover | null = null;
  public id__: string;
  public readonly isDeferred = false;
  public view: null | View = null;

  public get file__(): null | TFile {
    return this._file__;
  }

  private _ephemeralState: Record<string, unknown> = {};
  private _file__: null | TFile = null;
  private _group: null | string = null;
  private _pinned = false;

  private _viewState: ViewState = { type: '' };

  protected constructor(_app: App, id?: string) {
    super();
    this.id__ = id ?? String(nextLeafId++);
  }

  public static create2__(app: App, id?: string): WorkspaceLeaf {
    return strictMock(new WorkspaceLeaf(app, id));
  }

  public override asOriginalType__(): WorkspaceLeafOriginal {
    return castTo<WorkspaceLeafOriginal>(this);
  }

  public detach(): void {
    // Detach is a no-op in the mock.
  }

  public getDisplayText(): string {
    if (this.view) {
      return this.view.getDisplayText();
    }
    return '';
  }

  public getEphemeralState(): Record<string, unknown> {
    return { ...this._ephemeralState };
  }

  public getGroup__(): null | string {
    return this._group;
  }

  public getIcon(): IconName {
    if (this.view) {
      return this.view.getIcon();
    }
    return '';
  }

  public getViewState(): ViewState {
    return { ...this._viewState };
  }

  public isPinned__(): boolean {
    return this._pinned;
  }

  public async loadIfDeferred(): Promise<void> {
    // IsDeferred is always false; nothing to load.
  }

  public onResize(): void {
    if (this.view) {
      this.view.onResize();
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- Implements async obsidian.d.ts interface.
  public async openFile(file: TFile, _openState?: OpenViewState): Promise<void> {
    this._file__ = file;
  }

  public setEphemeralState(state: Record<string, unknown>): void {
    this._ephemeralState = { ...state };
  }

  public setGroup(group: null | string): void {
    this._group = group;
  }

  public setGroupMember(other: WorkspaceLeaf): void {
    this._group = other.getGroup__();
  }

  public setPinned(pinned: boolean): void {
    this._pinned = pinned;
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- Implements async obsidian.d.ts interface.
  public async setViewState(viewState: ViewState, eState?: Record<string, unknown>): Promise<void> {
    this._viewState = { ...viewState };
    if (eState) {
      this._ephemeralState = { ...eState };
    }
    this.trigger('view-state-change');
  }

  public togglePinned(): void {
    this._pinned = !this._pinned;
  }
}
