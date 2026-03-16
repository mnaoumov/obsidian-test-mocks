import type { EditableFileView as EditableFileViewOriginal } from 'obsidian';

import {
  createMockOf,
  createMockOfUnsafe
} from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { FileView } from './FileView.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

export abstract class EditableFileView extends FileView {
  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    const self = createMockOf(this);
    self.constructor5__(leaf);
    return self;
  }

  public static fromOriginalType5__(value: EditableFileViewOriginal): EditableFileView {
    return createMockOfUnsafe<EditableFileView>(value);
  }

  public asOriginalType5__(): EditableFileViewOriginal {
    return createMockOfUnsafe<EditableFileViewOriginal>(this);
  }

  public constructor5__(_leaf: WorkspaceLeaf): void {
    noop();
  }
}
