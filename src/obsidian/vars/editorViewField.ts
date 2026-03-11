import type {
  App as AppOriginal,
  MarkdownFileInfo as MarkdownFileInfoOriginal
} from 'obsidian';

import { StateField } from '@codemirror/state';

export const editorViewField: StateField<MarkdownFileInfoOriginal> = StateField.define({
  create(): MarkdownFileInfoOriginal {
    return {
      app: null as unknown as AppOriginal,
      file: null,
      hoverPopover: null
    };
  },
  update(value: MarkdownFileInfoOriginal): MarkdownFileInfoOriginal {
    return value;
  }
});
