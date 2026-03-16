import type { MarkdownFileInfo as MarkdownFileInfoOriginal } from 'obsidian';

import { StateField } from '@codemirror/state';

import { app } from '../../globals/vars/app.ts';

export const editorInfoField: StateField<MarkdownFileInfoOriginal> = StateField.define({
  create(): MarkdownFileInfoOriginal {
    return {
      app: app.asOriginalType__(),
      file: null,
      hoverPopover: null
    };
  },
  update(value: MarkdownFileInfoOriginal): MarkdownFileInfoOriginal {
    return value;
  }
});
