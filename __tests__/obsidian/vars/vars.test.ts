import {
  EditorState,
  StateField
} from '@codemirror/state';
import {
  EditorView,
  ViewPlugin
} from '@codemirror/view';
import {
  describe,
  expect,
  it
} from 'vitest';

import { apiVersion } from '../../../src/obsidian/vars/apiVersion.ts';
import { editorEditorField } from '../../../src/obsidian/vars/editorEditorField.ts';
import { editorInfoField } from '../../../src/obsidian/vars/editorInfoField.ts';
import { editorLivePreviewField } from '../../../src/obsidian/vars/editorLivePreviewField.ts';
import { editorViewField } from '../../../src/obsidian/vars/editorViewField.ts';
import { livePreviewState } from '../../../src/obsidian/vars/livePreviewState.ts';
import { moment } from '../../../src/obsidian/vars/moment.ts';
import { Platform } from '../../../src/obsidian/vars/Platform.ts';

describe('apiVersion', () => {
  it('should be a valid version string', () => {
    expect(apiVersion).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe('Platform', () => {
  it('should have isDesktop set to true', () => {
    expect(Platform.isDesktop).toBe(true);
  });

  it('should have isMobile set to false', () => {
    expect(Platform.isMobile).toBe(false);
  });

  it('should have resourcePathPrefix as a string', () => {
    expect(typeof Platform.resourcePathPrefix).toBe('string');
  });
});

describe('moment', () => {
  it('should be a function', () => {
    expect(typeof moment).toBe('function');
  });
});

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

describe('editorLivePreviewField', () => {
  it('should be a StateField instance', () => {
    expect(editorLivePreviewField).toBeInstanceOf(StateField);
  });

  it('should create a boolean via its create function', () => {
    const state = EditorState.create({ extensions: [editorLivePreviewField] });
    const value = state.field(editorLivePreviewField);
    expect(value).toBe(false);
  });

  it('should return the same value on update', () => {
    const state = EditorState.create({ extensions: [editorLivePreviewField] });
    const value = state.field(editorLivePreviewField);
    const nextState = state.update({}).state;
    const nextValue = nextState.field(editorLivePreviewField);
    expect(nextValue).toBe(value);
  });
});

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

describe('livePreviewState', () => {
  it('should be a ViewPlugin instance', () => {
    expect(livePreviewState).toBeInstanceOf(ViewPlugin);
  });

  it('should be usable as an EditorView extension', () => {
    const view = new EditorView({ extensions: [livePreviewState] });
    const plugin = view.plugin(livePreviewState);
    expect(plugin).toBeDefined();
    expect(plugin).toHaveProperty('mousedown', false);
    view.destroy();
  });
});
