/**
 * @file
 *
 * The minimal line diff Obsidian's Markdown edit view dispatches when it is handed new text for the file it is
 * already showing, shared by the `MarkdownEditView` and `MarkdownView` mocks.
 */

import type { EditorPosition as EditorPositionOriginal } from 'obsidian';

import type { Editor } from '../obsidian/Editor.ts';

import { ensureNonNullable } from './type-guards.ts';

interface CommonEnds {
  // The number of characters the two lines share at their ends, counted after `start`.
  end: number;
  // The number of characters the two lines share at their starts.
  start: number;
}

/**
 * Replaces an editor's text the way Obsidian's Markdown edit view does when the file it is showing has changed
 * underneath it, rather than by replacing the whole document.
 *
 * The old and new texts are compared line by line: the common leading lines are trimmed, then the common trailing
 * ones, and when exactly one line differs the change is narrowed further to the characters that differ within it.
 * The one resulting change is dispatched through {@link Editor.transaction}, so the selection is mapped through it
 * and a cursor outside the changed range does not move. Identical text dispatches nothing at all, and so records no
 * undo step.
 *
 * @param editor - The editor to change.
 * @param data - The new text. `\r\n` breaks are normalized to `\n`, as they are on the way into CodeMirror.
 */
export function setMarkdownEditorText(editor: Editor, data: string): void {
  const newLines = data.split(/\r?\n/);
  const oldLineCount = editor.lineCount();

  let prefix = 0;
  while (prefix < newLines.length && prefix < oldLineCount && newLines[prefix] === editor.getLine(prefix)) {
    prefix++;
  }

  if (prefix === newLines.length && prefix === oldLineCount) {
    return;
  }

  let oldLine = oldLineCount - 1;
  let newLine = newLines.length - 1;
  while (oldLine > prefix && newLine > prefix && editor.getLine(oldLine) === newLines[newLine]) {
    oldLine--;
    newLine--;
  }

  let from: EditorPositionOriginal = { ch: 0, line: prefix };
  let to: EditorPositionOriginal = { ch: editor.getLine(oldLine).length, line: oldLine };
  let text = newLines.slice(prefix, newLine + 1).join('\n');

  // Exactly one line changed: narrow the change to the characters within it that differ, so an edit in the middle
  // of a line leaves a cursor on either side of it where it was. Obsidian also tests that the line exists in both
  // documents, which is implied here: `oldLine` never exceeds `oldLineCount - 1`, nor `newLine` the last new line.
  if (prefix === oldLine && prefix === newLine) {
    const { end, start } = countCommonEnds(editor.getLine(prefix), ensureNonNullable(newLines[prefix]));
    if (start > 0 || end > 0) {
      from = { ch: start, line: from.line };
      to = { ch: to.ch - end, line: to.line };
      text = text.slice(start, text.length - end);
    }
  }

  // The common prefix consumed the whole of the shorter document, so one document is a prefix of the other and the
  // change is a pure append or truncation: it starts at the end of the last shared line rather than at the start of
  // a line the old document may not have, and an append carries the line break that joins it on.
  if (prefix === Math.min(oldLineCount, newLines.length)) {
    from = { ch: editor.getLine(prefix - 1).length, line: prefix - 1 };
    if (newLines.length > oldLineCount) {
      text = `\n${text}`;
    }
  }

  editor.transaction({ changes: [{ from, text, to }] });
}

// How many characters the two lines share at each end, the leading ones counted first so a run repeated at both
// ends is only ever claimed by the prefix.
function countCommonEnds(oldLineText: string, newLineText: string): CommonEnds {
  let start = 0;
  while (
    start < oldLineText.length && start < newLineText.length
    && oldLineText.charAt(start) === newLineText.charAt(start)
  ) {
    start++;
  }

  let end = 0;
  while (
    end < oldLineText.length - start && end < newLineText.length - start
    && oldLineText.charAt(oldLineText.length - 1 - end) === newLineText.charAt(newLineText.length - 1 - end)
  ) {
    end++;
  }

  return { end, start };
}
