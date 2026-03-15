import type { EditableFileView as EditableFileViewOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { EditableFileView } from './EditableFileView.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

class ConcreteEditableFileView extends EditableFileView {
  public override getViewType(): string {
    return 'test-editable-view';
  }
}

describe('EditableFileView', () => {
  async function createEditableFileView(): Promise<ConcreteEditableFileView> {
    const app = await App.createConfigured__();
    const leaf = WorkspaceLeaf.create2__(app);
    return new ConcreteEditableFileView(leaf);
  }

  it('should create an instance', async () => {
    const view = await createEditableFileView();
    expect(view).toBeInstanceOf(EditableFileView);
  });

  it('should throw when accessing an unmocked property', async () => {
    const view = await createEditableFileView();
    const record = view as unknown as Record<string, unknown>;
    expect(() => record['nonExistentProperty']).toThrow();
  });

  describe('asOriginalType5__', () => {
    it('should return the same instance typed as the original obsidian type', async () => {
      const view = await createEditableFileView();
      const original: EditableFileViewOriginal = view.asOriginalType5__();
      expect(original).toBe(view);
    });
  });

  describe('fromOriginalType5__', () => {
    it('should return the same instance typed as the mock type', async () => {
      const view = await createEditableFileView();
      const mock = EditableFileView.fromOriginalType5__(view.asOriginalType5__());
      expect(mock).toBe(view);
    });
  });
});
