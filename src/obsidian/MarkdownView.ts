import type {
  EventRef,
  HoverPopover,
  IconName,
  Menu,
  ViewStateResult
} from 'obsidian';

import type { TFile } from './TFile.ts';

import { App } from './App.ts';
import { Component } from './Component.ts';
import { Editor } from './Editor.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

class MockEditor extends Editor {}

export class MarkdownView {
  public allowNoFile = false;
  public app: App;
  public containerEl: HTMLElement;
  public contentEl: HTMLElement;
  public data = '';
  public editor: Editor;
  public file: null | TFile = null;
  public hoverPopover: HoverPopover | null = null;
  public icon: IconName = '';
  public leaf: WorkspaceLeaf;
  public navigation = true;
  public scope = null;

  public constructor() {
    this.app = App.create__();
    this.containerEl = createDiv();
    this.contentEl = createDiv();
    this.editor = new MockEditor();
    this.leaf = WorkspaceLeaf.create__();
  }

  private _children: Component[] = [];
  private _cleanups: Array<() => unknown> = [];
  private _currentModeScroll = 0;
  private _ephemeralState: unknown = {};
  private _events: EventRef[] = [];
  private _intervals: number[] = [];
  private _loaded = false;
  private _mode: 'preview' | 'source' = 'source';
  private _previewModeScroll = 0;
  private _state: unknown = {};

  public currentMode = {
    applyScroll: (scroll: number): void => {
      this._currentModeScroll = scroll;
    },
    clear: (): void => {
      this.editor.setValue('');
    },
    get: (): string => {
      return this.editor.getValue();
    },
    getScroll: (): number => {
      return this._currentModeScroll;
    },
    rerender: (): void => {
      // No-op in mock.
    },
    set: (data: string, _clear: boolean): void => {
      this.editor.setValue(data);
    }
  };

  public previewMode = {
    applyScroll: (scroll: number): void => {
      this._previewModeScroll = scroll;
    },
    clear: (): void => {
      this.data = '';
    },
    containerEl: createDiv(),
    get: (): string => {
      return this.data;
    },
    getScroll: (): number => {
      return this._previewModeScroll;
    },
    rerender: (): void => {
      // No-op in mock.
    },
    set: (data: string, _clear: boolean): void => {
      this.data = data;
    }
  };

  public addAction(icon: IconName, title: string, callback: (evt: MouseEvent) => unknown): HTMLElement {
    const el = createDiv();
    el.setAttribute('aria-label', title);
    el.setAttribute('data-icon', icon);
    el.addEventListener('click', callback as EventListener);
    this.containerEl.appendChild(el);
    return el;
  }

  public addChild<T extends Component>(component: T): T {
    this._children.push(component);
    if (this._loaded) {
      component.load();
    }
    return component;
  }

  public canAcceptExtension(extension: string): boolean {
    return extension === 'md';
  }

  public clear(): void {
    this.data = '';
    this.editor.setValue('');
  }

  public getDisplayText(): string {
    return this.file?.basename ?? '';
  }

  public getEphemeralState(): unknown {
    return this._ephemeralState;
  }

  public getIcon(): string {
    return this.icon;
  }

  public getMode(): 'preview' | 'source' {
    return this._mode;
  }

  public getState(): unknown {
    return this._state;
  }

  public getViewData(): string {
    return this.data;
  }

  public getViewType(): string {
    return 'markdown';
  }

  public load(): void {
    this._loaded = true;
    this.onload();
  }

  public onload(): void {
    // Override point.
  }

  public onPaneMenu(_menu: Menu, _source: string): void {
    // Override point.
  }

  public onResize(): void {
    // Override point.
  }

  public onunload(): void {
    // Override point.
  }

  public register(cb: () => unknown): void {
    this._cleanups.push(cb);
  }

  public registerDomEvent(
    el: Document | HTMLElement | Window,
    type: string,
    callback: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | boolean
  ): void {
    el.addEventListener(type, callback, options);
    this.register(() => {
      el.removeEventListener(type, callback, options);
    });
  }

  public registerEvent(ref: EventRef): void {
    this._events.push(ref);
  }

  public registerInterval(id: number): number {
    this._intervals.push(id);
    return id;
  }

  public removeChild<T extends Component>(component: T): T {
    const index = this._children.indexOf(component);
    if (index !== -1) {
      this._children.splice(index, 1);
    }
    component.unload();
    return component;
  }

  public requestSave(): void {
    // No-op in mock.
  }

  public async save(_clear?: boolean): Promise<void> {
    // No-op in mock — no vault reference available.
  }

  public setEphemeralState(state: unknown): void {
    this._ephemeralState = state;
  }

  public async setState(state: unknown, _result: ViewStateResult): Promise<void> {
    this._state = state;
  }

  public setViewData(data: string, _clear: boolean): void {
    this.data = data;
    this.editor.setValue(data);
  }

  public showSearch(_replace?: boolean): void {
    // No-op in mock.
  }

  public unload(): void {
    this.onunload();

    for (const child of [...this._children]) {
      this.removeChild(child);
    }
    this._children = [];

    this._events = [];

    for (const cleanup of this._cleanups) {
      cleanup();
    }
    this._cleanups = [];

    for (const id of this._intervals) {
      clearInterval(id);
    }
    this._intervals = [];

    this._loaded = false;
  }
}
