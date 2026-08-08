import {
  EditorState,
  StateField
} from '@codemirror/state';
import {
  describe,
  expect,
  it
} from 'vitest';

import { editorLivePreviewField } from './editorLivePreviewField.ts';

describe('editorLivePreviewField', () => {
  it('should be a StateField instance', () => {
    expect(editorLivePreviewField).toBeInstanceOf(StateField);
  });

  it('should create a boolean via its create function', () => {
    const state = EditorState.create({ extensions: [editorLivePreviewField] });
    const isValue = state.field(editorLivePreviewField);
    expect(isValue).toBe(false);
  });

  it('should return the same value on update', () => {
    const state = EditorState.create({ extensions: [editorLivePreviewField] });
    const isValue = state.field(editorLivePreviewField);
    const nextState = state.update({}).state;
    const isNextValue = nextState.field(editorLivePreviewField);
    expect(isNextValue).toBe(isValue);
  });
});
