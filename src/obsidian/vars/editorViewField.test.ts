import {
  EditorState,
  StateField
} from '@codemirror/state';
import {
  describe,
  expect,
  it
} from 'vitest';

import { editorViewField } from './editorViewField.ts';

describe('editorViewField', () => {
  it('should be a StateField instance', () => {
    expect(editorViewField).toBeInstanceOf(StateField);
  });

  it('should create a MarkdownFileInfo via its create function', () => {
    const state = EditorState.create({ extensions: [editorViewField] });
    const value = state.field(editorViewField);
    expect(value).toHaveProperty('app');
    expect(value).toHaveProperty('file');
    expect(value).toHaveProperty('hoverPopover');
  });

  it('should return the same value on update', () => {
    const state = EditorState.create({ extensions: [editorViewField] });
    const value = state.field(editorViewField);
    const nextState = state.update({}).state;
    const nextValue = nextState.field(editorViewField);
    expect(nextValue).toBe(value);
  });
});
