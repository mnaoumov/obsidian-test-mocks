import type { EditorPosition } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { Editor } from '../../src/obsidian/Editor.ts';

class ConcreteEditor extends Editor {
}

function createEditor(content = ''): ConcreteEditor {
  const editor = new ConcreteEditor();
  editor.setValue(content);
  return editor;
}

function pos(line: number, ch: number): EditorPosition {
  return { ch, line };
}

describe('Editor.exec', () => {
  describe('goUp', () => {
    it('should move cursor up one line', () => {
      const editor = createEditor('line1\nline2\nline3');
      editor.setCursor(pos(LINE_3, CH_3));

      editor.exec('goUp');

      expect(editor.getCursor()).toEqual(pos(LINE_2, CH_3));
    });

    it('should not move above line 0', () => {
      const editor = createEditor('line1\nline2');
      editor.setCursor(pos(LINE_1, CH_2));

      editor.exec('goUp');

      expect(editor.getCursor()).toEqual(pos(LINE_1, CH_2));
    });

    it('should clamp ch to target line length', () => {
      const editor = createEditor('ab\nabcdef');
      editor.setCursor(pos(LINE_2, CH_5));

      editor.exec('goUp');

      expect(editor.getCursor()).toEqual(pos(LINE_1, CH_2));
    });
  });

  describe('goDown', () => {
    it('should move cursor down one line', () => {
      const editor = createEditor('line1\nline2\nline3');
      editor.setCursor(pos(LINE_1, CH_3));

      editor.exec('goDown');

      expect(editor.getCursor()).toEqual(pos(LINE_2, CH_3));
    });

    it('should not move below last line', () => {
      const editor = createEditor('line1\nline2');
      editor.setCursor(pos(LINE_2, CH_2));

      editor.exec('goDown');

      expect(editor.getCursor()).toEqual(pos(LINE_2, CH_2));
    });
  });

  describe('goLeft', () => {
    it('should move cursor left one character', () => {
      const editor = createEditor('hello');
      editor.setCursor(pos(LINE_1, CH_3));

      editor.exec('goLeft');

      expect(editor.getCursor()).toEqual(pos(LINE_1, CH_2));
    });

    it('should wrap to end of previous line', () => {
      const editor = createEditor('abc\ndef');
      editor.setCursor(pos(LINE_2, 0));

      editor.exec('goLeft');

      expect(editor.getCursor()).toEqual(pos(LINE_1, CH_3));
    });

    it('should not move before start of document', () => {
      const editor = createEditor('hello');
      editor.setCursor(pos(LINE_1, 0));

      editor.exec('goLeft');

      expect(editor.getCursor()).toEqual(pos(LINE_1, 0));
    });
  });

  describe('goRight', () => {
    it('should move cursor right one character', () => {
      const editor = createEditor('hello');
      editor.setCursor(pos(LINE_1, CH_2));

      editor.exec('goRight');

      expect(editor.getCursor()).toEqual(pos(LINE_1, CH_3));
    });

    it('should wrap to start of next line', () => {
      const editor = createEditor('abc\ndef');
      editor.setCursor(pos(LINE_1, CH_3));

      editor.exec('goRight');

      expect(editor.getCursor()).toEqual(pos(LINE_2, 0));
    });

    it('should not move past end of document', () => {
      const editor = createEditor('hello');
      editor.setCursor(pos(LINE_1, CH_5));

      editor.exec('goRight');

      expect(editor.getCursor()).toEqual(pos(LINE_1, CH_5));
    });
  });

  describe('goStart', () => {
    it('should move cursor to start of document', () => {
      const editor = createEditor('line1\nline2\nline3');
      editor.setCursor(pos(LINE_3, CH_3));

      editor.exec('goStart');

      expect(editor.getCursor()).toEqual(pos(LINE_1, 0));
    });
  });

  describe('goEnd', () => {
    it('should move cursor to end of document', () => {
      const editor = createEditor('line1\nline2\nline3');
      editor.setCursor(pos(LINE_1, 0));

      editor.exec('goEnd');

      expect(editor.getCursor()).toEqual(pos(LINE_3, CH_5));
    });
  });

  describe('indentMore', () => {
    it('should indent current line with a tab', () => {
      const editor = createEditor('hello');
      editor.setCursor(pos(LINE_1, 0));

      editor.exec('indentMore');

      expect(editor.getValue()).toBe('\thello');
    });

    it('should indent selected lines', () => {
      const editor = createEditor('line1\nline2\nline3');
      editor.setSelection(pos(LINE_1, 0), pos(LINE_2, CH_5));

      editor.exec('indentMore');

      expect(editor.getValue()).toBe('\tline1\n\tline2\nline3');
    });
  });

  describe('indentLess', () => {
    it('should remove one tab from current line', () => {
      const editor = createEditor('\thello');
      editor.setCursor(pos(LINE_1, 1));

      editor.exec('indentLess');

      expect(editor.getValue()).toBe('hello');
    });

    it('should do nothing if no leading tab', () => {
      const editor = createEditor('hello');
      editor.setCursor(pos(LINE_1, 0));

      editor.exec('indentLess');

      expect(editor.getValue()).toBe('hello');
    });

    it('should dedent selected lines', () => {
      const editor = createEditor('\tline1\n\tline2\nline3');
      editor.setSelection(pos(LINE_1, 0), pos(LINE_2, CH_5));

      editor.exec('indentLess');

      expect(editor.getValue()).toBe('line1\nline2\nline3');
    });
  });

  describe('newlineAndIndent', () => {
    it('should insert newline at cursor', () => {
      const editor = createEditor('hello world');
      editor.setCursor(pos(LINE_1, CH_5));

      editor.exec('newlineAndIndent');

      expect(editor.getValue()).toBe('hello\n world');
    });

    it('should preserve indentation', () => {
      const editor = createEditor('\thello');
      editor.setCursor(pos(LINE_1, CH_6));

      editor.exec('newlineAndIndent');

      expect(editor.getValue()).toBe('\thello\n\t');
    });
  });

  describe('swapLineUp', () => {
    it('should swap current line with line above', () => {
      const editor = createEditor('line1\nline2\nline3');
      editor.setCursor(pos(LINE_2, 0));

      editor.exec('swapLineUp');

      expect(editor.getValue()).toBe('line2\nline1\nline3');
      expect(editor.getCursor().line).toBe(0);
    });

    it('should do nothing on first line', () => {
      const editor = createEditor('line1\nline2');
      editor.setCursor(pos(LINE_1, 0));

      editor.exec('swapLineUp');

      expect(editor.getValue()).toBe('line1\nline2');
    });
  });

  describe('swapLineDown', () => {
    it('should swap current line with line below', () => {
      const editor = createEditor('line1\nline2\nline3');
      editor.setCursor(pos(LINE_1, 0));

      editor.exec('swapLineDown');

      expect(editor.getValue()).toBe('line2\nline1\nline3');
      expect(editor.getCursor().line).toBe(1);
    });

    it('should do nothing on last line', () => {
      const editor = createEditor('line1\nline2');
      editor.setCursor(pos(LINE_2, 0));

      editor.exec('swapLineDown');

      expect(editor.getValue()).toBe('line1\nline2');
    });
  });

  describe('deleteLine', () => {
    it('should delete current line', () => {
      const editor = createEditor('line1\nline2\nline3');
      editor.setCursor(pos(LINE_2, 0));

      editor.exec('deleteLine');

      expect(editor.getValue()).toBe('line1\nline3');
    });

    it('should handle deleting last line', () => {
      const editor = createEditor('line1\nline2');
      editor.setCursor(pos(LINE_2, 0));

      editor.exec('deleteLine');

      expect(editor.getValue()).toBe('line1');
    });

    it('should handle single line document', () => {
      const editor = createEditor('only line');
      editor.setCursor(pos(LINE_1, 0));

      editor.exec('deleteLine');

      expect(editor.getValue()).toBe('');
    });
  });

  describe('goWordLeft', () => {
    it('should move cursor to start of current word', () => {
      const editor = createEditor('hello world');
      editor.setCursor(pos(LINE_1, CH_8));

      editor.exec('goWordLeft');

      expect(editor.getCursor()).toEqual(pos(LINE_1, CH_6));
    });

    it('should skip whitespace to previous word', () => {
      const editor = createEditor('hello world');
      editor.setCursor(pos(LINE_1, CH_6));

      editor.exec('goWordLeft');

      expect(editor.getCursor()).toEqual(pos(LINE_1, 0));
    });
  });

  describe('goWordRight', () => {
    it('should move cursor to end of current word', () => {
      const editor = createEditor('hello world');
      editor.setCursor(pos(LINE_1, CH_2));

      editor.exec('goWordRight');

      expect(editor.getCursor()).toEqual(pos(LINE_1, CH_5));
    });

    it('should skip whitespace to next word end', () => {
      const editor = createEditor('hello world');
      editor.setCursor(pos(LINE_1, CH_5));

      editor.exec('goWordRight');

      expect(editor.getCursor()).toEqual(pos(LINE_1, CH_11));
    });
  });

  describe('toggleFold / foldAll / unfoldAll', () => {
    it('should not throw for fold commands', () => {
      const editor = createEditor('line1\nline2');
      editor.setCursor(pos(LINE_1, 0));

      expect(() => {
        editor.exec('toggleFold');
      }).not.toThrow();
      expect(() => {
        editor.exec('foldAll');
      }).not.toThrow();
      expect(() => {
        editor.exec('unfoldAll');
      }).not.toThrow();
    });
  });
});

describe('Editor core methods', () => {
  describe('asOriginalType__', () => {
    it('should return the same instance', () => {
      const editor = createEditor();
      const original = editor.asOriginalType__();
      expect(original).toBe(editor);
    });
  });

  describe('focus / blur / hasFocus', () => {
    it('should track focus state', () => {
      const editor = createEditor();
      expect(editor.hasFocus()).toBe(false);
      editor.focus();
      expect(editor.hasFocus()).toBe(true);
      editor.blur();
      expect(editor.hasFocus()).toBe(false);
    });
  });

  describe('getDoc', () => {
    it('should return itself', () => {
      const editor = createEditor();
      expect(editor.getDoc()).toBe(editor);
    });
  });

  describe('getLine', () => {
    it('should return the line at the given index', () => {
      const editor = createEditor('hello\nworld');
      expect(editor.getLine(0)).toBe('hello');
      expect(editor.getLine(1)).toBe('world');
    });

    it('should return empty string for out-of-range line', () => {
      const editor = createEditor('hello');
      const OUT_OF_RANGE = 5;
      expect(editor.getLine(OUT_OF_RANGE)).toBe('');
    });
  });

  describe('lineCount / lastLine', () => {
    it('should return correct line count', () => {
      const editor = createEditor('a\nb\nc');
      const EXPECTED = 3;
      expect(editor.lineCount()).toBe(EXPECTED);
      expect(editor.lastLine()).toBe(EXPECTED - 1);
    });
  });

  describe('getRange', () => {
    it('should return text between two positions', () => {
      const editor = createEditor('hello world');
      expect(editor.getRange(pos(LINE_1, 0), pos(LINE_1, CH_5))).toBe('hello');
    });
  });

  describe('getSelection', () => {
    it('should return empty string when nothing selected', () => {
      const editor = createEditor('hello');
      editor.setCursor(pos(LINE_1, CH_2));
      expect(editor.getSelection()).toBe('');
    });

    it('should return selected text', () => {
      const editor = createEditor('hello world');
      editor.setSelection(pos(LINE_1, 0), pos(LINE_1, CH_5));
      expect(editor.getSelection()).toBe('hello');
    });
  });

  describe('getValue / setValue', () => {
    it('should set and get content', () => {
      const editor = createEditor();
      editor.setValue('new content');
      expect(editor.getValue()).toBe('new content');
    });

    it('should reset cursor on setValue', () => {
      const editor = createEditor('old');
      editor.setCursor(pos(LINE_1, CH_3));
      editor.setValue('new');
      expect(editor.getCursor()).toEqual(pos(LINE_1, 0));
    });
  });

  describe('getCursor', () => {
    it('should return anchor when side is anchor', () => {
      const editor = createEditor('hello');
      editor.setSelection(pos(LINE_1, CH_2), pos(LINE_1, CH_5));
      expect(editor.getCursor('anchor')).toEqual(pos(LINE_1, CH_2));
    });

    it('should return from position (min)', () => {
      const editor = createEditor('hello');
      editor.setSelection(pos(LINE_1, CH_5), pos(LINE_1, CH_2));
      expect(editor.getCursor('from')).toEqual(pos(LINE_1, CH_2));
    });

    it('should return to position (max)', () => {
      const editor = createEditor('hello');
      editor.setSelection(pos(LINE_1, CH_2), pos(LINE_1, CH_5));
      expect(editor.getCursor('to')).toEqual(pos(LINE_1, CH_5));
    });

    it('should return head by default', () => {
      const editor = createEditor('hello');
      editor.setSelection(pos(LINE_1, CH_2), pos(LINE_1, CH_5));
      expect(editor.getCursor()).toEqual(pos(LINE_1, CH_5));
    });
  });

  describe('setCursor with numeric args', () => {
    it('should accept line and ch as separate arguments', () => {
      const editor = createEditor('hello\nworld');
      editor.setCursor(1, CH_3);
      expect(editor.getCursor()).toEqual(pos(LINE_2, CH_3));
    });

    it('should default ch to 0 when not provided', () => {
      const editor = createEditor('hello\nworld');
      editor.setCursor(1);
      expect(editor.getCursor()).toEqual(pos(LINE_2, 0));
    });
  });

  describe('somethingSelected', () => {
    it('should return false when anchor equals head', () => {
      const editor = createEditor('hello');
      editor.setCursor(pos(LINE_1, CH_2));
      expect(editor.somethingSelected()).toBe(false);
    });

    it('should return true when anchor differs from head', () => {
      const editor = createEditor('hello');
      editor.setSelection(pos(LINE_1, 0), pos(LINE_1, CH_5));
      expect(editor.somethingSelected()).toBe(true);
    });
  });

  describe('listSelections', () => {
    it('should return current selection', () => {
      const editor = createEditor('hello');
      editor.setSelection(pos(LINE_1, CH_2), pos(LINE_1, CH_5));
      const selections = editor.listSelections();
      expect(selections).toHaveLength(1);
      expect(selections[0]?.anchor).toEqual(pos(LINE_1, CH_2));
      expect(selections[0]?.head).toEqual(pos(LINE_1, CH_5));
    });
  });

  describe('setSelections', () => {
    it('should use the main index', () => {
      const editor = createEditor('hello');
      editor.setSelections([
        { anchor: pos(LINE_1, 0), head: pos(LINE_1, CH_2) },
        { anchor: pos(LINE_1, CH_3), head: pos(LINE_1, CH_5) }
      ], 1);
      expect(editor.getCursor('anchor')).toEqual(pos(LINE_1, CH_3));
      expect(editor.getCursor('head')).toEqual(pos(LINE_1, CH_5));
    });

    it('should default to first selection when main is not specified', () => {
      const editor = createEditor('hello');
      editor.setSelections([
        { anchor: pos(LINE_1, 0), head: pos(LINE_1, CH_2) }
      ]);
      expect(editor.getCursor('anchor')).toEqual(pos(LINE_1, 0));
    });

    it('should fall back to first when main index out of range', () => {
      const editor = createEditor('hello');
      const OUT_OF_RANGE = 10;
      editor.setSelections([
        { anchor: pos(LINE_1, 0), head: pos(LINE_1, CH_2) }
      ], OUT_OF_RANGE);
      expect(editor.getCursor('anchor')).toEqual(pos(LINE_1, 0));
    });

    it('should handle selection without head as caret', () => {
      const editor = createEditor('hello');
      editor.setSelections([
        { anchor: pos(LINE_1, CH_3) }
      ]);
      expect(editor.getCursor('anchor')).toEqual(pos(LINE_1, CH_3));
      expect(editor.getCursor('head')).toEqual(pos(LINE_1, CH_3));
    });
  });

  describe('setLine', () => {
    it('should replace a specific line', () => {
      const editor = createEditor('hello\nworld');
      editor.setLine(0, 'replaced');
      expect(editor.getValue()).toBe('replaced\nworld');
    });
  });

  describe('offsetToPos / posToOffset', () => {
    it('should convert between offset and position', () => {
      const editor = createEditor('hello\nworld');
      const OFFSET_7 = 7;
      const editorPos = editor.offsetToPos(OFFSET_7);
      expect(editorPos.line).toBe(1);
      expect(editorPos.ch).toBe(1);
      expect(editor.posToOffset(editorPos)).toBe(OFFSET_7);
    });

    it('should clamp offset to valid range', () => {
      const editor = createEditor('hi');
      const NEGATIVE = -5;
      expect(editor.offsetToPos(NEGATIVE)).toEqual(pos(LINE_1, 0));
    });
  });

  describe('replaceRange', () => {
    it('should insert text at a position', () => {
      const editor = createEditor('hello');
      editor.replaceRange('--', pos(LINE_1, CH_2));
      expect(editor.getValue()).toBe('he--llo');
    });

    it('should replace a range of text', () => {
      const editor = createEditor('hello world');
      editor.replaceRange('there', pos(LINE_1, CH_6), pos(LINE_1, CH_11));
      expect(editor.getValue()).toBe('hello there');
    });
  });

  describe('replaceSelection', () => {
    it('should replace selected text', () => {
      const editor = createEditor('hello world');
      editor.setSelection(pos(LINE_1, CH_6), pos(LINE_1, CH_11));
      editor.replaceSelection('there');
      expect(editor.getValue()).toBe('hello there');
    });
  });

  describe('undo / redo', () => {
    it('should undo and redo changes', () => {
      const editor = createEditor('original');
      editor.replaceRange('new', pos(LINE_1, 0), pos(LINE_1, CH_8));
      expect(editor.getValue()).toBe('new');
      editor.undo();
      expect(editor.getValue()).toBe('original');
      editor.redo();
      expect(editor.getValue()).toBe('new');
    });

    it('should not fail when undo stack is empty', () => {
      const editor = createEditor('hello');
      editor.undo();
      expect(editor.getValue()).toBe('hello');
    });

    it('should not fail when redo stack is empty', () => {
      const editor = createEditor('hello');
      editor.redo();
      expect(editor.getValue()).toBe('hello');
    });
  });

  describe('transaction', () => {
    it('should apply multiple changes', () => {
      const editor = createEditor('hello world');
      editor.transaction({
        changes: [
          { from: pos(LINE_1, 0), text: 'Hi', to: pos(LINE_1, CH_5) }
        ]
      });
      expect(editor.getValue()).toBe('Hi world');
    });

    it('should apply selection from transaction', () => {
      const editor = createEditor('hello');
      editor.transaction({
        selection: { from: pos(LINE_1, CH_2), to: pos(LINE_1, CH_5) }
      });
      expect(editor.getCursor('anchor')).toEqual(pos(LINE_1, CH_2));
    });

    it('should handle transaction with no changes or selection', () => {
      const editor = createEditor('hello');
      editor.setCursor(pos(LINE_1, CH_2));
      editor.transaction({});
      // No changes, cursor stays
      expect(editor.getCursor()).toEqual(pos(LINE_1, CH_2));
    });
  });

  describe('getScrollInfo / scrollTo', () => {
    it('should track scroll position', () => {
      const editor = createEditor();
      const X = 10;
      const Y = 20;
      editor.scrollTo(X, Y);
      const info = editor.getScrollInfo();
      expect(info.left).toBe(X);
      expect(info.top).toBe(Y);
    });

    it('should not update when null is passed', () => {
      const editor = createEditor();
      const X = 10;
      editor.scrollTo(X, null);
      expect(editor.getScrollInfo().left).toBe(X);
      expect(editor.getScrollInfo().top).toBe(0);
    });

    it('should not update when undefined is passed', () => {
      const editor = createEditor();
      editor.scrollTo(undefined, undefined);
      expect(editor.getScrollInfo().left).toBe(0);
      expect(editor.getScrollInfo().top).toBe(0);
    });
  });

  describe('refresh', () => {
    it('should not throw', () => {
      const editor = createEditor();
      expect(() => {
        editor.refresh();
      }).not.toThrow();
    });
  });

  describe('scrollIntoView', () => {
    it('should not throw', () => {
      const editor = createEditor();
      expect(() => {
        editor.scrollIntoView({ from: pos(LINE_1, 0), to: pos(LINE_1, 0) });
      }).not.toThrow();
    });
  });

  describe('wordAt', () => {
    it('should return word range at position', () => {
      const editor = createEditor('hello world');
      const range = editor.wordAt(pos(LINE_1, CH_2));
      expect(range).toEqual({
        from: pos(LINE_1, 0),
        to: pos(LINE_1, CH_5)
      });
    });

    it('should return null when position is at non-word char', () => {
      const editor = createEditor('hello world');
      const result = editor.wordAt(pos(LINE_1, CH_5));
      expect(result).toBeNull();
    });

    it('should return null for empty line', () => {
      const editor = createEditor('');
      const result = editor.wordAt(pos(LINE_1, 0));
      expect(result).toBeNull();
    });

    it('should return null when ch exceeds line length', () => {
      const editor = createEditor('hi');
      const OUT_OF_RANGE = 10;
      const result = editor.wordAt(pos(LINE_1, OUT_OF_RANGE));
      expect(result).toBeNull();
    });
  });

  describe('processLines', () => {
    it('should read and write lines', () => {
      const editor = createEditor('abc\ndef\nxyz');
      editor.processLines(
        (_line, text) => (text.startsWith('d') ? text : null),
        (_line, _text, value) => {
          if (value) {
            return { from: pos(1, 0), text: 'DEF', to: pos(1, CH_3) };
          }
          return undefined;
        }
      );
      expect(editor.getValue()).toBe('abc\nDEF\nxyz');
    });
  });

  describe('setSelection', () => {
    it('should set selection with anchor only', () => {
      const editor = createEditor('hello');
      editor.setSelection(pos(LINE_1, CH_3));
      expect(editor.getCursor('anchor')).toEqual(pos(LINE_1, CH_3));
      expect(editor.getCursor('head')).toEqual(pos(LINE_1, CH_3));
    });
  });
});

// Line indices (0-based)
const LINE_1 = 0;
const LINE_2 = 1;
const LINE_3 = 2;

// Character positions
const CH_2 = 2;
const CH_3 = 3;
const CH_5 = 5;
const CH_6 = 6;
const CH_8 = 8;
const CH_11 = 11;
