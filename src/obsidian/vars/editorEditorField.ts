/**
 * @file
 *
 * Mock of Obsidian's `editorEditorField`, the CodeMirror state field that references the editor's `EditorView`.
 */

import { StateField } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

/**
 * State field holding the `EditorView` of the editor. The mock creates a fresh, detached `EditorView` for each state
 * and never changes it.
 */
export const editorEditorField: StateField<EditorView> = StateField.define({
  create(): EditorView {
    return new EditorView();
  },
  update(value: EditorView): EditorView {
    return value;
  }
});
