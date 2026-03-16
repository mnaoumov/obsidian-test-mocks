import type {
  App as AppOriginal,
  MarkdownFileInfo as MarkdownFileInfoOriginal
} from 'obsidian';

import { StateField } from '@codemirror/state';

import { bridgeType } from '../../internal/strict-proxy.ts';

export const editorViewField: StateField<MarkdownFileInfoOriginal> = StateField.define({
  create(): MarkdownFileInfoOriginal {
    return {
      app: bridgeType<AppOriginal>({}),
      file: null,
      hoverPopover: null
    };
  },
  update(value: MarkdownFileInfoOriginal): MarkdownFileInfoOriginal {
    return value;
  }
});
