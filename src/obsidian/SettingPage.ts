/**
 * @file
 *
 * Mock of Obsidian's `SettingPage`, a page rendered inside the settings modal.
 */

import type { SettingPage as SettingPageOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

/**
 * Mock of Obsidian's `SettingPage` base class.
 *
 * The constructor builds detached root, titlebar and content elements; subclasses render into
 * {@link SettingPage.containerEl} from {@link SettingPage.display}.
 */
export abstract class SettingPage {
  /**
   * Container for the page's content, which {@link SettingPage.display} renders into.
   */
  public containerEl: HTMLElement;

  /**
   * The page's outermost element, holding the titlebar and the content container.
   */
  public rootEl: HTMLElement;

  /**
   * Title displayed in the page titlebar; empty until a subclass sets it.
   */
  public title = '';

  /**
   * The element holding the page's titlebar.
   */
  public titlebarEl: HTMLElement;

  /**
   * Creates the page and its detached root, titlebar and content elements.
   */
  public constructor() {
    this.rootEl = createDiv();
    this.titlebarEl = this.rootEl.createDiv();
    this.containerEl = this.rootEl.createDiv();
    const self = strictProxy(this);
    self.constructor__();
    return self;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `SettingPage` as this mock.
   *
   * @param value - The value typed as the original `SettingPage`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: SettingPageOriginal): SettingPage {
    return strictProxy(value, SettingPage);
  }

  /**
   * Mock-only: views this mock as Obsidian's `SettingPage` type.
   *
   * @returns The same object, typed as the original `SettingPage`.
   */
  public asOriginalType__(): SettingPageOriginal {
    return strictProxy<SettingPageOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(SettingPage.prototype, 'constructor__')`.
   */
  public constructor__(): void {
    noop();
  }

  /**
   * Called when the page is opened; clears and re-renders content into {@link SettingPage.containerEl}.
   */
  public abstract display(): void;

  /**
   * Hides the page's contents when the user navigates away, switches tabs or closes the settings modal.
   * A no-op in the mock.
   */
  public hide(): void {
    noop();
  }
}
