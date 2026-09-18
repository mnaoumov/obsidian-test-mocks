import type { Setting as SettingOriginal } from 'obsidian';

import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { noop } from '../internal/noop.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';
import { BaseComponent } from './BaseComponent.ts';
import { Setting } from './Setting.ts';
import { Platform } from './vars/Platform.ts';

class TestComponent extends BaseComponent {
  public override disabled = false;

  public constructor() {
    super();
  }

  public override then(callback: (component: this) => unknown): this {
    callback(this);
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

  it('should build the DOM tree Obsidian builds', () => {
    const containerEl = createDiv();
    const setting = Setting.create__(containerEl);

    expect(setting.settingEl.className).toBe('setting-item');
    expect(setting.settingEl.getAttribute('tabindex')).toBe('-1');
    expect(setting.infoEl.className).toBe('setting-item-info');
    expect(setting.nameEl.className).toBe('setting-item-name');
    expect(setting.descEl.className).toBe('setting-item-description');
    expect(setting.controlEl.className).toBe('setting-item-control');

    expect([...setting.settingEl.children]).toEqual([setting.infoEl, setting.controlEl]);
    expect([...setting.infoEl.children]).toEqual([setting.nameEl, setting.descEl]);
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

    it('should replace the previous name rather than append to it', () => {
      const setting = Setting.create__(createDiv());
      const fragment = document.createDocumentFragment();
      fragment.append('Fragment Name');
      setting.setName('First');
      setting.setName(fragment);
      setting.setName('Last');
      expect(setting.nameEl.textContent).toBe('Last');
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

    it('should replace the previous description rather than append to it', () => {
      const setting = Setting.create__(createDiv());
      const fragment = document.createDocumentFragment();
      fragment.append('Fragment Desc');
      setting.setDesc('First');
      setting.setDesc(fragment);
      setting.setDesc('Last');
      expect(setting.descEl.textContent).toBe('Last');
    });

    it('should return this', () => {
      const setting = Setting.create__(createDiv());
      expect(setting.setDesc('test')).toBe(setting);
    });
  });

  describe('setClass', () => {
    it('should add a CSS class', () => {
      const setting = Setting.create__(createDiv());
      setting.setClass('my-class');
      expect(setting.settingEl.classList.contains('my-class')).toBe(true);
    });

    it('should split a multi-class string, as Obsidian does', () => {
      const setting = Setting.create__(createDiv());
      setting.setClass('my-class my-other-class');
      expect(setting.settingEl.classList.contains('my-class')).toBe(true);
      expect(setting.settingEl.classList.contains('my-other-class')).toBe(true);
    });

    it('should drop empty parts rather than throwing on them', () => {
      const setting = Setting.create__(createDiv());
      setting.setClass('  my-class   my-other-class  ');
      expect([...setting.settingEl.classList]).toEqual(['setting-item', 'my-class', 'my-other-class']);
    });

    it('should change nothing for an empty string', () => {
      const setting = Setting.create__(createDiv());
      setting.setClass('');
      expect([...setting.settingEl.classList]).toEqual(['setting-item']);
    });

    it('should return this', () => {
      const setting = Setting.create__(createDiv());
      expect(setting.setClass('my-class')).toBe(setting);
    });
  });

  describe('setDisabled', () => {
    it('should toggle disabled class', () => {
      const setting = Setting.create__(createDiv());
      setting.setDisabled(true);
      expect(setting.disabled).toBe(true);
      expect(setting.settingEl.classList.contains('is-disabled')).toBe(true);
      setting.setDisabled(false);
      expect(setting.disabled).toBe(false);
      expect(setting.settingEl.classList.contains('is-disabled')).toBe(false);
    });

    it('should disable and enable every component', () => {
      const setting = Setting.create__(createDiv());
      setting.addText(() => {
        noop();
      }).addToggle(() => {
        noop();
      });
      setting.setDisabled(true);
      expect(setting.components.map((component) => component.disabled)).toEqual([true, true]);
      setting.setDisabled(false);
      expect(setting.components.map((component) => component.disabled)).toEqual([false, false]);
    });
  });

  describe('setErrorMessage', () => {
    it('should create errorEl with the message and add is-invalid class', () => {
      const setting = Setting.create__(createDiv());
      setting.setErrorMessage('Something is wrong');
      expect(setting.errorEl?.textContent).toBe('Something is wrong');
      expect(setting.errorEl?.className).toBe('setting-item-error');
      expect(setting.errorEl?.parentElement).toBe(setting.controlEl);
      expect(setting.settingEl.classList.contains('is-invalid')).toBe(true);
    });

    it('should hide errorEl and remove is-invalid class when message is null, keeping the element as Obsidian does', () => {
      const setting = Setting.create__(createDiv());
      setting.setErrorMessage('error');
      const { errorEl } = setting;
      setting.setErrorMessage(null);
      expect(setting.errorEl).toBe(errorEl);
      expect(errorEl?.style.display).toBe('none');
      expect(setting.settingEl.classList.contains('is-invalid')).toBe(false);
    });

    it('should re-show the same element on a later message', () => {
      const setting = Setting.create__(createDiv());
      setting.setErrorMessage('first');
      const { errorEl } = setting;
      setting.setErrorMessage('');
      setting.setErrorMessage('second');
      expect(setting.errorEl).toBe(errorEl);
      expect(errorEl?.textContent).toBe('second');
      expect(errorEl?.style.display).toBe('');
      expect(setting.controlEl.childElementCount).toBe(1);
    });

    it('should not throw when cleared before any message', () => {
      const setting = Setting.create__(createDiv());
      expect(setting.setErrorMessage(null)).toBe(setting);
      expect(setting.errorEl).toBeNull();
    });

    it('should return this for chaining', () => {
      const setting = Setting.create__(createDiv());
      expect(setting.setErrorMessage('x')).toBe(setting);
    });
  });

  describe('addDisplayValue', () => {
    it('should invoke the callback with a component and return this', () => {
      const setting = Setting.create__(createDiv());
      const callback = vi.fn();
      const result = setting.addDisplayValue(callback);
      expect(callback).toHaveBeenCalledOnce();
      expect(result).toBe(setting);
    });
  });

  describe('addText', () => {
    afterEach(() => {
      Platform.hasPhysicalKeyboard = true;
    });

    function addTextInput(setting: Setting): HTMLInputElement {
      setting.addText(() => {
        noop();
      });
      return ensureNonNullable(setting.controlEl.querySelector('input'));
    }

    it('should blur the input on Enter when the platform has no physical keyboard', () => {
      Platform.hasPhysicalKeyboard = false;
      const inputEl = addTextInput(Setting.create__(createDiv()));
      const blurSpy = vi.spyOn(inputEl, 'blur');
      inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(blurSpy).toHaveBeenCalledOnce();
    });

    it('should leave the input alone on any other key', () => {
      Platform.hasPhysicalKeyboard = false;
      const inputEl = addTextInput(Setting.create__(createDiv()));
      const blurSpy = vi.spyOn(inputEl, 'blur');
      inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      expect(blurSpy).not.toHaveBeenCalled();
    });

    it('should leave a composing Enter alone, so an IME candidate is not dismissed', () => {
      Platform.hasPhysicalKeyboard = false;
      const inputEl = addTextInput(Setting.create__(createDiv()));
      const blurSpy = vi.spyOn(inputEl, 'blur');
      inputEl.dispatchEvent(new KeyboardEvent('keydown', { isComposing: true, key: 'Enter' }));
      expect(blurSpy).not.toHaveBeenCalled();
    });

    it('should leave an Enter a capturing ancestor already default-prevented alone', () => {
      Platform.hasPhysicalKeyboard = false;
      const setting = Setting.create__(createDiv());
      const inputEl = addTextInput(setting);
      const blurSpy = vi.spyOn(inputEl, 'blur');
      // A capturing ancestor listener is the realistic way the flag is already set: the guard is attached when the
      // input is created, so a listener added afterwards on the input itself runs after it.
      setting.controlEl.addEventListener('keydown', (event) => {
        event.preventDefault();
      }, { capture: true });
      inputEl.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter' }));
      expect(blurSpy).not.toHaveBeenCalled();
    });

    it('should not listen at all when the platform has a physical keyboard', () => {
      const inputEl = addTextInput(Setting.create__(createDiv()));
      const blurSpy = vi.spyOn(inputEl, 'blur');
      inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(blurSpy).not.toHaveBeenCalled();
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
    it('should set the aria-label attribute on nameEl, as Obsidian does', () => {
      const setting = Setting.create__(createDiv());
      setting.setTooltip('My tooltip');
      expect(setting.nameEl.getAttribute('aria-label')).toBe('My tooltip');
      expect(setting.settingEl.getAttribute('aria-label')).toBeNull();
    });

    it('should return this for chaining', () => {
      const setting = Setting.create__(createDiv());
      expect(setting.setTooltip('tip')).toBe(setting);
    });
  });

  describe('setNoInfo', () => {
    it('should hide infoEl', () => {
      const setting = Setting.create__(createDiv());
      setting.setNoInfo();
      expect(setting.infoEl.isShown()).toBe(false);
    });

    it('should return this for chaining', () => {
      const setting = Setting.create__(createDiv());
      expect(setting.setNoInfo()).toBe(setting);
    });
  });

  describe('setAction', () => {
    it('should mark the row as an action and run the callback on click', () => {
      const setting = Setting.create__(createDiv());
      const callback = vi.fn();
      setting.setAction(callback);
      expect(setting.settingEl.classList.contains('mod-action')).toBe(true);
      expect(setting.settingEl.classList.contains('tappable')).toBe(true);
      setting.settingEl.click();
      expect(callback).toHaveBeenCalledOnce();
    });

    it('should replace the callback rather than adding a second listener', () => {
      const setting = Setting.create__(createDiv());
      const first = vi.fn();
      const second = vi.fn();
      setting.setAction(first);
      setting.setAction(second);
      setting.settingEl.click();
      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledOnce();
    });

    it('should ignore a click on a disabled row', () => {
      const setting = Setting.create__(createDiv());
      const callback = vi.fn();
      setting.setAction(callback);
      setting.setDisabled(true);
      setting.settingEl.click();
      expect(callback).not.toHaveBeenCalled();
    });

    it('should ignore a click a control inside the row already handled', () => {
      const setting = Setting.create__(createDiv());
      const callback = vi.fn();
      setting.setAction(callback);
      setting.controlEl.addEventListener('click', (event) => {
        event.preventDefault();
      });
      setting.controlEl.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      expect(callback).not.toHaveBeenCalled();
    });

    it('should return this for chaining', () => {
      const setting = Setting.create__(createDiv());
      expect(setting.setAction(noop)).toBe(setting);
    });
  });

  describe('setNavigable', () => {
    it('should mark the row as navigable, add the chevron and run the callback on click', () => {
      const setting = Setting.create__(createDiv());
      const callback = vi.fn();
      setting.setNavigable(callback);
      expect(setting.settingEl.classList.contains('mod-navigable')).toBe(true);
      expect(setting.settingEl.classList.contains('tappable')).toBe(true);
      const chevronEl = setting.controlEl.querySelector<HTMLElement>('.setting-item-chevron');
      expect(chevronEl?.dataset['icon']).toBe('lucide-chevron-right');
      setting.settingEl.click();
      expect(callback).toHaveBeenCalledOnce();
    });

    it('should return this for chaining', () => {
      const setting = Setting.create__(createDiv());
      expect(setting.setNavigable(noop)).toBe(setting);
    });
  });

  describe('clear', () => {
    it('should clear components and their elements', () => {
      const setting = Setting.create__(createDiv());
      setting.addText(() => {
        noop();
      });
      expect(setting.components.length).toBeGreaterThan(0);
      expect(setting.clear()).toBe(setting);
      expect(setting.components).toEqual([]);
      expect(setting.controlEl.childElementCount).toBe(0);
    });

    it('should drop the error element and the is-invalid class', () => {
      const setting = Setting.create__(createDiv());
      setting.setErrorMessage('error');
      setting.clear();
      expect(setting.errorEl).toBeNull();
      expect(setting.settingEl.classList.contains('is-invalid')).toBe(false);
    });
  });

  describe('then', () => {
    it('should call callback with this', () => {
      const setting = Setting.create__(createDiv());
      const callback = vi.fn();
      setting.then(callback);
      expect(callback).toHaveBeenCalledWith(setting);
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

    it('should mark the row mod-toggle, after the callback has run, as Obsidian does', () => {
      const setting = Setting.create__(createDiv());
      let wasMarkedDuringCallback = true;
      setting.addToggle(() => {
        wasMarkedDuringCallback = setting.settingEl.classList.contains('mod-toggle');
      });
      expect(wasMarkedDuringCallback).toBe(false);
      expect(setting.settingEl.classList.contains('mod-toggle')).toBe(true);
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
  describe('setVisibility', () => {
    it('should toggle the settingEl display and return the setting', () => {
      const container = document.createElement('div');
      const setting = Setting.create__(container);

      expect(setting.setVisibility(false)).toBe(setting);
      expect(setting.settingEl.style.display).toBe('none');

      setting.setVisibility(true);
      expect(setting.settingEl.style.display).toBe('');
    });
  });
});
