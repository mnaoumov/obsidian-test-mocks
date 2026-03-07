import type {
  HoverPopover,
  IconName,
  OpenViewState,
  View,
  ViewState
} from 'obsidian';

import type { TFile } from './TFile.ts';

import { noopAsync } from '../internal/Noop.ts';
import { Events } from './Events.ts';

let nextLeafId = 1;

export class WorkspaceLeaf extends Events {
  public hoverPopover: HoverPopover | null = null;
  public readonly id: string;
  public readonly isDeferred = false;
  public view: View | null = null;

  private _detached = false;
  private _ephemeralState: Record<string, unknown> = {};
  private _file: TFile | null = null;
  private _group: string | null = null;
  private _pinned = false;
  private _viewState: ViewState = { type: '' };

  public constructor() {
    super();
    this.id = String(nextLeafId++);
  }

  public detach(): void {
    this._detached = true;
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

  public isDetached(): boolean {
    return this._detached;
  }

  public async loadIfDeferred(): Promise<void> {
    await noopAsync();
  }

  public onResize(): void {
    if (this.view) {
      this.view.onResize();
    }
  }

  public async openFile(file: TFile, _openState?: OpenViewState): Promise<void> {
    this._file = file;
    await noopAsync();
  }

  public get file(): TFile | null {
    return this._file;
  }

  public setEphemeralState(state: Record<string, unknown>): void {
    this._ephemeralState = { ...state };
  }

  public setGroup(group: string | null): void {
    this._group = group;
  }

  public getGroup(): string | null {
    return this._group;
  }

  public setGroupMember(other: WorkspaceLeaf): void {
    this._group = other.getGroup();
  }

  public setPinned(pinned: boolean): void {
    this._pinned = pinned;
  }

  public isPinned(): boolean {
    return this._pinned;
  }

  public async setViewState(viewState: ViewState, eState?: Record<string, unknown>): Promise<void> {
    this._viewState = { ...viewState };
    if (eState) {
      this._ephemeralState = { ...eState };
    }
    this.trigger('view-state-change');
    await noopAsync();
  }

  public togglePinned(): void {
    this._pinned = !this._pinned;
  }
}
