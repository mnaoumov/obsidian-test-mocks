import type {
  SettingDefinitionItem as SettingDefinitionItemOriginal,
  SettingTab as SettingTabOriginal
} from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { App } from './App.ts';
import { SettingTab } from './SettingTab.ts';

class BareSettingTab extends SettingTab {}

class ConcreteSettingTab extends SettingTab {
  public override display(): void {
    this.containerEl.textContent = 'displayed';
  }
}

class DeclarativeSettingTab extends ConcreteSettingTab {
  public isRowVisible = true;

  public override getSettingDefinitions(): SettingDefinitionItemOriginal[] {
    return [{
      heading: 'Group',
      items: [
        { name: 'Row', render: (): void => undefined, visible: (): boolean => this.isRowVisible }
      ],
      type: 'group'
    }];
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
    it('should not throw when nothing was rendered', () => {
      const app = App.createConfigured__();
      const tab = new ConcreteSettingTab(app);
      expect(() => {
        tab.refreshDomState();
      }).not.toThrow();
    });

    it('should re-evaluate the predicates of the rendered rows in place', () => {
      const app = App.createConfigured__();
      const tab = new DeclarativeSettingTab(app);
      tab.update();
      tab.renderTab();

      const row = tab.getRenderedRows__()[0];
      expect(row?.isVisible).toBe(true);

      tab.isRowVisible = false;
      tab.refreshDomState();

      expect(row?.isVisible).toBe(false);
      expect(row?.settingEl.style.display).toBe('none');
    });
  });

  describe('renderTab', () => {
    it('should render the setting definitions stored by update', () => {
      const app = App.createConfigured__();
      const tab = new DeclarativeSettingTab(app);
      tab.update();
      tab.renderTab();

      const rows = tab.getRenderedRows__();
      expect(rows).toHaveLength(1);
      expect(rows[0]?.setting.nameEl.textContent).toBe('Row');
      expect(tab.containerEl.textContent).toContain('Group');
    });

    it('should fall back to display when there are no setting definitions', () => {
      const app = App.createConfigured__();
      const tab = new ConcreteSettingTab(app);
      const displaySpy = vi.spyOn(tab, 'display');
      tab.update();
      tab.renderTab();

      expect(displaySpy).toHaveBeenCalledTimes(1);
      expect(tab.getRenderedRows__()).toEqual([]);
    });
  });

  describe('getRenderedRows__', () => {
    it('should return an empty array before anything is rendered', () => {
      const app = App.createConfigured__();
      const tab = new DeclarativeSettingTab(app);
      expect(tab.getRenderedRows__()).toEqual([]);
    });

    it('should be cleared by hide', () => {
      const app = App.createConfigured__();
      const tab = new DeclarativeSettingTab(app);
      tab.update();
      tab.renderTab();
      expect(tab.getRenderedRows__()).toHaveLength(1);

      tab.hide();
      expect(tab.getRenderedRows__()).toEqual([]);
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
