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
