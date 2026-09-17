/**
 * @file
 *
 * Mock of Obsidian's `BasesView`, the base class plugins extend to render a Base.
 */

import type {
  BasesPropertyId as BasesPropertyIdOriginal,
  BasesView as BasesViewOriginal
} from 'obsidian';

import type { QueryController } from './QueryController.ts';

import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { App } from './App.ts';
import { BasesQueryResult } from './BasesQueryResult.ts';
import { BasesViewConfig } from './BasesViewConfig.ts';
import { Component } from './Component.ts';

/**
 * Mock of Obsidian's abstract `BasesView`, which plugins extend to render a Base.
 *
 * A new view gets a freshly configured mock app, an empty unnamed {@link BasesViewConfig} and an empty
 * {@link BasesQueryResult}; the controller is not used.
 */
export abstract class BasesView extends Component {
  /**
   * All properties available in the dataset. Empty in the mock until a test assigns it.
   */
  public allProperties: BasesPropertyIdOriginal[] = [];

  /**
   * The app the view belongs to; a new configured mock app per view.
   */
  public app: App;

  /**
   * The configuration of this view, as set from the Bases toolbar and view options.
   */
  public config: BasesViewConfig;

  /**
   * The most recent query result. Obsidian replaces it whenever the vault or the Base changes, so views should not
   * keep a reference to it.
   */
  public data: BasesQueryResult;

  /**
   * The type id of this view, supplied by the subclass.
   */
  public abstract type: string;

  /**
   * Creates the view with a new mock app, an empty config and an empty query result.
   *
   * @param controller - The query controller driving the view; only forwarded to the construction hook.
   */
  public constructor(controller: QueryController) {
    super();
    this.app = App.createConfigured__();
    this.config = BasesViewConfig.create__('', '', '');
    this.data = BasesQueryResult.create__(this.app, this.config, [], []);
    const self = strictProxy(this);
    self.constructor2__(controller);
    return self;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `BasesView` as this mock. Numbered because `Component` already
   * declares `fromOriginalType__` with an incompatible signature.
   *
   * @param value - The value typed as the original `BasesView`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType2__(value: BasesViewOriginal): BasesView {
    return strictProxy(value, BasesView);
  }

  /**
   * Mock-only: views this mock as Obsidian's `BasesView` type. Numbered because `Component` already declares
   * `asOriginalType__`.
   *
   * @returns The same object, typed as the original `BasesView`.
   */
  public asOriginalType2__(): BasesViewOriginal {
    return strictProxy<BasesViewOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(BasesView.prototype, 'constructor2__')`.
   *
   * @param _controller - The query controller the view was created with.
   */
  public constructor2__(_controller: QueryController): void {
    noop();
  }

  /**
   * Shows the new-note menu for a file created from this view, optionally adjusting its frontmatter. A no-op in the
   * mock: no menu is shown and no file is created.
   *
   * @param _baseFileName - The file name to suggest for the new note.
   * @param _frontmatterProcessor - A function that modifies the new note's frontmatter.
   */
  public async createFileForView(_baseFileName?: string, _frontmatterProcessor?: (frontmatter: unknown) => void): Promise<void> {
    await noopAsync();
  }

  /**
   * Called when the query has new data; the view should re-render from {@link BasesView.data}. The mock never
   * calls it on its own.
   */
  public abstract onDataUpdated(): void;
}
