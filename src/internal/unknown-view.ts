/**
 * @file
 *
 * Mock of Obsidian's unknown view — what a leaf shows when no creator is registered for its view type.
 */

import type { IconName as IconNameOriginal } from 'obsidian';

import type { WorkspaceLeaf } from '../obsidian/WorkspaceLeaf.ts';

import { EmptyView } from './empty-view.ts';
import { noop } from './noop.ts';
import { strictProxy } from './strict-proxy.ts';

/**
 * The icon Obsidian's unknown view carries.
 */
const UNKNOWN_VIEW_ICON = 'lucide-ghost';

/**
 * The stand-in Obsidian shows for a view type nothing has registered a creator for — a note opened after its
 * plugin was disabled, or a state restored from a layout the plugin no longer serves.
 *
 * Lives here rather than in `src/obsidian/` because `UnknownView` is an `obsidian-typings` interface with no
 * `obsidian.d.ts` counterpart — the same case L1 settles for {@link Plugins}.
 *
 * `WorkspaceLeaf.setViewState` builds one for an unregistered type, and for a registered creator that throws.
 * It keeps the type it could not build, so `leaf.view.getViewType()` still answers with it and the leaf is still
 * found by `Workspace.getLeavesOfType`, exactly as in Obsidian.
 *
 * Its DOM is not modeled, for the reason {@link EmptyView}'s is not.
 */
export class UnknownView extends EmptyView {
  private readonly viewType: string;

  /**
   * Creates the unknown view in a leaf, for the view type that could not be built.
   *
   * @param leaf - The workspace leaf that hosts the view.
   * @param viewType - The view type the leaf was asked for.
   */
  protected constructor(leaf: WorkspaceLeaf, viewType: string) {
    super(leaf);
    this.viewType = viewType;
    const self = strictProxy(this);
    self.constructor5__(leaf, viewType);
    return self;
  }

  /**
   * Mock-only factory: creates the unknown view, spyable via `vi.spyOn(UnknownView, 'create3__')`. Numbered
   * because {@link EmptyView.create2__} takes a different signature.
   *
   * @param leaf - The workspace leaf that hosts the view.
   * @param viewType - The view type the leaf was asked for.
   * @returns The new view.
   */
  public static create3__(leaf: WorkspaceLeaf, viewType: string): UnknownView {
    return new UnknownView(leaf, viewType);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(UnknownView.prototype, 'constructor5__')`.
   *
   * @param _leaf - The leaf the view was created in.
   * @param _viewType - The view type the view was created for.
   */
  public constructor5__(_leaf: WorkspaceLeaf, _viewType: string): void {
    noop();
  }

  /**
   * Gets the text shown in the view's tab header.
   *
   * @returns The view type that could not be built, which is what Obsidian shows there.
   */
  public override getDisplayText(): string {
    return this.viewType;
  }

  /**
   * Gets the view's icon.
   *
   * @returns Obsidian's ghost glyph, which it gives every unknown pane.
   */
  public override getIcon(): IconNameOriginal {
    return UNKNOWN_VIEW_ICON;
  }

  /**
   * Gets the identifier of the view's type.
   *
   * @returns The view type the leaf was asked for, which the view keeps although it could not be built.
   */
  public override getViewType(): string {
    return this.viewType;
  }
}
