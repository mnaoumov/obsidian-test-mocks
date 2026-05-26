import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { ensureGenericObject } from '../../internal/type-guards.ts';
import { CapacitorAdapter } from '../../obsidian/CapacitorAdapter.ts';
import {
  bridgeCapacitorAdapter,
  unbridgeCapacitorAdapter
} from './capacitor-adapter-bridge.ts';

describe('capacitor-adapter-bridge', () => {
  afterEach(() => {
    unbridgeCapacitorAdapter();
  });

  it('should bridge insensitive getter to insensitive__', () => {
    bridgeCapacitorAdapter();
    const adapter = CapacitorAdapter.create__('/vault', {});
    adapter.insensitive__ = true;
    expect(ensureGenericObject(adapter)['insensitive']).toBe(true);
  });

  it('should bridge insensitive setter to insensitive__', () => {
    bridgeCapacitorAdapter();
    const adapter = CapacitorAdapter.create__('/vault', {});
    ensureGenericObject(adapter)['insensitive'] = true;
    expect(adapter.insensitive__).toBe(true);
  });

  it('should not overwrite if property already exists', () => {
    bridgeCapacitorAdapter();
    bridgeCapacitorAdapter();
    const adapter = CapacitorAdapter.create__('/vault', {});
    expect(ensureGenericObject(adapter)['insensitive']).toBe(false);
  });

  it('should remove bridge on unbridge', () => {
    bridgeCapacitorAdapter();
    unbridgeCapacitorAdapter();
    const adapter = CapacitorAdapter.create__('/vault', {});
    expect('insensitive' in adapter).toBe(false);
  });
});
