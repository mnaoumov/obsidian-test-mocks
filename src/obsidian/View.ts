import type {
  IconName,
  Menu,
  Scope,
  ViewStateResult
} from 'obsidian';

import {
  noop,
  noopAsync
} from '../internal/Noop.ts';
import { App } from './App.ts';
import { Component } from './Component.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

export abstract class View extends Component {
  public app: App = new App();
  public containerEl: HTMLElement = createDiv();
  public icon: IconName = '';
  public leaf: WorkspaceLeaf = new WorkspaceLeaf();
  public navigation = true;
  public scope: Scope | null = null;

  public constructor(_leaf: WorkspaceLeaf) {
    super();
  }

  public abstract getDisplayText(): string;

  public getEphemeralState(): Record<string, unknown> {
    return {};
  }

  public getIcon(): IconName {
    return this.icon;
  }

  public getState(): Record<string, unknown> {
    return {};
  }

  public abstract getViewType(): string;

  protected async onClose(): Promise<void> {
    await noopAsync();
  }

  protected async onOpen(): Promise<void> {
    await noopAsync();
  }

  public onPaneMenu(_menu: Menu, _source: string): void {
    noop();
  }

  public onResize(): void {
    noop();
  }

  public setEphemeralState(_state: unknown): void {
    noop();
  }

  public async setState(_state: unknown, _result: ViewStateResult): Promise<void> {
    await noopAsync();
  }
}
