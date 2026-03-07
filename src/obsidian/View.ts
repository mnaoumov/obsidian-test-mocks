import type {
  IconName,
  Menu,
  Scope,
  ViewStateResult
} from 'obsidian';

import { App } from './App.ts';
import { Component } from './Component.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

export abstract class View extends Component {
  public app: App = App.__create();
  public containerEl: HTMLElement = createDiv();
  public icon: IconName = '';
  public leaf: WorkspaceLeaf = WorkspaceLeaf.__create();
  public navigation = true;
  public scope: Scope | null = null;

  public constructor(_leaf: WorkspaceLeaf) {
    super();
    View.__constructor(this, _leaf);
  }

  public static override __constructor(_instance: View, _leaf: WorkspaceLeaf): void {
    // Spy hook.
  }

  public abstract getDisplayText(): string;

  public getEphemeralState(): Record<string, unknown> {
    return this._ephemeralState as Record<string, unknown>;
  }

  public getIcon(): IconName {
    return this.icon;
  }

  public getState(): Record<string, unknown> {
    return this._state as Record<string, unknown>;
  }

  public abstract getViewType(): string;

  protected async onClose(): Promise<void> {
  }

  protected async onOpen(): Promise<void> {
  }

  public onPaneMenu(_menu: Menu, _source: string): void {
  }

  public onResize(): void {
  }

  public setEphemeralState(state: unknown): void {
    this._ephemeralState = state;
  }

  public async setState(state: unknown, _result: ViewStateResult): Promise<void> {
    this._state = state;
  }

  private _ephemeralState: unknown = {};
  private _state: unknown = {};
}
