import type {
  IconName as IconNameOriginal,
  Menu as MenuOriginal,
  Scope as ScopeOriginal,
  View as ViewOriginal,
  ViewStateResult as ViewStateResultOriginal
} from 'obsidian';

import {
  createMockOf,
  createMockOfUnsafe
} from '../internal/create-mock-of.ts';
import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { App } from './App.ts';
import { Component } from './Component.ts';
import { FileSystemAdapter } from './FileSystemAdapter.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

export abstract class View extends Component {
  public app: App;
  public containerEl: HTMLElement;
  public icon: IconNameOriginal = '';
  public leaf: WorkspaceLeaf;
  public navigation = true;
  public scope: null | ScopeOriginal = null;

  private ephemeralState: unknown = {};

  private state: unknown = {};

  public constructor(leaf: WorkspaceLeaf) {
    super();
    this.app = App.create__(FileSystemAdapter.create__('/mock-vault').asOriginalType__(), '');
    this.containerEl = createDiv();
    this.leaf = leaf;
    const self = createMockOf(this);
    self.constructor2__(leaf);
    return self;
  }

  public static fromOriginalType2__(value: ViewOriginal): View {
    return createMockOfUnsafe<View>(value);
  }

  public asOriginalType2__(): ViewOriginal {
    return createMockOfUnsafe<ViewOriginal>(this);
  }

  public constructor2__(_leaf: WorkspaceLeaf): void {
    noop();
  }

  public abstract getDisplayText(): string;

  public getEphemeralState(): Record<string, unknown> {
    return this.ephemeralState as Record<string, unknown>;
  }

  public getIcon(): IconNameOriginal {
    return this.icon;
  }

  public getState(): Record<string, unknown> {
    return this.state as Record<string, unknown>;
  }

  public abstract getViewType(): string;

  public onPaneMenu(_menu: MenuOriginal, _source: string): void {
    noop();
  }

  public onResize(): void {
    noop();
  }

  public setEphemeralState(state: unknown): void {
    this.ephemeralState = state;
  }

  public async setState(state: unknown, _result: ViewStateResultOriginal): Promise<void> {
    await noopAsync();
    this.state = state;
  }

  protected async onClose(): Promise<void> {
    await noopAsync();
  }

  protected async onOpen(): Promise<void> {
    await noopAsync();
  }
}
