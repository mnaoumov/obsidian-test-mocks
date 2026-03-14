import {
  EditorView,
  ViewPlugin
} from '@codemirror/view';
import {
  describe,
  expect,
  it
} from 'vitest';

import { livePreviewState } from './livePreviewState.ts';

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
