import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { ensureGenericObject } from '../../internal/type-guards.ts';
import { App } from '../../obsidian/App.ts';
import { Modal } from '../../obsidian/Modal.ts';
import {
  bridgeModal,
  unbridgeModal
} from './modal-bridge.ts';

describe('modal-bridge', () => {
  afterEach(() => {
    unbridgeModal();
  });

  function createModal(): Modal {
    return Modal.create__(App.createConfigured__());
  }

  it('should bridge bgEl getter to bgEl__', () => {
    bridgeModal();
    const modal = createModal();
    expect(ensureGenericObject(modal)['bgEl']).toBe(modal.bgEl__);
  });

  it('should bridge headerEl getter to headerEl__', () => {
    bridgeModal();
    const modal = createModal();
    expect(ensureGenericObject(modal)['headerEl']).toBe(modal.headerEl__);
  });

  it('should not overwrite if property already exists', () => {
    bridgeModal();
    bridgeModal();
    const modal = createModal();
    expect(ensureGenericObject(modal)['bgEl']).toBe(modal.bgEl__);
    expect(ensureGenericObject(modal)['headerEl']).toBe(modal.headerEl__);
  });

  it('should remove bridge on unbridge', () => {
    bridgeModal();
    unbridgeModal();
    expect('bgEl' in Modal.prototype).toBe(false);
    expect('headerEl' in Modal.prototype).toBe(false);
  });
});
