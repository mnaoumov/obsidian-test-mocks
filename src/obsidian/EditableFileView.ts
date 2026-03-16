import type { EditableFileView as EditableFileViewOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { FileView } from './FileView.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

export abstract class EditableFileView extends FileView {
  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    const self = strictProxy(this);
    self.constructor5__(leaf);
    return self;
  }

  public static fromOriginalType5__(value: EditableFileViewOriginal): EditableFileView {
    return strictProxy(value, EditableFileView);
  }

  public asOriginalType5__(): EditableFileViewOriginal {
    return strictProxy<EditableFileViewOriginal>(this);
  }

  public constructor5__(_leaf: WorkspaceLeaf): void {
    noop();
  }
}
