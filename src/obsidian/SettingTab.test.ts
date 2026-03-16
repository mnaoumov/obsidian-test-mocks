import type { SettingTab as SettingTabOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { SettingTab } from './SettingTab.ts';

class ConcreteSettingTab extends SettingTab {
  public display(): void {
    this.containerEl.textContent = 'displayed';
  }
}

describe('SettingTab', () => {
  it('should create an instance via subclass', () => {
    const app = App.createConfigured__();
    const tab = new ConcreteSettingTab(app);
    expect(tab).toBeInstanceOf(SettingTab);
  });

  it('should set app and containerEl', () => {
    const app = App.createConfigured__();
    const tab = new ConcreteSettingTab(app);
    expect(tab.app).toBe(app);
    expect(tab.containerEl).toBeInstanceOf(HTMLDivElement);
  });

  it('should have icon default to empty string', () => {
    const app = App.createConfigured__();
    const tab = new ConcreteSettingTab(app);
    expect(tab.icon).toBe('');
  });

  describe('hide', () => {
    it('should clear containerEl innerHTML', () => {
      const app = App.createConfigured__();
      const tab = new ConcreteSettingTab(app);
      tab.display();
      expect(tab.containerEl.textContent).toBe('displayed');
      tab.hide();
      expect(tab.containerEl.innerHTML).toBe('');
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const app = App.createConfigured__();
      const tab = new ConcreteSettingTab(app);
      const original: SettingTabOriginal = tab.asOriginalType__();
      expect(original).toBe(tab);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const app = App.createConfigured__();
      const tab = new ConcreteSettingTab(app);
      const mock = SettingTab.fromOriginalType__(tab.asOriginalType__());
      expect(mock).toBe(tab);
    });
  });
});
