/**
 * @file
 *
 * Mock of Obsidian's `QueryController`, which runs a Bases query and notifies views of results.
 */

import type { QueryController as QueryControllerOriginal } from 'obsidian';

import type { App } from './App.ts';
import type { TFile } from './TFile.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { Component } from './Component.ts';

/**
 * Mock of Obsidian's `QueryController`, which executes a Bases query, evaluates its filters and formulas, and
 * notifies views of updated results.
 *
 * The mock runs no query: it is a bare `Component` whose constructor arguments only reach the construction hook.
 */
export class QueryController extends Component {
  /**
   * Creates a query controller.
   *
   * @param app - The app instance.
   * @param plugin - The plugin instance the controller belongs to.
   * @param containerEl - The element the controller renders into; Obsidian creates the view header and the view
   * container inside it.
   * @param currentFile - The file the query is shown for, if any.
   */
  public constructor(app: App, plugin: unknown, containerEl: HTMLElement, currentFile?: null | TFile) {
    super();
    const self = strictProxy(this);
    self.constructor2__(app, plugin, containerEl, currentFile);
    return self;
  }

  /**
   * Mock-only factory: creates a query controller, spyable via `vi.spyOn(QueryController, 'create2__')`.
   * It is the subclass variant of `Component`'s factory.
   *
   * @param app - The app instance.
   * @param plugin - The plugin instance the controller belongs to.
   * @param containerEl - The element the controller renders into; Obsidian creates the view header and the view
   * container inside it.
   * @param currentFile - The file the query is shown for, if any.
   * @returns The new query controller.
   */
  public static create2__(app: App, plugin: unknown, containerEl: HTMLElement, currentFile?: null | TFile): QueryController {
    return new QueryController(app, plugin, containerEl, currentFile);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `QueryController` as this mock.
   *
   * @param value - The value typed as the original `QueryController`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType2__(value: QueryControllerOriginal): QueryController {
    return strictProxy(value, QueryController);
  }

  /**
   * Mock-only: views this mock as Obsidian's `QueryController` type.
   *
   * @returns The same object, typed as the original `QueryController`.
   */
  public asOriginalType2__(): QueryControllerOriginal {
    return strictProxy<QueryControllerOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(QueryController.prototype, 'constructor2__')`.
   *
   * @param _app - The app the controller was created with.
   * @param _plugin - The plugin the controller was created with.
   * @param _containerEl - The container element the controller was created with.
   * @param _currentFile - The current file the controller was created with.
   */
  public constructor2__(_app: App, _plugin: unknown, _containerEl: HTMLElement, _currentFile?: null | TFile): void {
    noop();
  }
}
