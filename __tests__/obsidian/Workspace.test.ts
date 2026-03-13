import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from '../../src/obsidian/App.ts';

describe('Workspace', () => {
  describe('openLinkText', () => {
    it('should open a file matching the link text', async () => {
      const app = await App.createConfigured__({
        files: { 'notes/hello.md': 'content' }
      });

      await app.workspace.openLinkText('hello', 'notes/other.md');

      const allLeaves: unknown[] = [];
      app.workspace.iterateAllLeaves((l) => {
        allLeaves.push(l);
      });
      expect(allLeaves.length).toBeGreaterThanOrEqual(1);
    });

    it('should resolve link using metadataCache', async () => {
      const app = await App.createConfigured__({
        files: {
          'folder/note.md': 'content',
          'folder/source.md': ''
        }
      });

      await app.workspace.openLinkText('note', 'folder/source.md');

      const file = app.workspace.getActiveFile();
      expect(file?.path).toBe('folder/note.md');
    });

    it('should create a new leaf when newLeaf is true', async () => {
      const app = await App.createConfigured__({
        files: { 'test.md': '' }
      });
      const leavesBefore: unknown[] = [];
      app.workspace.iterateAllLeaves((l) => {
        leavesBefore.push(l);
      });

      await app.workspace.openLinkText('test', '', true);

      const leavesAfter: unknown[] = [];
      app.workspace.iterateAllLeaves((l) => {
        leavesAfter.push(l);
      });
      expect(leavesAfter.length).toBe(leavesBefore.length + 1);
    });

    it('should do nothing when link cannot be resolved', async () => {
      const app = await App.createConfigured__();
      const leavesBefore: unknown[] = [];
      app.workspace.iterateAllLeaves((l) => {
        leavesBefore.push(l);
      });

      await app.workspace.openLinkText('nonexistent', '');

      const leavesAfter: unknown[] = [];
      app.workspace.iterateAllLeaves((l) => {
        leavesAfter.push(l);
      });
      expect(leavesAfter.length).toBe(leavesBefore.length);
    });
  });
});
