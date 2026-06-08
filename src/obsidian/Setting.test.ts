import type { Setting as SettingOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { noop } from '../internal/noop.ts';
import { BaseComponent } from './BaseComponent.ts';
import { Setting } from './Setting.ts';

class TestComponent extends BaseComponent {
  public override disabled = false;

  public constructor() {
    super();
  }

  public override then(cb: (component: this) => unknown): this {
    cb(this);
    return this;
  }
}

describe('Setting', () => {
  it('should create an instance via create__', () => {
    const containerEl = createDiv();
    const setting = Setting.create__(containerEl);
    expect(setting).toBeInstanceOf(Setting);
  });

  it('should append settingEl to containerEl', () => {
    const containerEl = createDiv();
    Setting.create__(containerEl);
    expect(containerEl.children.length).toBeGreaterThan(0);
  });

  describe('setName', () => {
    it('should set string name', () => {
      const setting = Setting.create__(createDiv());
      setting.setName('My Setting');
      expect(setting.nameEl.textContent).toBe('My Setting');
    });

    it('should set DocumentFragment name', () => {
      const setting = Setting.create__(createDiv());
      const fragment = document.createDocumentFragment();
      fragment.append('Fragment Name');
      setting.setName(fragment);
      expect(setting.nameEl.textContent).toContain('Fragment Name');
    });

    it('should return this', () => {
      const setting = Setting.create__(createDiv());
      expect(setting.setName('test')).toBe(setting);
    });
  });

  describe('setDesc', () => {
    it('should set string description', () => {
      const setting = Setting.create__(createDiv());
      setting.setDesc('Description text');
      expect(setting.descEl.textContent).toBe('Description text');
    });

    it('should set DocumentFragment description', () => {
      const setting = Setting.create__(createDiv());
      const fragment = document.createDocumentFragment();
      fragment.append('Fragment Desc');
      setting.setDesc(fragment);
      expect(setting.descEl.textContent).toContain('Fragment Desc');
    });
  });

  describe('setClass', () => {
    it('should add a CSS class', () => {
      const setting = Setting.create__(createDiv());
      setting.setClass('my-class');
      expect(setting.settingEl.classList.contains('my-class')).toBe(true);
    });
  });

  describe('setDisabled', () => {
    it('should toggle disabled class', () => {
      const setting = Setting.create__(createDiv());
      setting.setDisabled(true);
      expect(setting.settingEl.classList.contains('is-disabled')).toBe(true);
      setting.setDisabled(false);
      expect(setting.settingEl.classList.contains('is-disabled')).toBe(false);
    });
  });

  describe('setHeading', () => {
    it('should add heading class', () => {
      const setting = Setting.create__(createDiv());
      setting.setHeading();
      expect(setting.settingEl.classList.contains('setting-item-heading')).toBe(true);
    });
  });

  describe('setTooltip', () => {
    it('should set aria-label attribute', () => {
      const setting = Setting.create__(createDiv());
      setting.setTooltip('My tooltip');
      expect(setting.settingEl.getAttribute('aria-label')).toBe('My tooltip');
    });
  });

  describe('clear', () => {
    it('should clear components', () => {
      const setting = Setting.create__(createDiv());
      setting.addText(() => {
        noop();
      });
      expect(setting.components.length).toBeGreaterThan(0);
      setting.clear();
      expect(setting.components).toEqual([]);
    });
  });

  describe('then', () => {
    it('should call callback with this', () => {
      const setting = Setting.create__(createDiv());
      const cb = vi.fn();
      setting.then(cb);
      expect(cb).toHaveBeenCalledWith(setting);
    });

    it('should return this', () => {
      const setting = Setting.create__(createDiv());
      expect(setting.then(() => {
        noop();
      })).toBe(setting);
    });
  });

  describe('component adders', () => {
    it('should add a button component', () => {
      const setting = Setting.create__(createDiv());
      setting.addButton(() => {
        noop();
      });
      expect(setting.components.length).toBe(1);
    });

    it('should add a color picker component', () => {
      const setting = Setting.create__(createDiv());
      setting.addColorPicker(() => {
        noop();
      });
      expect(setting.components.length).toBe(1);
    });

    it('should add a dropdown component', () => {
      const setting = Setting.create__(createDiv());
      setting.addDropdown(() => {
        noop();
      });
      expect(setting.components.length).toBe(1);
    });

    it('should add an extra button component', () => {
      const setting = Setting.create__(createDiv());
      setting.addExtraButton(() => {
        noop();
      });
      expect(setting.components.length).toBe(1);
    });

    it('should add a moment format component', () => {
      const setting = Setting.create__(createDiv());
      setting.addMomentFormat(() => {
        noop();
      });
      expect(setting.components.length).toBe(1);
    });

    it('should add a progress bar component', () => {
      const setting = Setting.create__(createDiv());
      setting.addProgressBar(() => {
        noop();
      });
      expect(setting.components.length).toBe(1);
    });

    it('should add a search component', () => {
      const setting = Setting.create__(createDiv());
      setting.addSearch(() => {
        noop();
      });
      expect(setting.components.length).toBe(1);
    });

    it('should add a slider component', () => {
      const setting = Setting.create__(createDiv());
      setting.addSlider(() => {
        noop();
      });
      expect(setting.components.length).toBe(1);
    });

    it('should add a text component', () => {
      const setting = Setting.create__(createDiv());
      setting.addText(() => {
        noop();
      });
      expect(setting.components.length).toBe(1);
    });

    it('should add a text area component', () => {
      const setting = Setting.create__(createDiv());
      setting.addTextArea(() => {
        noop();
      });
      expect(setting.components.length).toBe(1);
    });

    it('should add a toggle component', () => {
      const setting = Setting.create__(createDiv());
      setting.addToggle(() => {
        noop();
      });
      expect(setting.components.length).toBe(1);
    });

    it('should add a custom component via addComponent', () => {
      const setting = Setting.create__(createDiv());
      setting.addComponent(() => new TestComponent());
      expect(setting.components.length).toBe(1);
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const setting = Setting.create__(createDiv());
      const original: SettingOriginal = setting.asOriginalType__();
      expect(original).toBe(setting);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const setting = Setting.create__(createDiv());
      const mock = Setting.fromOriginalType__(setting.asOriginalType__());
      expect(mock).toBe(setting);
    });
  });
});
