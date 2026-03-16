import type { SettingGroup as SettingGroupOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { SettingGroup } from './SettingGroup.ts';

describe('SettingGroup', () => {
  it('should create an instance via create__', () => {
    const container = createDiv();
    const group = SettingGroup.create__(container);
    expect(group).toBeInstanceOf(SettingGroup);
  });

  it('should append listEl__ to containerEl', () => {
    const container = createDiv();
    const group = SettingGroup.create__(container);
    expect(container.contains(group.listEl__)).toBe(true);
  });

  describe('addClass', () => {
    it('should add class to listEl__ and return this', () => {
      const group = SettingGroup.create__(createDiv());
      const result = group.addClass('my-class');
      expect(group.listEl__.classList.contains('my-class')).toBe(true);
      expect(result).toBe(group);
    });
  });

  describe('addExtraButton', () => {
    it('should invoke callback with component and return this', () => {
      const group = SettingGroup.create__(createDiv());
      const cb = vi.fn();
      const result = group.addExtraButton(cb);
      expect(cb).toHaveBeenCalledOnce();
      expect(result).toBe(group);
    });
  });

  describe('addSearch', () => {
    it('should invoke callback with component and return this', () => {
      const group = SettingGroup.create__(createDiv());
      const cb = vi.fn();
      const result = group.addSearch(cb);
      expect(cb).toHaveBeenCalledOnce();
      expect(result).toBe(group);
    });
  });

  describe('addSetting', () => {
    it('should invoke callback with setting and return this', () => {
      const group = SettingGroup.create__(createDiv());
      const cb = vi.fn();
      const result = group.addSetting(cb);
      expect(cb).toHaveBeenCalledOnce();
      expect(result).toBe(group);
    });
  });

  describe('setHeading', () => {
    it('should prepend a heading element for string text', () => {
      const group = SettingGroup.create__(createDiv());
      const result = group.setHeading('My Heading');
      const heading = group.listEl__.querySelector('h3');
      expect(heading).not.toBeNull();
      expect(heading?.textContent).toBe('My Heading');
      expect(result).toBe(group);
    });

    it('should return this for non-string text', () => {
      const group = SettingGroup.create__(createDiv());
      const fragment = document.createDocumentFragment();
      fragment.append('Fragment heading');
      const result = group.setHeading(fragment);
      expect(result).toBe(group);
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
