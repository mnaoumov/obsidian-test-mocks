import type { EditableFileView as EditableFileViewOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxyForce } from '../internal/strict-proxy.ts';
import { FileView } from './FileView.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

export abstract class EditableFileView extends FileView {
  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    const self = strictProxyForce(this);
    self.constructor5__(leaf);
    return self;
  }

  public static fromOriginalType5__(value: EditableFileViewOriginal): EditableFileView {
    return strictProxyForce(value, EditableFileView);
  }

  public asOriginalType5__(): EditableFileViewOriginal {
    return strictProxyForce<EditableFileViewOriginal>(this);
  }

  public constructor5__(_leaf: WorkspaceLeaf): void {
    noop();
  }
}
