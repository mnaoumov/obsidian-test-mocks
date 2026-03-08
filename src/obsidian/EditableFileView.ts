import type { EditableFileView as RealEditableFileView } from 'obsidian';

import { strictCastTo } from '../internal/StrictMock.ts';
import { FileView } from './FileView.ts';

export abstract class EditableFileView extends FileView {
  // Intentionally empty, obsidian.d.ts doesn't have any members to mock.

  public override asReal__(): RealEditableFileView {
    return strictCastTo<RealEditableFileView>(this);
  }
}
