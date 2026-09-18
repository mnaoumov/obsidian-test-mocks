/**
 * @file
 *
 * Mock of the view registry Obsidian exposes as `app.viewRegistry`.
 */

import type { ViewCreator as ViewCreatorOriginal } from 'obsidian';

import type { WorkspaceLeaf } from '../obsidian/WorkspaceLeaf.ts';

import { Events } from '../obsidian/Events.ts';
import { MarkdownView } from '../obsidian/MarkdownView.ts';
import { castTo } from './castTo.ts';
import { noop } from './noop.ts';
import { strictProxy } from './strict-proxy.ts';

/**
 * The file extensions Obsidian registers the Markdown view for.
 */
const MARKDOWN_EXTENSIONS = ['md'];

/**
 * The view type Obsidian registers its Markdown view under.
 */
const MARKDOWN_VIEW_TYPE = 'markdown';

/**
 * The registry behind `App.viewRegistry`: which creator builds a view of a given type, and which view type a file
 * extension opens in.
 *
 * Lives here rather than in `src/obsidian/` because `ViewRegistry` is an `obsidian-typings` interface with no
 * `obsidian.d.ts` counterpart — the same case L1 settles for {@link Plugins}.
 *
 * It is what makes a leaf's view real: `WorkspaceLeaf.setViewState` asks {@link ViewRegistry.getViewCreatorByType}
 * and `WorkspaceLeaf.openFile` asks {@link ViewRegistry.getTypeByExtension}, exactly as Obsidian does.
 *
 * **Only the Markdown view is registered up front.** Obsidian's own constructor also registers its image, audio,
 * video, PDF and release-notes views; this package has a class for none of them, and an extension whose registered
 * type has no creator would open as the unknown-type view where Obsidian opens a real one. Left unregistered, such a
 * file takes Obsidian's own "no view type for this extension" branch in `openFile` instead, which changes nothing.
 */
export class ViewRegistry extends Events {
  /**
   * The view type each file extension opens in, keyed by extension without the leading dot. Obsidian keeps it under
   * this name too.
   */
  public typeByExtension: Record<string, string> = {};

  /**
   * The creator that builds a view of each type, keyed by view type. Obsidian keeps it under this name too.
   */
  public viewByType: Record<string, ViewCreatorOriginal> = {};

  /**
   * Creates a registry holding Obsidian's Markdown view.
   */
  protected constructor() {
    super();
    // The creator receives the leaf Obsidian's `ViewCreator` is declared with; at runtime it is always this package's
    // own leaf, so it is viewed as one rather than re-wrapped.
    this.registerViewWithExtensions(MARKDOWN_EXTENSIONS, MARKDOWN_VIEW_TYPE, (leaf) => MarkdownView.create2__(castTo<WorkspaceLeaf>(leaf)).asOriginalType7__());
    const self = strictProxy(this);
    self.constructor2__();
    return self;
  }

  /**
   * Mock-only factory: creates a view registry, spyable via `vi.spyOn(ViewRegistry, 'create2__')`. Numbered because
   * it is the subclass variant of the `Events` factory.
   *
   * @returns The new registry.
   */
  public static create2__(): ViewRegistry {
    return new ViewRegistry();
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(ViewRegistry.prototype, 'constructor2__')`.
   */
  public constructor2__(): void {
    noop();
  }

  /**
   * Gets the view type a file extension opens in.
   *
   * @param extension - The file extension, without the leading dot.
   * @returns The view type, or `undefined` when the extension is not registered.
   */
  public getTypeByExtension(extension: string): string | undefined {
    return this.typeByExtension[extension];
  }

  /**
   * Gets the creator that builds a view of a type.
   *
   * @param type - The view type.
   * @returns The creator, or `undefined` when the type is not registered.
   */
  public getViewCreatorByType(type: string): undefined | ViewCreatorOriginal {
    return this.viewByType[type];
  }

  /**
   * Checks whether a file extension opens in a registered view type.
   *
   * @param extension - The file extension, without the leading dot.
   * @returns Whether the extension is registered.
   */
  public isExtensionRegistered(extension: string): boolean {
    return this.typeByExtension[extension] !== undefined;
  }

  /**
   * Registers the file extensions a view type opens. As in Obsidian, every extension is checked before any is
   * written, so a clash leaves the registry untouched, and `extensions-updated` is triggered afterwards.
   *
   * @param extensions - The file extensions, without leading dots.
   * @param viewType - The view type the extensions open in.
   * @throws Error when any of the extensions is already registered.
   */
  public registerExtensions(extensions: string[], viewType: string): void {
    for (const extension of extensions) {
      if (this.typeByExtension[extension] !== undefined) {
        throw new Error(`Attempting to register an existing file extension "${extension}"`);
      }
    }

    for (const extension of extensions) {
      this.typeByExtension[extension] = viewType;
    }

    this.trigger('extensions-updated');
  }

  /**
   * Registers the creator that builds views of a type, and triggers `view-registered` with it.
   *
   * @param type - The view type.
   * @param viewCreator - The creator that builds a view of that type for a leaf.
   * @throws Error when the view type is already registered.
   */
  public registerView(type: string, viewCreator: ViewCreatorOriginal): void {
    if (this.viewByType[type] !== undefined) {
      throw new Error(`Attempting to register an existing view type "${type}"`);
    }

    this.viewByType[type] = viewCreator;
    this.trigger('view-registered', type);
  }

  /**
   * Registers a view type and the file extensions that open in it, through {@link ViewRegistry.registerView} and
   * {@link ViewRegistry.registerExtensions}.
   *
   * @param extensions - The file extensions, without leading dots.
   * @param type - The view type.
   * @param viewCreator - The creator that builds a view of that type for a leaf.
   */
  public registerViewWithExtensions(extensions: string[], type: string, viewCreator: ViewCreatorOriginal): void {
    this.registerView(type, viewCreator);
    this.registerExtensions(extensions, type);
  }

  /**
   * Removes file extensions from the registry and triggers `extensions-updated`. As in Obsidian, an extension that
   * was never registered is skipped silently, and the event fires either way.
   *
   * @param extensions - The file extensions, without leading dots.
   */
  public unregisterExtensions(extensions: string[]): void {
    for (const extension of extensions) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- `typeByExtension` is Obsidian's own record keyed by file extension, so removing an entry is a dynamic delete by definition.
      delete this.typeByExtension[extension];
    }

    this.trigger('extensions-updated');
  }

  /**
   * Removes a view type from the registry. As in Obsidian, a type that was never registered changes nothing and
   * triggers nothing; otherwise `view-unregistered` is triggered with it.
   *
   * @param type - The view type.
   */
  public unregisterView(type: string): void {
    if (this.viewByType[type] === undefined) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- `viewByType` is Obsidian's own record keyed by view type, so removing an entry is a dynamic delete by definition.
    delete this.viewByType[type];
    this.trigger('view-unregistered', type);
  }
}
