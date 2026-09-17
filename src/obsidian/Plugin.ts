/**
 * @file
 *
 * Mock of Obsidian's `Plugin`, the base class every community plugin extends.
 */

import type {
  BasesViewRegistration as BasesViewRegistrationOriginal,
  CliFlags as CliFlagsOriginal,
  CliHandler as CliHandlerOriginal,
  Command as CommandOriginal,
  EditorSuggest as EditorSuggestOriginal,
  HoverLinkSource as HoverLinkSourceOriginal,
  MarkdownPostProcessorContext as MarkdownPostProcessorContextOriginal,
  MarkdownPostProcessor as MarkdownPostProcessorOriginal,
  ObsidianProtocolHandler as ObsidianProtocolHandlerOriginal,
  PluginManifest as PluginManifestOriginal,
  Plugin as PluginOriginal,
  PluginSettingTab as PluginSettingTabOriginal,
  ViewCreator as ViewCreatorOriginal
} from 'obsidian';

import type { App } from './App.ts';

import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { Component } from './Component.ts';

/**
 * Mock of Obsidian's `Plugin` base class.
 *
 * Nothing is registered with the app: every `add*` and `register*` call is recorded in a mock-only collection on the
 * plugin (such as {@link Plugin.commands__} or {@link Plugin.views__}) so a test can inspect it, and
 * {@link Plugin.loadData} / {@link Plugin.saveData} read and write {@link Plugin.data__} in memory instead of
 * `data.json`.
 */
export abstract class Plugin extends Component {
  /**
   * The app instance the plugin runs in.
   */
  public app: App;

  /**
   * Mock-only: the Bases view registrations passed to {@link Plugin.registerBasesView}, keyed by view id.
   */
  public basesViewRegistrations__ = new Map<string, BasesViewRegistrationOriginal>();

  /**
   * Mock-only: the handlers passed to {@link Plugin.registerCliHandler}, keyed by command id.
   */
  public cliHandlers__ = new Map<string, CliHandlerOriginal>();

  /**
   * Mock-only: the commands passed to {@link Plugin.addCommand}, keyed by their unprefixed id.
   */
  public commands__ = new Map<string, CommandOriginal>();

  /**
   * Mock-only: the in-memory stand-in for the plugin's `data.json`, returned by {@link Plugin.loadData} and replaced
   * by {@link Plugin.saveData} (an empty object initially).
   */
  public data__: unknown = {};

  /**
   * Mock-only: the CodeMirror extensions passed to {@link Plugin.registerEditorExtension}, in registration order.
   */
  public editorExtensions__: unknown[] = [];

  /**
   * Mock-only: the editor suggests passed to {@link Plugin.registerEditorSuggest}, in registration order.
   */
  public editorSuggests__: EditorSuggestOriginal<unknown>[] = [];

  /**
   * Mock-only: the file extensions passed to {@link Plugin.registerExtensions}, each mapped to its view type.
   */
  public extensions__ = new Map<string, string>();

  /**
   * Mock-only: the hover link sources passed to {@link Plugin.registerHoverLinkSource}, keyed by id.
   */
  public hoverLinkSources__ = new Map<string, HoverLinkSourceOriginal>();

  /**
   * The plugin's manifest, as read from its `manifest.json`.
   */
  public manifest: PluginManifestOriginal;

  /**
   * Mock-only: the code block handlers passed to {@link Plugin.registerMarkdownCodeBlockProcessor}, keyed by
   * language.
   */
  public markdownCodeBlockProcessors__ = new Map<string, (source: string, el: HTMLElement, context: MarkdownPostProcessorContextOriginal) => unknown>();

  /**
   * Mock-only: the post processors registered directly or created for code block processors, in registration order.
   */
  public markdownPostProcessors__: MarkdownPostProcessorOriginal[] = [];

  /**
   * Mock-only: the `obsidian://` handlers passed to {@link Plugin.registerObsidianProtocolHandler}, keyed by action.
   */
  public obsidianProtocolHandlers__ = new Map<string, ObsidianProtocolHandlerOriginal>();

  /**
   * Mock-only: the elements returned by {@link Plugin.addRibbonIcon}, in creation order.
   */
  public ribbonActions__: HTMLElement[] = [];

  /**
   * The plugin's settings. Obsidian leaves it for the plugin to assign, typically from loaded data in `onload`.
   */
  public settings?: unknown;

  /**
   * Mock-only: the tabs passed to {@link Plugin.addSettingTab}, in registration order.
   */
  public settingTabs__: PluginSettingTabOriginal[] = [];

  /**
   * Mock-only: the elements returned by {@link Plugin.addStatusBarItem}, in creation order.
   */
  public statusBarItems__: HTMLElement[] = [];

  /**
   * Mock-only: the view creators passed to {@link Plugin.registerView}, keyed by view type.
   */
  public views__ = new Map<string, ViewCreatorOriginal>();

  /**
   * Creates the plugin. Obsidian constructs it when the plugin is loaded, before calling `onload`.
   *
   * @param app - The app instance.
   * @param manifest - The plugin's manifest.
   */
  public constructor(app: App, manifest: PluginManifestOriginal) {
    super();
    this.app = app;
    this.manifest = manifest;
    const self = strictProxy(this);
    self.constructor2__(app, manifest);
    return self;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `Plugin` as this mock.
   *
   * @param value - The value typed as the original `Plugin`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType2__(value: PluginOriginal): Plugin {
    return strictProxy(value, Plugin);
  }

  /**
   * Registers a command globally, making it available in the command palette. Obsidian prefixes the id and name with
   * the plugin's; the mock stores the command unchanged in {@link Plugin.commands__}, replacing one with the same id.
   *
   * @param command - The command to register.
   * @returns The same command object.
   */
  public addCommand(command: CommandOriginal): CommandOriginal {
    this.commands__.set(command.id, command);
    return command;
  }

  /**
   * Adds an icon to the left ribbon. The mock creates a detached element, records it in
   * {@link Plugin.ribbonActions__}, and never calls the callback.
   *
   * @param _icon - The icon name.
   * @param _title - The tooltip text.
   * @param _callback - The click callback.
   * @returns The ribbon icon element.
   */
  public addRibbonIcon(_icon: string, _title: string, _callback: (event: MouseEvent) => unknown): HTMLElement {
    const el = createDiv();
    this.ribbonActions__.push(el);
    return el;
  }

  /**
   * Registers a settings tab that lets users change the plugin's settings. The mock records it in
   * {@link Plugin.settingTabs__}.
   *
   * @param settingTab - The settings tab.
   */
  public addSettingTab(settingTab: PluginSettingTabOriginal): void {
    this.settingTabs__.push(settingTab);
  }

  /**
   * Adds an item to the status bar at the bottom of the app (not available on mobile). The mock creates a detached
   * element and records it in {@link Plugin.statusBarItems__}.
   *
   * @returns The status bar item element, for the plugin to fill.
   */
  public addStatusBarItem(): HTMLElement {
    const el = createDiv();
    this.statusBarItems__.push(el);
    return el;
  }

  /**
   * Mock-only: views this mock as Obsidian's `Plugin` type.
   *
   * @returns The same object, typed as the original `Plugin`.
   */
  public asOriginalType2__(): PluginOriginal {
    return strictProxy<PluginOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(Plugin.prototype, 'constructor2__')`.
   *
   * @param _app - The app the plugin was created with.
   * @param _manifest - The manifest the plugin was created with.
   */
  public constructor2__(_app: App, _manifest: PluginManifestOriginal): void {
    noop();
  }

  /**
   * Loads the plugin's settings data, which Obsidian reads from `data.json` in the plugin folder.
   *
   * @returns A promise resolving to {@link Plugin.data__}.
   */
  public async loadData(): Promise<unknown> {
    await noopAsync();
    return this.data__;
  }

  /**
   * Called when `data.json` is modified on disk outside Obsidian, for example by a sync service; plugins override it
   * to reload their settings. A no-op by default, and the mock never calls it.
   */
  public onExternalSettingsChange(): void {
    noop();
  }

  /**
   * Called once the user has explicitly enabled the plugin, so it is safe to engage with them (for example, to open
   * a custom view). A no-op by default, and the mock never calls it.
   */
  public onUserEnable(): void {
    noop();
  }

  /**
   * Registers a Bases view handler that renders data from property queries. The mock records it in
   * {@link Plugin.basesViewRegistrations__}.
   *
   * @param viewId - The view id.
   * @param registration - The view registration.
   * @returns Always `true` in the mock; Obsidian returns `false` when Bases is not enabled in the vault.
   */
  public registerBasesView(viewId: string, registration: BasesViewRegistrationOriginal): boolean {
    this.basesViewRegistrations__.set(viewId, registration);
    return true;
  }

  /**
   * Registers a handler for a command invoked from the Obsidian CLI. Obsidian throws when the command id is already
   * registered; the mock records the handler in {@link Plugin.cliHandlers__}, replacing any previous one.
   *
   * @param command - The globally unique command id.
   * @param _description - The help text shown for the command.
   * @param _flags - The command-line flags the command accepts, or `null`.
   * @param handler - The callback that handles an invocation.
   */
  public registerCliHandler(command: string, _description: string, _flags: CliFlagsOriginal | null, handler: CliHandlerOriginal): void {
    this.cliHandlers__.set(command, handler);
  }

  /**
   * Registers a CodeMirror 6 extension, or an array of them, for the editor. The mock records it in
   * {@link Plugin.editorExtensions__}.
   *
   * @param extension - The extension or array of extensions.
   */
  public registerEditorExtension(extension: unknown): void {
    this.editorExtensions__.push(extension);
  }

  /**
   * Registers an editor suggest that offers live suggestions while the user types. The mock records it in
   * {@link Plugin.editorSuggests__}.
   *
   * @param editorSuggest - The editor suggest.
   */
  public registerEditorSuggest(editorSuggest: EditorSuggestOriginal<unknown>): void {
    this.editorSuggests__.push(editorSuggest);
  }

  /**
   * Associates file extensions with a view type. The mock maps each extension to `viewType` in
   * {@link Plugin.extensions__}.
   *
   * @param extensions - The file extensions, without the leading dot.
   * @param viewType - The view type that opens those files.
   */
  public registerExtensions(extensions: string[], viewType: string): void {
    for (const extension of extensions) {
      this.extensions__.set(extension, viewType);
    }
  }

  /**
   * Registers a view with the Page preview core plugin as a source of `hover-link` events. The mock records it in
   * {@link Plugin.hoverLinkSources__}.
   *
   * @param id - The source id.
   * @param info - The hover link source description.
   */
  public registerHoverLinkSource(id: string, info: HoverLinkSourceOriginal): void {
    this.hoverLinkSources__.set(id, info);
  }

  /**
   * Registers a handler for fenced code blocks of a language; Obsidian replaces the block's `<pre><code>` with a
   * `<div>` the handler fills. The mock records the handler in {@link Plugin.markdownCodeBlockProcessors__} and
   * never calls it.
   *
   * @param language - The code block language.
   * @param handler - The callback that renders a block's source into its element.
   * @param _sortOrder - The processor's position relative to other post processors.
   * @returns A new no-op post processor, also recorded in {@link Plugin.markdownPostProcessors__}.
   */
  public registerMarkdownCodeBlockProcessor(
    language: string,
    handler: (source: string, el: HTMLElement, context: MarkdownPostProcessorContextOriginal) => unknown,
    _sortOrder?: number
  ): MarkdownPostProcessorOriginal {
    this.markdownCodeBlockProcessors__.set(language, handler);
    // eslint-disable-next-line func-style, func-names, unicorn/consistent-function-scoping -- Mock implementation. It stays local because each registration has to return a DISTINCT function object; a module-scope one would make every call push and return the same identity.
    const processor: MarkdownPostProcessorOriginal = function (_el: HTMLElement, _context: MarkdownPostProcessorContextOriginal): void {
      noop();
    };
    this.markdownPostProcessors__.push(processor);
    return processor;
  }

  /**
   * Registers a post processor that changes how documents look in reading mode. The mock records it in
   * {@link Plugin.markdownPostProcessors__} and never calls it.
   *
   * @param postProcessor - The post processor.
   * @param _sortOrder - The processor's position relative to other post processors.
   * @returns The same post processor.
   */
  public registerMarkdownPostProcessor(postProcessor: MarkdownPostProcessorOriginal, _sortOrder?: number): MarkdownPostProcessorOriginal {
    this.markdownPostProcessors__.push(postProcessor);
    return postProcessor;
  }

  /**
   * Registers a handler for `obsidian://` URLs with the given action. The mock records it in
   * {@link Plugin.obsidianProtocolHandlers__}.
   *
   * @param action - The action, such as `open` for `obsidian://open`.
   * @param handler - The callback, given the key-value pairs decoded from the URL's query.
   */
  public registerObsidianProtocolHandler(action: string, handler: ObsidianProtocolHandlerOriginal): void {
    this.obsidianProtocolHandlers__.set(action, handler);
  }

  /**
   * Registers a view type and the function that creates its views. The mock records it in {@link Plugin.views__}.
   *
   * @param type - The view type.
   * @param viewCreator - The function that creates a view for a leaf.
   */
  public registerView(type: string, viewCreator: ViewCreatorOriginal): void {
    this.views__.set(type, viewCreator);
  }

  /**
   * Removes a command from the global command list; only needed for commands registered dynamically. The mock
   * deletes it from {@link Plugin.commands__}.
   *
   * @param commandId - The id the command was added with.
   */
  public removeCommand(commandId: string): void {
    this.commands__.delete(commandId);
  }

  /**
   * Saves the plugin's settings data, which Obsidian writes to `data.json` in the plugin folder. The mock replaces
   * {@link Plugin.data__}.
   *
   * @param data - The data to save.
   */
  public async saveData(data: unknown): Promise<void> {
    await noopAsync();
    this.data__ = data;
  }
}
