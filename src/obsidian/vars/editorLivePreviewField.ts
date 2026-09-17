/**
 * @file
 *
 * Mock of Obsidian's `editorLivePreviewField`, the CodeMirror state field telling whether Live Preview is active.
 */

import { StateField } from '@codemirror/state';

/**
 * State field telling whether Live Preview is active. Always `false` in the mock.
 */
export const editorLivePreviewField: StateField<boolean> = StateField.define({
  create(): boolean {
    return false;
  },
  update(value: boolean): boolean {
    return value;
  }
});
