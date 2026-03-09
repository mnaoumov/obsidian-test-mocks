import type {
  Command,
  HoverLinkSource,
  MarkdownPostProcessor,
  MarkdownPostProcessorContext,
  PluginManifest,
  Plugin as PluginOriginal,
  PluginSettingTab,
  ViewCreator
} from 'obsidian';

import type { App } from './App.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { Component } from './Component.ts';

export abstract class Plugin extends Component {
  public _data: unknown = {};
  public _extensions = new Map<string, string>();
  public _hoverLinkSources = new Map<string, HoverLinkSource>();
  public _markdownCodeBlockProcessors = new Map<string, (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => unknown>();
  public _markdownPostProcessors: MarkdownPostProcessor[] = [];
  public _ribbonActions: HTMLElement[] = [];
  public _settingTabs: PluginSettingTab[] = [];
  public _statusBarItems: HTMLElement[] = [];
  public _views = new Map<string, ViewCreator>();
  public app: App;
  public commands = new Map<string, Command>();
  public manifest: PluginManifest;

  public constructor(app: App, manifest: PluginManifest) {
    super();
    this.app = app;
    this.manifest = manifest;
    return strictMock(this);
  }

  public addCommand(command: Command): Command {
    this.commands.set(command.id, command);
    return command;
  }

  public addRibbonIcon(_icon: string, _title: string, _callback: (evt: MouseEvent) => unknown): HTMLElement {
    const el = createDiv();
    this._ribbonActions.push(el);
    return el;
  }

  public addSettingTab(settingTab: PluginSettingTab): void {
    this._settingTabs.push(settingTab);
  }

  public addStatusBarItem(): HTMLElement {
    const el = createDiv();
    this._statusBarItems.push(el);
    return el;
  }

  public override asOriginalType__(): PluginOriginal {
    return castTo<PluginOriginal>(this);
  }

  public async loadData(): Promise<unknown> {
    return this._data;
  }

  public onUserEnable(): void {
  }

  public registerExtensions(extensions: string[], viewType: string): void {
    for (const ext of extensions) {
      this._extensions.set(ext, viewType);
    }
  }

  public registerHoverLinkSource(id: string, info: HoverLinkSource): void {
    this._hoverLinkSources.set(id, info);
  }

  public registerMarkdownCodeBlockProcessor(
    language: string,
    handler: (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => unknown,
    _sortOrder?: number
  ): MarkdownPostProcessor {
    this._markdownCodeBlockProcessors.set(language, handler);
    const processor: MarkdownPostProcessor = (_el: HTMLElement, _ctx: MarkdownPostProcessorContext): void => {
    };
    this._markdownPostProcessors.push(processor);
    return processor;
  }

  public registerMarkdownPostProcessor(postProcessor: MarkdownPostProcessor, _sortOrder?: number): MarkdownPostProcessor {
    this._markdownPostProcessors.push(postProcessor);
    return postProcessor;
  }

  public registerView(type: string, viewCreator: ViewCreator): void {
    this._views.set(type, viewCreator);
  }

  public removeCommand(commandId: string): void {
    this.commands.delete(commandId);
  }

  public async saveData(data: unknown): Promise<void> {
    this._data = data;
  }
}
