/**
 * @file
 *
 * Mock of Obsidian's `View`, the content displayed inside a workspace leaf.
 */

import type {
  IconName as IconNameOriginal,
  Menu as MenuOriginal,
  Scope as ScopeOriginal,
  View as ViewOriginal,
  ViewStateResult as ViewStateResultOriginal
} from 'obsidian';

import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { App } from './App.ts';
import { Component } from './Component.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

/**
 * Mock of Obsidian's `View` base class.
 *
 * The view's state and ephemeral state are kept in memory and returned as set; opening, closing, resizing and the
 * pane menu are no-ops.
 */
export abstract class View extends Component {
  /**
   * The app instance, taken from the leaf.
   */
  public app: App;

  /**
   * The view's root element; detached in the mock.
   */
  public containerEl: HTMLElement;

  /**
   * The view's icon, Obsidian's generic document glyph until a subclass sets its own.
   */
  public icon: IconNameOriginal = 'lucide-file';

  /**
   * The workspace leaf hosting the view.
   */
  public leaf: WorkspaceLeaf;

  /**
   * Whether the view takes part in navigation history, like a file view (`true`), rather than being a static panel
   * like the file explorer (`false`). As in Obsidian the base view opts out, and a subclass such as `FileView`
   * opts back in.
   */
  public navigation = false;

  /**
   * An optional scope for hotkeys that apply while the view is focused.
   */
  public scope: null | ScopeOriginal = null;

  private ephemeralState: unknown = {};

  private state: unknown = {};

  /**
   * Creates the view in a leaf, taking the app from it.
   *
   * @param leaf - The workspace leaf that hosts the view.
   */
  public constructor(leaf: WorkspaceLeaf) {
    super();
    this.app = leaf.app__;
    this.containerEl = createDiv();
    this.leaf = leaf;
    const self = strictProxy(this);
    self.constructor2__(leaf);
    return self;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `View` as this mock.
   *
   * @param value - The value typed as the original `View`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType2__(value: ViewOriginal): View {
    return strictProxy(value, View);
  }

  /**
   * Mock-only: views this mock as Obsidian's `View` type.
   *
   * @returns The same object, typed as the original `View`.
   */
  public asOriginalType2__(): ViewOriginal {
    return strictProxy<ViewOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(View.prototype, 'constructor2__')`.
   *
   * @param _leaf - The leaf the view was created in.
   */
  public constructor2__(_leaf: WorkspaceLeaf): void {
    noop();
  }

  /**
   * Gets the human-readable text shown in the view's tab header.
   *
   * @returns The display text.
   */
  public abstract getDisplayText(): string;

  /**
   * Gets the view's ephemeral state, such as scroll position, which is not persisted in the workspace layout.
   *
   * @returns The state last passed to {@link View.setEphemeralState}, or an empty object.
   */
  public getEphemeralState(): Record<string, unknown> {
    return this.ephemeralState as Record<string, unknown>;
  }

  /**
   * Gets the view's icon.
   *
   * @returns The value of {@link View.icon}, or Obsidian's generic document glyph when that has been emptied.
   */
  public getIcon(): IconNameOriginal {
    return this.icon || 'lucide-file';
  }

  /**
   * Gets the view's state, which is persisted in the workspace layout.
   *
   * @returns The state last passed to {@link View.setState}, or an empty object.
   */
  public getState(): Record<string, unknown> {
    return this.state as Record<string, unknown>;
  }

  /**
   * Gets the identifier of the view's type, as registered with `registerView`.
   *
   * @returns The view type.
   */
  public abstract getViewType(): string;

  /**
   * Populates the pane menu shown from the tab header or the "more options" button. A no-op in the mock.
   *
   * @param _menu - The menu to populate.
   * @param _source - Where the menu was opened from, such as `'more-options'` or `'tab-header'`.
   */
  public onPaneMenu(_menu: MenuOriginal, _source: string): void {
    noop();
  }

  /**
   * Called when the view's size changes. A no-op in the mock.
   */
  public onResize(): void {
    noop();
  }

  /**
   * Sets the view's ephemeral state. The mock stores it as given.
   *
   * @param state - The ephemeral state.
   */
  public setEphemeralState(state: unknown): void {
    this.ephemeralState = state;
  }

  /**
   * Sets the view's state. The mock stores it as given and leaves the result untouched.
   *
   * @param state - The new state.
   * @param _result - Receives whether the change should be recorded in navigation history.
   */
  public async setState(state: unknown, _result: ViewStateResultOriginal): Promise<void> {
    await noopAsync();
    this.state = state;
  }

  /**
   * Called when the view is closed, to release its resources. A no-op in the mock.
   */
  protected async onClose(): Promise<void> {
    await noopAsync();
  }

  /**
   * Called when the view is opened, to build its content. A no-op in the mock.
   */
  protected async onOpen(): Promise<void> {
    await noopAsync();
  }
}
