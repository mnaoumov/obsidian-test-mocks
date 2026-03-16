import type {
  App as AppOriginal,
  MarkdownFileInfo as MarkdownFileInfoOriginal
} from 'obsidian';

import { StateField } from '@codemirror/state';

import { createMockOfUnsafe } from '../../internal/create-mock-of.ts';

export const editorInfoField: StateField<MarkdownFileInfoOriginal> = StateField.define({
  create(): MarkdownFileInfoOriginal {
    return {
      app: createMockOfUnsafe<AppOriginal>({}),
      file: null,
      hoverPopover: null
    };
  },
  update(value: MarkdownFileInfoOriginal): MarkdownFileInfoOriginal {
    return value;
  }
});
