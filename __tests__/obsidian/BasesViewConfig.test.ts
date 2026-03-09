import type {
  BasesPropertyId,
  BasesSortConfig
} from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import type { BasesView } from '../../src/obsidian/BasesView.ts';

import { BasesViewConfig } from '../../src/obsidian/BasesViewConfig.ts';
import { NullValue } from '../../src/obsidian/NullValue.ts';

describe('BasesViewConfig', () => {
  it('should create an instance via create__', () => {
    const config = BasesViewConfig.create__('', '', 'test');
    expect(config).toBeInstanceOf(BasesViewConfig);
  });

  it('should store the name', () => {
    const config = BasesViewConfig.create__('', '', 'myView');
    expect(config.name).toBe('myView');
  });

  describe('get/set', () => {
    it('should return undefined for unset keys', () => {
      const config = BasesViewConfig.create__('', '', 'test');
      expect(config.get('missing')).toBeUndefined();
    });

    it('should store and retrieve values', () => {
      const config = BasesViewConfig.create__('', '', 'test');
      config.set('key', 'value');
      expect(config.get('key')).toBe('value');
    });
  });

  describe('getAsPropertyId', () => {
    it('should return string values as BasesPropertyId', () => {
      const config = BasesViewConfig.create__('', '', 'test');
      config.set('groupBy', 'prop.status');
      expect(config.getAsPropertyId('groupBy')).toBe('prop.status');
    });

    it('should return null for non-string values', () => {
      const config = BasesViewConfig.create__('', '', 'test');
      const nonStringValue = { key: 'value' };
      config.set('count', nonStringValue);
      expect(config.getAsPropertyId('count')).toBeNull();
    });

    it('should return null for missing keys', () => {
      const config = BasesViewConfig.create__('', '', 'test');
      expect(config.getAsPropertyId('missing')).toBeNull();
    });
  });

  describe('getDisplayName', () => {
    it('should return custom display name when set', () => {
      const config = BasesViewConfig.create__('', '', 'test');
      const propId = 'prop.status' as BasesPropertyId;

      config.setDisplayName__(propId, 'Status');
      expect(config.getDisplayName(propId)).toBe('Status');
    });

    it('should extract name after dot when no custom name', () => {
      const config = BasesViewConfig.create__('', '', 'test');
      expect(config.getDisplayName('prop.status' as BasesPropertyId)).toBe('status');
    });

    it('should return full id when no dot', () => {
      const config = BasesViewConfig.create__('', '', 'test');
      expect(config.getDisplayName('name' as BasesPropertyId)).toBe('name');
    });
  });

  describe('getEvaluatedFormula', () => {
    it('should return a NullValue', () => {
      const config = BasesViewConfig.create__('', '', 'test');
      const result = config.getEvaluatedFormula({} as BasesView, 'formula');
      expect(result).toBeInstanceOf(NullValue);
    });
  });

  describe('getOrder/setOrder__', () => {
    it('should default to empty array', () => {
      const config = BasesViewConfig.create__('', '', 'test');
      expect(config.getOrder()).toEqual([]);
    });

    it('should return the set order', () => {
      const config = BasesViewConfig.create__('', '', 'test');
      const order = ['prop.a' as BasesPropertyId, 'prop.b' as BasesPropertyId];

      config.setOrder__(order);
      expect(config.getOrder()).toEqual(order);
    });
  });

  describe('getSort/setSort__', () => {
    it('should default to empty array', () => {
      const config = BasesViewConfig.create__('', '', 'test');
      expect(config.getSort()).toEqual([]);
    });

    it('should return the set sort config', () => {
      const config = BasesViewConfig.create__('', '', 'test');
      const sort: BasesSortConfig[] = [{ direction: 'ASC', property: 'prop.a' as BasesPropertyId }];

      config.setSort__(sort);
      expect(config.getSort()).toEqual(sort);
    });
  });
});
