/**
 * @file
 *
 * Mock of Obsidian's `editorInfoField`, the CodeMirror state field describing the Markdown editor, such as its file.
 */

import type {
  App as AppOriginal,
  MarkdownFileInfo as MarkdownFileInfoOriginal
} from 'obsidian';

import { StateField } from '@codemirror/state';

import { ensureGenericObject } from '../../internal/type-guards.ts';

/**
 * State field holding information about the Markdown editor, such as its file. The mock's value carries the global
 * `app`, no file and no hover popover, and never changes.
 */
export const editorInfoField: StateField<MarkdownFileInfoOriginal> = StateField.define({
  create(): MarkdownFileInfoOriginal {
    return {
      app: ensureGenericObject(globalThis)['app'] as AppOriginal,
      file: null,
      hoverPopover: null
    };
  },
  update(value: MarkdownFileInfoOriginal): MarkdownFileInfoOriginal {
    return value;
  }
});
