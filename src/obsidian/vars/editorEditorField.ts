import { StateField } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

export const editorEditorField: StateField<EditorView> = StateField.define({
  create(): EditorView {
    return new EditorView();
  },
  update(value: EditorView): EditorView {
    return value;
  }
});
