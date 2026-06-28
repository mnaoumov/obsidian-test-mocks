import type { SettingPage as SettingPageOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { SettingPage } from './SettingPage.ts';

class ConcreteSettingPage extends SettingPage {
  public display(): void {
    this.containerEl.textContent = 'page';
  }
}

describe('SettingPage', () => {
  it('should create an instance with rootEl, titlebarEl and containerEl', () => {
    const page = new ConcreteSettingPage();
    expect(page).toBeInstanceOf(SettingPage);
    expect(page.rootEl).toBeInstanceOf(HTMLElement);
    expect(page.titlebarEl).toBeInstanceOf(HTMLElement);
    expect(page.containerEl).toBeInstanceOf(HTMLElement);
    expect(page.title).toBe('');
  });

  describe('display', () => {
    it('should render into containerEl', () => {
      const page = new ConcreteSettingPage();
      page.display();
      expect(page.containerEl.textContent).toBe('page');
    });
  });

  describe('hide', () => {
    it('should not throw', () => {
      const page = new ConcreteSettingPage();
      expect(() => {
        page.hide();
      }).not.toThrow();
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const page = new ConcreteSettingPage();
      const original: SettingPageOriginal = page.asOriginalType__();
      expect(original).toBe(page);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const page = new ConcreteSettingPage();
      const mock = SettingPage.fromOriginalType__(page.asOriginalType__());
      expect(mock).toBe(page);
    });
  });
});
