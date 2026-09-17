import type { EditorPosition } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { Editor } from '../obsidian/Editor.ts';
import { setMarkdownEditorText } from './markdown-editor-set.ts';

class ConcreteEditor extends Editor {}

function createEditor(content: string): ConcreteEditor {
  const editor = new ConcreteEditor();
  editor.resetState__(content);
  return editor;
}

function pos(line: number, ch: number): EditorPosition {
  return { ch, line };
}

describe('setMarkdownEditorText', () => {
  describe('the change it dispatches', () => {
    it('should change nothing when the text is identical', () => {
      const editor = createEditor('hello');
      editor.replaceRange(' world', pos(0, 5));

      setMarkdownEditorText(editor, 'hello world');

      // The identical text recorded no undo step of its own, so one undo reverts the edit before it.
      editor.undo();
      expect(editor.getValue()).toBe('hello');
    });

    it('should replace only the lines that differ', () => {
      const editor = createEditor('a\nb\nc');

      setMarkdownEditorText(editor, 'a\nB\nc');

      expect(editor.getValue()).toBe('a\nB\nc');
    });

    it('should replace every line when no line is shared', () => {
      const editor = createEditor('a\nb');

      setMarkdownEditorText(editor, 'x\ny');

      expect(editor.getValue()).toBe('x\ny');
    });

    it('should append lines without touching the ones before them', () => {
      const editor = createEditor('a\nb');

      setMarkdownEditorText(editor, 'a\nb\nc\nd');

      expect(editor.getValue()).toBe('a\nb\nc\nd');
    });

    it('should append to an empty document', () => {
      const editor = createEditor('');

      setMarkdownEditorText(editor, 'a');

      expect(editor.getValue()).toBe('a');
    });

    it('should truncate trailing lines', () => {
      const editor = createEditor('a\nb\nc');

      setMarkdownEditorText(editor, 'a\nb');

      expect(editor.getValue()).toBe('a\nb');
    });

    it('should empty the document', () => {
      const editor = createEditor('a\nb');

      setMarkdownEditorText(editor, '');

      expect(editor.getValue()).toBe('');
    });

    it('should normalize CRLF breaks', () => {
      const editor = createEditor('a\nb');

      setMarkdownEditorText(editor, 'a\r\nb\r\nc');

      expect(editor.getValue()).toBe('a\nb\nc');
    });

    it('should be a single change that one undo reverts', () => {
      const editor = createEditor('a\nb\nc');

      setMarkdownEditorText(editor, 'x\ny\nz');
      editor.undo();

      expect(editor.getValue()).toBe('a\nb\nc');
    });
  });

  describe('the selection it leaves', () => {
    it('should leave a cursor before a change on its own line where it was', () => {
      const editor = createEditor('hello world');
      editor.setCursor(pos(0, 2));

      setMarkdownEditorText(editor, 'hello brave world');

      expect(editor.getCursor()).toEqual(pos(0, 2));
    });

    it('should shift a cursor after a change on its own line along by what it inserted', () => {
      const editor = createEditor('hello world');
      editor.setCursor(pos(0, 11));

      setMarkdownEditorText(editor, 'hello brave world');

      expect(editor.getCursor()).toEqual(pos(0, 17));
    });

    it('should leave a cursor on a line after the change where it was', () => {
      const editor = createEditor('a\nb\nc');
      editor.setCursor(pos(2, 1));

      setMarkdownEditorText(editor, 'a\nB\nc');

      expect(editor.getCursor()).toEqual(pos(2, 1));
    });

    it('should leave a cursor untouched by an append', () => {
      const editor = createEditor('a\nb');
      editor.setCursor(pos(0, 1));

      setMarkdownEditorText(editor, 'a\nb\nc');

      expect(editor.getCursor()).toEqual(pos(0, 1));
    });

    it('should leave a cursor untouched by a truncation', () => {
      const editor = createEditor('a\nb\nc');
      editor.setCursor(pos(0, 1));

      setMarkdownEditorText(editor, 'a\nb');

      expect(editor.getCursor()).toEqual(pos(0, 1));
    });

    it('should keep a selection that surrounds nothing the change touched', () => {
      const editor = createEditor('first\nsecond\nthird');
      editor.setSelection(pos(0, 1), pos(0, 4));

      setMarkdownEditorText(editor, 'first\nSECOND\nthird');

      expect(editor.listSelections()).toEqual([{ anchor: pos(0, 1), head: pos(0, 4) }]);
    });

    it('should leave a cursor where it was when nothing changed', () => {
      const editor = createEditor('a\nb');
      editor.setCursor(pos(1, 1));

      setMarkdownEditorText(editor, 'a\nb');

      expect(editor.getCursor()).toEqual(pos(1, 1));
    });
  });

  describe('narrowing a single changed line', () => {
    it('should narrow to the characters that differ in the middle', () => {
      const editor = createEditor('the quick fox');
      editor.setCursor(pos(0, 0));

      setMarkdownEditorText(editor, 'the slow fox');

      expect(editor.getValue()).toBe('the slow fox');
      expect(editor.getCursor()).toEqual(pos(0, 0));
    });

    it('should replace the whole line when it shares no first or last character', () => {
      const editor = createEditor('abc');

      setMarkdownEditorText(editor, 'xyz');

      expect(editor.getValue()).toBe('xyz');
    });

    it('should narrow to a shared prefix alone', () => {
      const editor = createEditor('prefix-old');

      setMarkdownEditorText(editor, 'prefix-new');

      expect(editor.getValue()).toBe('prefix-new');
    });

    it('should narrow to a shared suffix alone', () => {
      const editor = createEditor('old-suffix');

      setMarkdownEditorText(editor, 'new-suffix');

      expect(editor.getValue()).toBe('new-suffix');
    });

    it('should not narrow past a line that only grew', () => {
      const editor = createEditor('ab');
      editor.setCursor(pos(0, 0));

      setMarkdownEditorText(editor, 'aXb');

      expect(editor.getValue()).toBe('aXb');
      expect(editor.getCursor()).toEqual(pos(0, 0));
    });
  });
});
