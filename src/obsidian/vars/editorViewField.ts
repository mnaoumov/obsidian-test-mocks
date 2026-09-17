/**
 * @file
 *
 * Mock of Obsidian's `editorViewField`, which Obsidian deprecates in favor of `editorInfoField`.
 */

import type {
  App as AppOriginal,
  MarkdownFileInfo as MarkdownFileInfoOriginal
} from 'obsidian';

import { StateField } from '@codemirror/state';

import { ensureGenericObject } from '../../internal/type-guards.ts';

/**
 * State field holding information about the Markdown editor. Obsidian deprecates it in favor of `editorInfoField`.
 * The mock is a separate field with the same value as that one: the global `app`, no file and no hover popover.
 */
export const editorViewField: StateField<MarkdownFileInfoOriginal> = StateField.define({
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
