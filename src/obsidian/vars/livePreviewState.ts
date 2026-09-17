/**
 * @file
 *
 * Mock of Obsidian's `livePreviewState`, the CodeMirror view plugin tracking Live Preview interaction state.
 */

import type { LivePreviewStateType as LivePreviewStateTypeOriginal } from 'obsidian';

import {
  EditorView,
  ViewPlugin
} from '@codemirror/view';

import { noop } from '../../internal/noop.ts';

class MockLivePreviewStateType implements LivePreviewStateTypeOriginal {
  public mousedown = false;
  public constructor(_view: EditorView) {
    noop();
  }
}

/**
 * View plugin exposing the Live Preview state of an editor, such as whether the mouse button is held down. The
 * mock's plugin value always reports `mousedown` as `false`.
 */
export const livePreviewState: ViewPlugin<LivePreviewStateTypeOriginal> = ViewPlugin.fromClass(MockLivePreviewStateType);
