import type { SettingTab as SettingTabOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { SettingTab } from './SettingTab.ts';

class BareSettingTab extends SettingTab {}

class ConcreteSettingTab extends SettingTab {
  public override display(): void {
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

  it('should default settingItems to an empty array', () => {
    const app = App.createConfigured__();
    const tab = new ConcreteSettingTab(app);
    expect(tab.settingItems).toEqual([]);
  });

  it('should have a no-op base display', () => {
    const app = App.createConfigured__();
    const tab = new BareSettingTab(app);
    expect(() => {
      tab.display();
    }).not.toThrow();
  });

  describe('getSettingDefinitions', () => {
    it('should return an empty array by default', () => {
      const app = App.createConfigured__();
      const tab = new ConcreteSettingTab(app);
      expect(tab.getSettingDefinitions()).toEqual([]);
    });
  });

  describe('getControlValue / setControlValue', () => {
    it('should return undefined for any key by default', () => {
      const app = App.createConfigured__();
      const tab = new ConcreteSettingTab(app);
      expect(tab.getControlValue('key')).toBeUndefined();
    });

    it('should not throw when setting a control value', () => {
      const app = App.createConfigured__();
      const tab = new ConcreteSettingTab(app);
      expect(() => {
        tab.setControlValue('key', 'value');
      }).not.toThrow();
    });
  });

  describe('refreshDomState', () => {
    it('should not throw', () => {
      const app = App.createConfigured__();
      const tab = new ConcreteSettingTab(app);
      expect(() => {
        tab.refreshDomState();
      }).not.toThrow();
    });
  });

  describe('update', () => {
    it('should store the result of getSettingDefinitions in settingItems', () => {
      const app = App.createConfigured__();
      const tab = new ConcreteSettingTab(app);
      tab.update();
      expect(tab.settingItems).toEqual(tab.getSettingDefinitions());
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
