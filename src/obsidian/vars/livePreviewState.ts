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

export const livePreviewState: ViewPlugin<LivePreviewStateTypeOriginal> = ViewPlugin.fromClass(MockLivePreviewStateType);
