import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { ensureGenericObject } from '../../internal/type-guards.ts';
import { App } from '../../obsidian/App.ts';
import { WorkspaceLeaf } from '../../obsidian/WorkspaceLeaf.ts';
import {
  bridgeWorkspaceLeaf,
  unbridgeWorkspaceLeaf
} from './workspace-leaf-bridge.ts';

type OnOpenTabHeaderMenuFunction = (this: WorkspaceLeaf, event: MouseEvent, parentEl: HTMLElement) => void;

describe('workspace-leaf-bridge', () => {
  afterEach(() => {
    unbridgeWorkspaceLeaf();
  });

  it('should bridge onOpenTabHeaderMenu as a callable no-op', () => {
    bridgeWorkspaceLeaf();
    const leaf = WorkspaceLeaf.create2__(App.createConfigured__());
    const onOpenTabHeaderMenu = ensureGenericObject(leaf)['onOpenTabHeaderMenu'] as OnOpenTabHeaderMenuFunction;
    expect(() => {
      onOpenTabHeaderMenu.call(leaf, new MouseEvent('click'), document.createElement('div'));
    }).not.toThrow();
  });

  it('should not overwrite if property already exists', () => {
    bridgeWorkspaceLeaf();
    bridgeWorkspaceLeaf();
    const leaf = WorkspaceLeaf.create2__(App.createConfigured__());
    expect('onOpenTabHeaderMenu' in leaf).toBe(true);
  });

  it('should remove bridge on unbridge', () => {
    bridgeWorkspaceLeaf();
    unbridgeWorkspaceLeaf();
    const leaf = WorkspaceLeaf.create2__(App.createConfigured__());
    expect('onOpenTabHeaderMenu' in leaf).toBe(false);
  });
});
