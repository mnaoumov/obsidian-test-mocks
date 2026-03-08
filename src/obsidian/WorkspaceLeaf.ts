import type {
  HoverPopover,
  IconName,
  OpenViewState,
  View,
  ViewState
} from 'obsidian';

import type { TFile } from './TFile.ts';

import { strictMock } from '../internal/StrictMock.ts';
import { Events } from './Events.ts';

let nextLeafId = 1;

export class WorkspaceLeaf extends Events {
  public _id: string;
  public hoverPopover: HoverPopover | null = null;
  public readonly isDeferred = false;
  public view: null | View = null;

  public get _file(): null | TFile {
    return this.__file;
  }

  private __file: null | TFile = null;
  private _ephemeralState: Record<string, unknown> = {};
  private _group: null | string = null;
  private _pinned = false;

  private _viewState: ViewState = { type: '' };

  protected constructor(_app: unknown, id?: string) {
    super();
    this._id = id ?? String(nextLeafId++);
    const mock = strictMock(this);
    WorkspaceLeaf.constructor__(mock, _app, id);
    return mock;
  }

  public static override constructor__(_instance: WorkspaceLeaf, _app: unknown, _id?: string): void {
    // Spy hook.
  }

  public static create__(_app: unknown, id?: string): WorkspaceLeaf {
    return new WorkspaceLeaf(_app, id);
  }

  public _getGroup(): null | string {
    return this._group;
  }

  public _isPinned(): boolean {
    return this._pinned;
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

  public getIcon(): IconName {
    if (this.view) {
      return this.view.getIcon();
    }
    return '';
  }

  public getViewState(): ViewState {
    return { ...this._viewState };
  }

  public async loadIfDeferred(): Promise<void> {
    // IsDeferred is always false; nothing to load.
  }

  public onResize(): void {
    if (this.view) {
      this.view.onResize();
    }
  }

  public async openFile(file: TFile, _openState?: OpenViewState): Promise<void> {
    this.__file = file;
  }

  public setEphemeralState(state: Record<string, unknown>): void {
    this._ephemeralState = { ...state };
  }

  public setGroup(group: null | string): void {
    this._group = group;
  }

  public setGroupMember(other: WorkspaceLeaf): void {
    this._group = other._getGroup();
  }

  public setPinned(pinned: boolean): void {
    this._pinned = pinned;
  }

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
