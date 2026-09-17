import type { SettingGroup as SettingGroupOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { noop } from '../internal/noop.ts';
import { ExtraButtonComponent } from './ExtraButtonComponent.ts';
import { SearchComponent } from './SearchComponent.ts';
import { SettingGroup } from './SettingGroup.ts';

describe('SettingGroup', () => {
  it('should create an instance via create__', () => {
    const container = createDiv();
    const group = SettingGroup.create__(container);
    expect(group).toBeInstanceOf(SettingGroup);
  });

  it('should build the group, search container and list inside containerEl', () => {
    const container = createDiv();
    const group = SettingGroup.create__(container);
    expect(group.groupEl.parentElement).toBe(container);
    expect(group.groupEl.hasClass('setting-group')).toBe(true);
    const children = [...group.groupEl.children];
    expect(children).toHaveLength(2);
    expect(children[0]?.hasClass('setting-group-search')).toBe(true);
    expect(children[1]).toBe(group.listEl);
    expect(group.listEl.hasClass('setting-items')).toBe(true);
  });

  describe('addClass', () => {
    it('should add class to groupEl and return this', () => {
      const group = SettingGroup.create__(createDiv());
      const result = group.addClass('my-class');
      expect(group.groupEl.classList.contains('my-class')).toBe(true);
      expect(result).toBe(group);
    });

    it('should add multiple classes', () => {
      const group = SettingGroup.create__(createDiv());
      group.addClass('a', 'b');
      expect(group.groupEl.classList.contains('a')).toBe(true);
      expect(group.groupEl.classList.contains('b')).toBe(true);
    });
  });

  describe('addExtraButton', () => {
    it('should invoke callback with component and return this', () => {
      const group = SettingGroup.create__(createDiv());
      const callback = vi.fn();
      const result = group.addExtraButton(callback);
      expect(callback).toHaveBeenCalledOnce();
      expect(result).toBe(group);
    });

    it('should add the button to the heading row and show it', () => {
      const group = SettingGroup.create__(createDiv());
      group.addExtraButton(noop).addExtraButton(noop);
      expect(group.components).toHaveLength(2);
      expect(group.components[0]).toBeInstanceOf(ExtraButtonComponent);
      expect(group.controlEl.childElementCount).toBe(2);
      expect(group.groupEl.firstElementChild?.contains(group.controlEl)).toBe(true);
      expect(group.groupEl.childElementCount).toBe(3);
    });
  });

  describe('addSearch', () => {
    it('should invoke callback with component and return this', () => {
      const group = SettingGroup.create__(createDiv());
      const callback = vi.fn();
      const result = group.addSearch(callback);
      expect(callback).toHaveBeenCalledOnce();
      expect(result).toBe(group);
    });

    it('should add the search input to the search container', () => {
      const group = SettingGroup.create__(createDiv());
      group.addSearch(noop);
      expect(group.components[0]).toBeInstanceOf(SearchComponent);
      const searchContainerEl = group.groupEl.firstElementChild;
      expect(searchContainerEl?.hasClass('setting-group-search')).toBe(true);
      expect(searchContainerEl?.firstElementChild?.tagName).toBe('INPUT');
    });
  });

  describe('addSetting', () => {
    it('should invoke callback with setting and return this', () => {
      const group = SettingGroup.create__(createDiv());
      const callback = vi.fn();
      const result = group.addSetting(callback);
      expect(callback).toHaveBeenCalledOnce();
      expect(result).toBe(group);
    });

    it('should record the setting and create it in listEl', () => {
      const group = SettingGroup.create__(createDiv());
      group.addSetting(noop);
      expect(group.settings).toHaveLength(1);
      expect(group.settings[0]?.settingEl.parentElement).toBe(group.listEl);
    });
  });

  describe('setHeading', () => {
    it('should prepend a heading element for string text', () => {
      const group = SettingGroup.create__(createDiv());
      const result = group.setHeading('My Heading');
      const headerEl = group.groupEl.firstElementChild;
      expect(headerEl?.hasClass('setting-item-heading')).toBe(true);
      expect(headerEl?.textContent).toBe('My Heading');
      expect(result).toBe(group);
    });

    it('should not prepend header when text is empty', () => {
      const group = SettingGroup.create__(createDiv());
      group.setHeading('');
      expect(group.groupEl.children).toHaveLength(2);
    });

    it('should not prepend the header twice', () => {
      const group = SettingGroup.create__(createDiv());
      group.setHeading('One');
      group.setHeading('Two');
      expect(group.groupEl.children).toHaveLength(3);
      expect(group.groupEl.firstElementChild?.textContent).toBe('Two');
    });

    it('should detach header when clearing text after setting it', () => {
      const group = SettingGroup.create__(createDiv());
      group.setHeading('Heading');
      expect(group.groupEl.children).toHaveLength(3);
      group.setHeading('');
      expect(group.groupEl.children).toHaveLength(2);
    });

    it('should keep the header for an empty heading while it holds a control', () => {
      const group = SettingGroup.create__(createDiv());
      group.addExtraButton(noop);
      group.setHeading('');
      expect(group.groupEl.firstElementChild?.contains(group.controlEl)).toBe(true);
    });

    it('should return this for DocumentFragment text', () => {
      const group = SettingGroup.create__(createDiv());
      const fragment = document.createDocumentFragment();
      fragment.append('Fragment heading');
      const result = group.setHeading(fragment);
      expect(result).toBe(group);
      expect(group.groupEl.firstElementChild?.textContent).toBe('Fragment heading');
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const group = SettingGroup.create__(createDiv());
      const original: SettingGroupOriginal = group.asOriginalType__();
      expect(original).toBe(group);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const group = SettingGroup.create__(createDiv());
      const mock = SettingGroup.fromOriginalType__(group.asOriginalType__());
      expect(mock).toBe(group);
    });
  });
});
