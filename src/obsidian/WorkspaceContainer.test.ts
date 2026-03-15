import type { WorkspaceContainer as WorkspaceContainerOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import type { Workspace } from './Workspace.ts';

import { App } from './App.ts';
import { WorkspaceContainer } from './WorkspaceContainer.ts';
import { WorkspaceRoot } from './WorkspaceRoot.ts';

class BareWorkspaceContainer extends WorkspaceContainer {
  public doc: Document = document;
  public win: Window = window;

  public constructor(workspace: Workspace) {
    super(workspace, 'vertical');
  }
}

describe('WorkspaceContainer', () => {
  describe('asOriginalType__()', () => {
    it('should return the same instance typed as the original', async () => {
      const app = await App.createConfigured__();
      const container = WorkspaceRoot.create3__(app.workspace, 'vertical');
      const original: WorkspaceContainerOriginal = container.asOriginalType__();
      expect(original).toBe(container);
    });

    it('should return the same instance via WorkspaceContainer base class', async () => {
      const app = await App.createConfigured__();
      const container = new BareWorkspaceContainer(app.workspace);
      const original: WorkspaceContainerOriginal = container.asOriginalType__();
      expect(original).toBe(container);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', async () => {
      const app = await App.createConfigured__();
      const container = WorkspaceRoot.create3__(app.workspace, 'vertical');
      const mock = WorkspaceContainer.fromOriginalType__(container.asOriginalType__());
      expect(mock).toBe(container);
    });
  });

  describe('constructor5__()', () => {
    it('should be callable without throwing', async () => {
      const app = await App.createConfigured__();
      const container = WorkspaceRoot.create3__(app.workspace, 'vertical');
      expect(() => {
        container.constructor5__(app.workspace, 'vertical');
      }).not.toThrow();
    });
  });
});
