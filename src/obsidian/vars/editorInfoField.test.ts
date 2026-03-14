import {
  EditorState,
  StateField
} from '@codemirror/state';
import {
  describe,
  expect,
  it
} from 'vitest';

import { editorInfoField } from './editorInfoField.ts';

describe('editorInfoField', () => {
  it('should be a StateField instance', () => {
    expect(editorInfoField).toBeInstanceOf(StateField);
  });

  it('should create a MarkdownFileInfo via its create function', () => {
    const state = EditorState.create({ extensions: [editorInfoField] });
    const value = state.field(editorInfoField);
    expect(value).toHaveProperty('app');
    expect(value).toHaveProperty('file');
    expect(value).toHaveProperty('hoverPopover');
  });

  it('should return the same value on update', () => {
    const state = EditorState.create({ extensions: [editorInfoField] });
    const value = state.field(editorInfoField);
    const nextState = state.update({}).state;
    const nextValue = nextState.field(editorInfoField);
    expect(nextValue).toBe(value);
  });
});
