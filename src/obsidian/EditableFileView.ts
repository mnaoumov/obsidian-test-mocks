import { castTo } from '../internal/Cast.ts';
import type { EditableFileView as RealEditableFileView } from 'obsidian';

import { FileView } from './FileView.ts';

export abstract class EditableFileView extends FileView {
  // Intentionally empty, obsidian.d.ts doesn't have any members to mock.

  public override asReal__(): RealEditableFileView {
    return castTo<RealEditableFileView>(this);
  }
}
