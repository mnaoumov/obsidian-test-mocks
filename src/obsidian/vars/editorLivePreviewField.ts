import { StateField } from '@codemirror/state';

export const editorLivePreviewField: StateField<boolean> = StateField.define({
  create(): boolean {
    return false;
  },
  update(value: boolean): boolean {
    return value;
  }
});
