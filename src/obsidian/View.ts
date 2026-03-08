import type {
  IconName,
  Menu,
  Scope,
  ViewStateResult
} from 'obsidian';

import { strictMock } from '../internal/StrictMock.ts';
import { App } from './App.ts';
import { Component } from './Component.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

export abstract class View extends Component {
  public app: App;
  public containerEl: HTMLElement;
  public icon: IconName = '';
  public leaf: WorkspaceLeaf;
  public navigation = true;
  public scope: Scope | null = null;

  public constructor(leaf: WorkspaceLeaf) {
    super();
    this.app = App.create__();
    this.containerEl = createDiv();
    this.leaf = leaf;
    const mock = strictMock(this);
    View.constructor__(mock, leaf);
    return mock;
  }

  public static override constructor__(_instance: View, _leaf: WorkspaceLeaf): void {
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
