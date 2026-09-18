/**
 * @file
 *
 * Mock of Obsidian's `ItemView`, the base class of views with a content area and header actions.
 */

import type {
  IconName as IconNameOriginal,
  ItemView as ItemViewOriginal
} from 'obsidian';

import type { WorkspaceLeaf } from './WorkspaceLeaf.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { View } from './View.ts';

/**
 * Mock of Obsidian's `ItemView`.
 *
 * {@link ItemView.contentEl} is a real child of the view's container; header actions are not rendered.
 */
export abstract class ItemView extends View {
  /**
   * The element views render their content into, created inside the view's container.
   */
  public contentEl: HTMLElement;

  /**
   * Creates an item view in a leaf.
   *
   * @param leaf - The workspace leaf that hosts the view.
   */
  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.contentEl = this.containerEl.createDiv();
    const self = strictProxy(this);
    self.constructor3__(leaf);
    return self;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `ItemView` as this mock.
   *
   * @param value - The value typed as the original `ItemView`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType3__(value: ItemViewOriginal): ItemView {
    return strictProxy(value, ItemView);
  }

  /**
   * Adds an icon button to the view's header.
   *
   * The mock does not attach the button or wire the callback: it returns a new detached element.
   *
   * @param _icon - The icon id to show on the button.
   * @param _title - The button's tooltip.
   * @param _callback - The handler to call when the button is clicked; never called by the mock.
   * @returns A new detached element standing in for the button.
   */
  public addAction(_icon: IconNameOriginal, _title: string, _callback: (event: MouseEvent) => unknown): HTMLElement {
    return createDiv();
  }

  /**
   * Mock-only: views this mock as Obsidian's `ItemView` type.
   *
   * @returns The same object, typed as the original `ItemView`.
   */
  public asOriginalType3__(): ItemViewOriginal {
    return strictProxy<ItemViewOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(ItemView.prototype, 'constructor3__')`.
   *
   * @param _leaf - The leaf the view was created in.
   */
  public constructor3__(_leaf: WorkspaceLeaf): void {
    noop();
  }
}
