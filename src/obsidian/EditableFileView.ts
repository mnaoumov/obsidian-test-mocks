import type { EditableFileView as EditableFileViewOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { FileView } from './FileView.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

export abstract class EditableFileView extends FileView {
  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    const self = strictMock(this);
    self.constructor5__(leaf);
    return self;
  }

  public static fromOriginalType5__(value: EditableFileViewOriginal): EditableFileView {
    return castTo<EditableFileView>(value);
  }

  public asOriginalType5__(): EditableFileViewOriginal {
    return castTo<EditableFileViewOriginal>(this);
  }

  public constructor5__(_leaf: WorkspaceLeaf): void {
    noop();
  }
}
