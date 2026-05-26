import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { ensureGenericObject } from '../../internal/type-guards.ts';
import { Component } from '../../obsidian/Component.ts';
import {
  bridgeComponent,
  unbridgeComponent
} from './component-bridge.ts';

describe('component-bridge', () => {
  afterEach(() => {
    unbridgeComponent();
  });

  describe('_loaded', () => {
    it('should bridge getter to loaded__', () => {
      bridgeComponent();
      const component = Component.create__();
      component.loaded__ = true;
      expect(ensureGenericObject(component)['_loaded']).toBe(true);
    });

    it('should bridge setter to loaded__', () => {
      bridgeComponent();
      const component = Component.create__();
      ensureGenericObject(component)['_loaded'] = true;
      expect(component.loaded__).toBe(true);
    });
  });

  describe('_children', () => {
    it('should bridge getter to children__', () => {
      bridgeComponent();
      const component = Component.create__();
      const child = Component.create__();
      component.children__ = [child];
      expect(ensureGenericObject(component)['_children']).toEqual([child]);
    });

    it('should bridge setter to children__', () => {
      bridgeComponent();
      const component = Component.create__();
      const child = Component.create__();
      ensureGenericObject(component)['_children'] = [child];
      expect(component.children__).toEqual([child]);
    });
  });

  it('should be idempotent', () => {
    bridgeComponent();
    bridgeComponent();
    const component = Component.create__();
    expect(ensureGenericObject(component)['_loaded']).toBe(false);
  });

  it('should remove bridges on unbridge', () => {
    bridgeComponent();
    unbridgeComponent();
    const component = Component.create__();
    expect('_loaded' in component).toBe(false);
    expect('_children' in component).toBe(false);
  });
});
