import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { ensureGenericObject } from '../../internal/type-guards.ts';
import { Setting } from '../../obsidian/Setting.ts';
import {
  bridgeSetting,
  unbridgeSetting
} from './setting-bridge.ts';

type SetVisibilityFn = (this: Setting, visible: boolean) => Setting;

describe('setting-bridge', () => {
  afterEach(() => {
    unbridgeSetting();
  });

  it('should bridge setVisibility to toggle the settingEl display and return the setting', () => {
    bridgeSetting();
    const container = document.createElement('div');
    const setting = Setting.create__(container);
    const setVisibility = ensureGenericObject(setting)['setVisibility'] as SetVisibilityFn;

    expect(setVisibility.call(setting, false)).toBe(setting);
    expect(setting.settingEl.style.display).toBe('none');

    setVisibility.call(setting, true);
    expect(setting.settingEl.style.display).toBe('');
  });

  it('should not overwrite if property already exists', () => {
    bridgeSetting();
    bridgeSetting();
    const container = document.createElement('div');
    const setting = Setting.create__(container);
    const setVisibility = ensureGenericObject(setting)['setVisibility'] as SetVisibilityFn;
    expect(setVisibility.call(setting, false)).toBe(setting);
  });

  it('should remove bridge on unbridge', () => {
    bridgeSetting();
    unbridgeSetting();
    const container = document.createElement('div');
    const setting = Setting.create__(container);
    expect('setVisibility' in setting).toBe(false);
  });
});
