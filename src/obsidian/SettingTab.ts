import type {
  IconName as IconNameOriginal,
  SettingDefinitionItem as SettingDefinitionItemOriginal,
  Setting as SettingOriginal,
  SettingTab as SettingTabOriginal
} from 'obsidian';

import type {
  RenderedSettingGroup,
  RenderedSettingRow
} from '../internal/setting-definition-renderer.ts';
import type { App } from './App.ts';

import { noop } from '../internal/noop.ts';
import {
  applyDomState,
  renderSettingDefinitions
} from '../internal/setting-definition-renderer.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

export abstract class SettingTab {
  public app: App;
  public containerEl: HTMLDivElement;
  public icon: IconNameOriginal = '';
  public settingItems: SettingDefinitionItemOriginal[] = [];
  private renderedGroups: RenderedSettingGroup[] = [];

  public constructor(app: App, setting?: SettingOriginal) {
    this.app = app;
    this.containerEl = createDiv();
    const self = strictProxy(this);
    self.constructor__(app, setting);
    return self;
  }

  public static fromOriginalType__(value: SettingTabOriginal): SettingTab {
    return strictProxy(value, SettingTab);
  }

  public asOriginalType__(): SettingTabOriginal {
    return strictProxy<SettingTabOriginal>(this);
  }

  public constructor__(_app: App, _setting?: SettingOriginal): void {
    noop();
  }

  public display(): void {
    noop();
  }

  public getControlValue(_key: string): unknown {
    return undefined;
  }

  public getRenderedRows__(): RenderedSettingRow[] {
    return this.renderedGroups.flatMap((group) => group.children);
  }

  public getSettingDefinitions(): SettingDefinitionItemOriginal[] {
    return [];
  }

  public hide(): void {
    this.renderedGroups = [];
    this.containerEl.replaceChildren();
  }

  public refreshDomState(): void {
    applyDomState(this.renderedGroups);
  }

  public renderTab__(): void {
    if (this.settingItems.length === 0) {
      this.renderedGroups = [];
      this.display();
      return;
    }

    this.renderedGroups = renderSettingDefinitions(this.settingItems, this.containerEl);
  }

  public setControlValue(_key: string, _value: unknown): void {
    noop();
  }

  public update(): void {
    this.settingItems = this.getSettingDefinitions();
  }
}
