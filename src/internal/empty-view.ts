/**
 * @file
 *
 * Mock of Obsidian's empty view — the "New tab" page a leaf shows until something replaces it.
 */

import type { WorkspaceLeaf } from '../obsidian/WorkspaceLeaf.ts';

import { ItemView } from '../obsidian/ItemView.ts';
import { noop } from './noop.ts';
import { strictProxy } from './strict-proxy.ts';
import { EMPTY_VIEW_TYPE } from './workspace-layout.ts';

/**
 * The text Obsidian's empty view shows in its tab header, `labelNewTab` in the shipped `i18n.js`.
 */
const NEW_TAB_LABEL = 'New tab';

/**
 * The "New tab" page every leaf holds until a view replaces it, and holds again once that view closes.
 *
 * Lives here rather than in `src/obsidian/` because `EmptyView` is an `obsidian-typings` interface with no
 * `obsidian.d.ts` counterpart — the same case L1 settles for {@link Plugins}.
 *
 * `WorkspaceLeaf` builds one in its constructor as `_empty` and puts it back whenever
 * `WorkspaceLeaf.open` is passed `null`, which is why a leaf's `view` is never `null`. As in Obsidian it
 * NAVIGATES, so a leaf showing nothing is the one `Workspace.getUnpinnedLeaf` reuses.
 *
 * Only what Obsidian's empty view answers is modeled. Its DOM — the empty-state container, the "Create new
 * file" / "Go to file" / "Close" actions and the drop target — is not: the actions run commands through
 * `app.commands`, which this package deliberately does not mock.
 */
export class EmptyView extends ItemView {
  /**
   * Whether the view takes part in navigation history. Obsidian's empty view opts back into the history the
   * base view opts out of, which is what lets a new tab be reused rather than pushed aside.
   */
  public override navigation = true;

  /**
   * Creates the empty view in a leaf.
   *
   * @param leaf - The workspace leaf that hosts the view.
   */
  protected constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    const self = strictProxy(this);
    self.constructor4__(leaf);
    return self;
  }

  /**
   * Mock-only factory: creates the empty view, spyable via `vi.spyOn(EmptyView, 'create2__')`. Numbered because it
   * is the subclass variant of the `Component` factory.
   *
   * @param leaf - The workspace leaf that hosts the view.
   * @returns The new view.
   */
  public static create2__(leaf: WorkspaceLeaf): EmptyView {
    return new EmptyView(leaf);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(EmptyView.prototype, 'constructor4__')`.
   *
   * @param _leaf - The leaf the view was created in.
   */
  public constructor4__(_leaf: WorkspaceLeaf): void {
    noop();
  }

  /**
   * Gets the text shown in the view's tab header.
   *
   * @returns Obsidian's own "New tab" label.
   */
  public getDisplayText(): string {
    return NEW_TAB_LABEL;
  }

  /**
   * Gets the identifier of the view's type.
   *
   * @returns `'empty'`, the type Obsidian reports for a leaf showing nothing.
   */
  public getViewType(): string {
    return EMPTY_VIEW_TYPE;
  }
}
