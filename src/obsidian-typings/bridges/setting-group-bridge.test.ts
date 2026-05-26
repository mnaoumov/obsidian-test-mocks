import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { ensureGenericObject } from '../../internal/type-guards.ts';
import { SettingGroup } from '../../obsidian/SettingGroup.ts';
import {
  bridgeSettingGroup,
  unbridgeSettingGroup
} from './setting-group-bridge.ts';

describe('setting-group-bridge', () => {
  afterEach(() => {
    unbridgeSettingGroup();
  });

  it('should bridge listEl getter to listEl__', () => {
    bridgeSettingGroup();
    const container = document.createElement('div');
    const group = SettingGroup.create__(container);
    expect(ensureGenericObject(group)['listEl']).toBe(group.listEl__);
  });

  it('should not overwrite if property already exists', () => {
    bridgeSettingGroup();
    bridgeSettingGroup();
    const container = document.createElement('div');
    const group = SettingGroup.create__(container);
    expect(ensureGenericObject(group)['listEl']).toBe(group.listEl__);
  });

  it('should remove bridge on unbridge', () => {
    bridgeSettingGroup();
    unbridgeSettingGroup();
    const container = document.createElement('div');
    const group = SettingGroup.create__(container);
    expect('listEl' in group).toBe(false);
  });
});
