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

export abstract class Plugin extends Component {
  public app: App;
  public basesViewRegistrations__ = new Map<string, BasesViewRegistrationOriginal>();
  public cliHandlers__ = new Map<string, CliHandlerOriginal>();
  public commands__ = new Map<string, CommandOriginal>();
  public data__: unknown = {};
  public editorExtensions__: unknown[] = [];
  public editorSuggests__: EditorSuggestOriginal<unknown>[] = [];
  public extensions__ = new Map<string, string>();
  public hoverLinkSources__ = new Map<string, HoverLinkSourceOriginal>();
  public manifest: PluginManifestOriginal;
  public markdownCodeBlockProcessors__ = new Map<string, (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContextOriginal) => unknown>();
  public markdownPostProcessors__: MarkdownPostProcessorOriginal[] = [];
  public obsidianProtocolHandlers__ = new Map<string, ObsidianProtocolHandlerOriginal>();
  public ribbonActions__: HTMLElement[] = [];
  public settings?: unknown;
  public settingTabs__: PluginSettingTabOriginal[] = [];
  public statusBarItems__: HTMLElement[] = [];
  public views__ = new Map<string, ViewCreatorOriginal>();

  public constructor(app: App, manifest: PluginManifestOriginal) {
    super();
    this.app = app;
    this.manifest = manifest;
    const self = strictProxy(this);
    self.constructor2__(app, manifest);
    return self;
  }

  public static fromOriginalType2__(value: PluginOriginal): Plugin {
    return strictProxy(value, Plugin);
  }

  public addCommand(command: CommandOriginal): CommandOriginal {
    this.commands__.set(command.id, command);
    return command;
  }

  public addRibbonIcon(_icon: string, _title: string, _callback: (evt: MouseEvent) => unknown): HTMLElement {
    const el = createDiv();
    this.ribbonActions__.push(el);
    return el;
  }

  public addSettingTab(settingTab: PluginSettingTabOriginal): void {
    this.settingTabs__.push(settingTab);
  }

  public addStatusBarItem(): HTMLElement {
    const el = createDiv();
    this.statusBarItems__.push(el);
    return el;
  }

  public asOriginalType2__(): PluginOriginal {
    return strictProxy<PluginOriginal>(this);
  }

  public constructor2__(_app: App, _manifest: PluginManifestOriginal): void {
    noop();
  }

  public async loadData(): Promise<unknown> {
    await noopAsync();
    return this.data__;
  }

  public onExternalSettingsChange(): void {
    noop();
  }

  public onUserEnable(): void {
    noop();
  }

  public registerBasesView(viewId: string, registration: BasesViewRegistrationOriginal): boolean {
    this.basesViewRegistrations__.set(viewId, registration);
    return true;
  }

  public registerCliHandler(command: string, _description: string, _flags: CliFlagsOriginal | null, handler: CliHandlerOriginal): void {
    this.cliHandlers__.set(command, handler);
  }

  public registerEditorExtension(extension: unknown): void {
    this.editorExtensions__.push(extension);
  }

  public registerEditorSuggest(editorSuggest: EditorSuggestOriginal<unknown>): void {
    this.editorSuggests__.push(editorSuggest);
  }

  public registerExtensions(extensions: string[], viewType: string): void {
    for (const ext of extensions) {
      this.extensions__.set(ext, viewType);
    }
  }

  public registerHoverLinkSource(id: string, info: HoverLinkSourceOriginal): void {
    this.hoverLinkSources__.set(id, info);
  }

  public registerMarkdownCodeBlockProcessor(
    language: string,
    handler: (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContextOriginal) => unknown,
    _sortOrder?: number
  ): MarkdownPostProcessorOriginal {
    this.markdownCodeBlockProcessors__.set(language, handler);
    // eslint-disable-next-line func-style, func-names -- Mock implementation.
    const processor: MarkdownPostProcessorOriginal = function (_el: HTMLElement, _ctx: MarkdownPostProcessorContextOriginal): void {
      noop();
    };
    this.markdownPostProcessors__.push(processor);
    return processor;
  }

  public registerMarkdownPostProcessor(postProcessor: MarkdownPostProcessorOriginal, _sortOrder?: number): MarkdownPostProcessorOriginal {
    this.markdownPostProcessors__.push(postProcessor);
    return postProcessor;
  }

  public registerObsidianProtocolHandler(action: string, handler: ObsidianProtocolHandlerOriginal): void {
    this.obsidianProtocolHandlers__.set(action, handler);
  }

  public registerView(type: string, viewCreator: ViewCreatorOriginal): void {
    this.views__.set(type, viewCreator);
  }

  public removeCommand(commandId: string): void {
    this.commands__.delete(commandId);
  }

  public async saveData(data: unknown): Promise<void> {
    await noopAsync();
    this.data__ = data;
  }
}
