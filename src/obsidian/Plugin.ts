// eslint-disable-next-line capitalized-comments -- dprint-ignore directive must be lowercase.
// dprint-ignore -- Alias sort order differs from original name order.
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

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { Component } from './Component.ts';

export abstract class Plugin extends Component {
  public app: App;
  public commands = new Map<string, Command>();
  public data__: unknown = {};
  public extensions__ = new Map<string, string>();
  public hoverLinkSources__ = new Map<string, HoverLinkSource>();
  public manifest: PluginManifest;
  public markdownCodeBlockProcessors__ = new Map<string, (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => unknown>();
  public markdownPostProcessors__: MarkdownPostProcessor[] = [];
  public ribbonActions__: HTMLElement[] = [];
  public settingTabs__: PluginSettingTab[] = [];
  public statusBarItems__: HTMLElement[] = [];
  public views__ = new Map<string, ViewCreator>();

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
    this.ribbonActions__.push(el);
    return el;
  }

  public addSettingTab(settingTab: PluginSettingTab): void {
    this.settingTabs__.push(settingTab);
  }

  public addStatusBarItem(): HTMLElement {
    const el = createDiv();
    this.statusBarItems__.push(el);
    return el;
  }

  public override asOriginalType__(): PluginOriginal {
    return castTo<PluginOriginal>(this);
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- Implements async obsidian.d.ts interface.
  public async loadData(): Promise<unknown> {
    return this.data__;
  }

  public onUserEnable(): void {
    noop();
  }

  public registerExtensions(extensions: string[], viewType: string): void {
    for (const ext of extensions) {
      this.extensions__.set(ext, viewType);
    }
  }

  public registerHoverLinkSource(id: string, info: HoverLinkSource): void {
    this.hoverLinkSources__.set(id, info);
  }

  public registerMarkdownCodeBlockProcessor(
    language: string,
    handler: (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => unknown,
    _sortOrder?: number
  ): MarkdownPostProcessor {
    this.markdownCodeBlockProcessors__.set(language, handler);
    // eslint-disable-next-line func-style, func-names -- Placeholder processor assigned to typed const; real processing is not simulated.
    const processor: MarkdownPostProcessor = function (_el: HTMLElement, _ctx: MarkdownPostProcessorContext): void {
      noop();
    };
    this.markdownPostProcessors__.push(processor);
    return processor;
  }

  public registerMarkdownPostProcessor(postProcessor: MarkdownPostProcessor, _sortOrder?: number): MarkdownPostProcessor {
    this.markdownPostProcessors__.push(postProcessor);
    return postProcessor;
  }

  public registerView(type: string, viewCreator: ViewCreator): void {
    this.views__.set(type, viewCreator);
  }

  public removeCommand(commandId: string): void {
    this.commands.delete(commandId);
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- Implements async obsidian.d.ts interface.
  public async saveData(data: unknown): Promise<void> {
    this.data__ = data;
  }
}
