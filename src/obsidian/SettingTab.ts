import type {
  IconName as IconNameOriginal,
  SettingDefinitionItem as SettingDefinitionItemOriginal,
  Setting as SettingOriginal,
  SettingTab as SettingTabOriginal
} from 'obsidian';

import type { App } from './App.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

export abstract class SettingTab {
  public app: App;
  public containerEl: HTMLDivElement;
  public icon: IconNameOriginal = '';
  public settingItems: SettingDefinitionItemOriginal[] = [];

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

  public getSettingDefinitions(): SettingDefinitionItemOriginal[] {
    return [];
  }

  public hide(): void {
    this.containerEl.innerHTML = '';
  }

  public refreshDomState(): void {
    noop();
  }

  public setControlValue(_key: string, _value: unknown): void {
    noop();
  }

  public update(): void {
    this.settingItems = this.getSettingDefinitions();
  }
}
