import {
  EditorState,
  StateField
} from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import {
  describe,
  expect,
  it
} from 'vitest';

import { editorEditorField } from './editorEditorField.ts';

describe('editorEditorField', () => {
  it('should be a StateField instance', () => {
    expect(editorEditorField).toBeInstanceOf(StateField);
  });

  it('should create an EditorView via its create function', () => {
    const state = EditorState.create({ extensions: [editorEditorField] });
    const value = state.field(editorEditorField);
    expect(value).toBeInstanceOf(EditorView);
  });

  it('should return the same value on update', () => {
    const state = EditorState.create({ extensions: [editorEditorField] });
    const value = state.field(editorEditorField);
    const nextState = state.update({}).state;
    const nextValue = nextState.field(editorEditorField);
    expect(nextValue).toBe(value);
  });
});
