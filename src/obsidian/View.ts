import type {
  DataAdapter,
  IconName,
  Menu,
  Scope,
  View as ViewOriginal,
  ViewStateResult
} from 'obsidian';

import { castTo } from '../internal/cast.ts';
import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { App } from './App.ts';
import { Component } from './Component.ts';
import { FileSystemAdapter } from './FileSystemAdapter.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

export abstract class View extends Component {
  public app: App;
  public containerEl: HTMLElement;
  public icon: IconName = '';
  public leaf: WorkspaceLeaf;
  public navigation = true;
  public scope: null | Scope = null;

  private _ephemeralState: unknown = {};

  private _state: unknown = {};

  public constructor(leaf: WorkspaceLeaf) {
    super();
    this.app = App.create__(FileSystemAdapter.create__('/mock-vault') as unknown as DataAdapter, '');
    this.containerEl = createDiv();
    this.leaf = leaf;
    return strictMock(this);
  }

  public override asOriginalType__(): ViewOriginal {
    return castTo<ViewOriginal>(this);
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

  public onPaneMenu(_menu: Menu, _source: string): void {
    noop();
  }

  public onResize(): void {
    noop();
  }

  public setEphemeralState(state: unknown): void {
    this._ephemeralState = state;
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- Implements async obsidian.d.ts interface.
  public async setState(state: unknown, _result: ViewStateResult): Promise<void> {
    this._state = state;
  }

  protected async onClose(): Promise<void> {
    await noopAsync();
  }

  protected async onOpen(): Promise<void> {
    await noopAsync();
  }
}
