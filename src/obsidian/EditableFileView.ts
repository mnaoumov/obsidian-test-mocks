import type { EditableFileView as EditableFileViewOriginal } from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { FileView } from './FileView.ts';

export abstract class EditableFileView extends FileView {
  // Intentionally empty, obsidian.d.ts doesn't have any members to mock.

  public override asOriginalType__(): EditableFileViewOriginal {
    return castTo<EditableFileViewOriginal>(this);
  }
}
