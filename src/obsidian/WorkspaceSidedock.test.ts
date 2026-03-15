import type { WorkspaceSidedock as WorkspaceSidedockOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { WorkspaceSidedock } from './WorkspaceSidedock.ts';

describe('WorkspaceSidedock', () => {
  it('should create an instance via create3__', async () => {
    const app = await App.createConfigured__();
    const sidedock = WorkspaceSidedock.create3__(app.workspace, 'vertical', 'left');
    expect(sidedock).toBeInstanceOf(WorkspaceSidedock);
  });

  describe('collapse()', () => {
    it('should set collapsed to true', async () => {
      const app = await App.createConfigured__();
      const sidedock = WorkspaceSidedock.create3__(app.workspace, 'vertical', 'left');
      sidedock.collapse();
      expect(sidedock.collapsed).toBe(true);
    });
  });

  describe('expand()', () => {
    it('should set collapsed to false', async () => {
      const app = await App.createConfigured__();
      const sidedock = WorkspaceSidedock.create3__(app.workspace, 'vertical', 'left');
      sidedock.collapse();
      sidedock.expand();
      expect(sidedock.collapsed).toBe(false);
    });
  });

  describe('toggle()', () => {
    it('should toggle collapsed state', async () => {
      const app = await App.createConfigured__();
      const sidedock = WorkspaceSidedock.create3__(app.workspace, 'vertical', 'left');
      expect(sidedock.collapsed).toBe(false);
      sidedock.toggle();
      expect(sidedock.collapsed).toBe(true);
      sidedock.toggle();
      expect(sidedock.collapsed).toBe(false);
    });
  });

  describe('asOriginalType5__()', () => {
    it('should return the same instance typed as the original', async () => {
      const app = await App.createConfigured__();
      const sidedock = WorkspaceSidedock.create3__(app.workspace, 'vertical', 'left');
      const original: WorkspaceSidedockOriginal = sidedock.asOriginalType5__();
      expect(original).toBe(sidedock);
    });
  });

  describe('fromOriginalType5__', () => {
    it('should return the same instance typed as the mock type', async () => {
      const app = await App.createConfigured__();
      const sidedock = WorkspaceSidedock.create3__(app.workspace, 'vertical', 'left');
      const mock = WorkspaceSidedock.fromOriginalType5__(sidedock.asOriginalType5__());
      expect(mock).toBe(sidedock);
    });
  });
});
