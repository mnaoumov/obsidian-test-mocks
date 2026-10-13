import type { Pos } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { parseMarkdownContent } from './markdown-parser.ts';
import { ensureNonNullable } from './type-guards.ts';

const HEADING_COUNT_ALL = 6;
const HEADING_LEVEL_2 = 2;
const HEADING_INDEX_LAST = 5;
const HEADING_LEVEL_6 = 6;
const TAG_COUNT = 2;
const TAG_COL_OFFSET = 5;
const LIST_ITEM_COUNT_3 = 3;
const LIST_ITEM_COUNT_2 = 2;
const ROOT_PARENT_LINE = -2;
const LINE_A = 2;
const LINE_B = 3;
const LINE_D = 5;
const FLAT_LIST_ITEM_COUNT = 10_000;
const HEADING_OFFSET = 10;
const COMPLEX_HEADING_COUNT = 2;
const COMPLEX_LIST_ITEM_COUNT = 2;
const NESTED_LIST_TOTAL_COUNT = 4;
const PARAGRAPH_COUNT_2 = 2;
const PARAGRAPH_COUNT_3 = 3;
const FIRST_BLOCK_END_OFFSET = 4;
const SECOND_BLOCK_START_OFFSET = 6;
const SECOND_BLOCK_LINE = 2;
const REPLACEMENT_CHARACTER = String.fromCodePoint(0xFF_FD);
const LAST_CHARACTER = String.fromCodePoint(0x10_FF_FF);

describe('parseMarkdownContent', () => {
  describe('empty document', () => {
    it('should return empty cache for empty string', () => {
      const cache = parseMarkdownContent('');
      expect(cache.frontmatter).toBeUndefined();
      expect(cache.frontmatterLinks).toBeUndefined();
      expect(cache.headings).toBeUndefined();
      expect(cache.tags).toBeUndefined();
      expect(cache.links).toBeUndefined();
      expect(cache.embeds).toBeUndefined();
      expect(cache.listItems).toBeUndefined();
    });
  });

  describe('frontmatter', () => {
    it('should parse YAML frontmatter', () => {
      const content = '---\ntitle: Hello\ntags: [foo, bar]\n---\n\nSome content';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatter).toBeDefined();
      expect(cache.frontmatter?.['title']).toBe('Hello');
      expect(cache.frontmatter?.['tags']).toEqual(['foo', 'bar']);
    });

    it('should set frontmatterPosition', () => {
      const content = '---\ntitle: Hello\n---\n\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterPosition).toBeDefined();
      expect(cache.frontmatterPosition?.start.line).toBe(0);
      expect(cache.frontmatterPosition?.start.col).toBe(0);
      expect(cache.frontmatterPosition?.start.offset).toBe(0);
    });

    // Rows from Obsidian 1.14.4's own metadata worker: the block ends at the end of the closing `---`, never at the
    // start of the line after it. Each row is the frontmatterPosition (or null when the block is not an object), then
    // every section as [type, start offset, end line, end col, end offset].
    it.each([
      { content: '---\ntags: [x]\nrel: "[[T]]"\n---\n# Head', expected: [[3, 3, 30], [['yaml', 0, 3, 3, 30], ['heading', 31, 4, 6, 37]]] },
      { content: '---\na: 1\n---', expected: [[2, 3, 12], [['yaml', 0, 2, 3, 12]]] },
      { content: '---\na: 1\n---\n', expected: [[2, 3, 12], [['yaml', 0, 2, 3, 12]]] },
      { content: '---\na: 1\n---\n\n', expected: [[2, 3, 12], [['yaml', 0, 2, 3, 12]]] },
      { content: '---\na: 1\n---\ntext', expected: [[2, 3, 12], [['yaml', 0, 2, 3, 12], ['paragraph', 13, 3, 4, 17]]] },
      { content: '---\na: 1\n---\n\ntext', expected: [[2, 3, 12], [['yaml', 0, 2, 3, 12], ['paragraph', 14, 4, 4, 18]]] },
      { content: '---\na: 1\n---\n- A', expected: [[2, 3, 12], [['yaml', 0, 2, 3, 12], ['list', 13, 3, 3, 16]]] },
      { content: '---\na: 1\n---\n***', expected: [[2, 3, 12], [['yaml', 0, 2, 3, 12], ['thematicBreak', 13, 3, 3, 16]]] },
      { content: '---\n---\ntext', expected: [null, [['yaml', 0, 1, 3, 7], ['paragraph', 8, 2, 4, 12]]] },
      { content: '---\nx\n---\ntext', expected: [null, [['yaml', 0, 2, 3, 9], ['paragraph', 10, 3, 4, 14]]] }
    ])('should end the block at its closing delimiter in $content', ({ content, expected }) => {
      const cache = parseMarkdownContent(content);
      const end = cache.frontmatterPosition?.end;
      expect([
        end ? [end.line, end.col, end.offset] : null,
        cache.sections?.map((section) => [
          section.type,
          section.position.start.offset,
          section.position.end.line,
          section.position.end.col,
          section.position.end.offset
        ])
      ]).toEqual(expected);
    });

    // Rows from Obsidian 1.14.4's own metadata worker, whose frontmatter tokenizer takes the first `---` starting a later
    // line as the closing delimiter, whatever follows it there, and goes on tokenizing right after it. The public
    // `getFrontMatterInfo` does not: it wants the line to end after the `---`. The opening `---` takes no trailing
    // whitespace, and an indented ` ---` closes nothing. Each row is the frontmatterPosition's end (or null), every
    // section as [type, start line, start col, end offset], the start offsets of the tags and then the links, and every
    // list item as [parent, start col, end offset].
    it.each([
      { content: '---\na: 1\n---   \ntext', expected: [[2, 3, 12], [['yaml', 0, 0, 12], ['paragraph', 3, 0, 20]], [], []] },
      { content: '---\na: 1\n---\t\ntext', expected: [[2, 3, 12], [['yaml', 0, 0, 12], ['paragraph', 3, 0, 18]], [], []] },
      { content: '---\na: 1\n---  \n', expected: [[2, 3, 12], [['yaml', 0, 0, 12]], [], []] },
      { content: '---\r\na: 1\r\n---  \r\ntext', expected: [[2, 3, 14], [['yaml', 0, 0, 14], ['paragraph', 3, 0, 22]], [], []] },
      { content: '---\n---  \ntext', expected: [null, [['yaml', 0, 0, 7], ['paragraph', 2, 0, 14]], [], []] },
      { content: '---\na: 1\n---   \n# H', expected: [[2, 3, 12], [['yaml', 0, 0, 12], ['heading', 3, 0, 19]], [], []] },
      { content: '---\na: 1\n---x\ntext', expected: [[2, 3, 12], [['yaml', 0, 0, 12], ['paragraph', 2, 3, 18]], [], []] },
      {
        content: '---\na: 1\n--- #tag [[L]]\ntext',
        expected: [[2, 3, 12], [['yaml', 0, 0, 12], ['paragraph', 2, 3, 28]], [13, 18], []]
      },
      {
        content: '---\na: 1\n---- \n- A',
        expected: [[2, 3, 12], [['yaml', 0, 0, 12], ['list', 2, 3, 18]], [], [[-2, 3, 14], [-2, 0, 18]]]
      },
      {
        content: '---\na: 1\n ---\ntext',
        expected: [
          null,
          [['thematicBreak', 0, 0, 3], ['paragraph', 1, 0, 8], ['thematicBreak', 2, 0, 13], ['paragraph', 3, 0, 18]],
          [],
          []
        ]
      },
      {
        content: '---  \na: 1\n---\ntext',
        expected: [null, [['thematicBreak', 0, 0, 5], ['heading', 1, 0, 14], ['paragraph', 3, 0, 19]], [], []]
      }
    ])('should read the closing delimiter\'s line as Obsidian\'s worker does in $content', ({ content, expected }) => {
      const cache = parseMarkdownContent(content);
      const end = cache.frontmatterPosition?.end;
      expect([
        end ? [end.line, end.col, end.offset] : null,
        cache.sections?.map((section) => [
          section.type,
          section.position.start.line,
          section.position.start.col,
          section.position.end.offset
        ]),
        [...cache.tags ?? [], ...cache.links ?? []].map((reference) => reference.position.start.offset),
        (cache.listItems ?? []).map((item) => [item.parent, item.position.start.col, item.position.end.offset])
      ]).toEqual(expected);
    });

    it('should read the frontmatter of a block closed by a delimiter with trailing whitespace', () => {
      const cache = parseMarkdownContent('---\ntitle: Hello\nrelated: "[[T]]"\n---   \nBody');
      expect(cache.frontmatter).toEqual({ related: '[[T]]', title: 'Hello' });
      expect(cache.frontmatterLinks?.map((link) => link.link)).toEqual(['T']);
    });

    it('should add yaml section', () => {
      const content = '---\ntitle: Hello\n---\n';
      const cache = parseMarkdownContent(content);

      expect(cache.sections).toBeDefined();
      const yamlSection = cache.sections?.find((s) => s.type === 'yaml');
      expect(yamlSection).toBeDefined();
    });

    it('should not set frontmatter when the block holds only whitespace', () => {
      const content = '---\n \n---\n\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatter).toBeUndefined();
    });

    it('should not set frontmatterPosition when the block holds only whitespace', () => {
      const content = '---\n \n---\n\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterPosition).toBeUndefined();
    });

    it('should not set frontmatterLinks when the block holds only whitespace', () => {
      const content = '---\n \n---\n\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks).toBeUndefined();
    });

    it('should not set frontmatter when the YAML parses to a non-object', () => {
      const content = '---\njust a string\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatter).toBeUndefined();
    });

    it('should not set frontmatterPosition when the YAML parses to a non-object', () => {
      const content = '---\njust a string\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterPosition).toBeUndefined();
    });

    it('should not set frontmatterLinks when the YAML parses to a non-object', () => {
      const content = '---\njust a string\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks).toBeUndefined();
    });

    it('should still add the yaml section when the YAML parses to a non-object', () => {
      const content = '---\njust a string\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.sections?.find((section) => section.type === 'yaml')).toBeDefined();
    });

    it('should not set frontmatter when the YAML is invalid', () => {
      const content = '---\nkey: [unclosed\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatter).toBeUndefined();
    });

    it('should not set frontmatterPosition when the YAML is invalid', () => {
      const content = '---\nkey: [unclosed\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterPosition).toBeUndefined();
    });

    it('should not set frontmatterLinks when the YAML is invalid', () => {
      const content = '---\nkey: [unclosed\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks).toBeUndefined();
    });

    it('should still add the yaml section when the YAML is invalid', () => {
      const content = '---\nkey: [unclosed\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.sections?.find((section) => section.type === 'yaml')).toBeDefined();
    });

    it('should still parse the body when the YAML is invalid', () => {
      const content = '---\nkey: [unclosed\n---\n# Heading';
      const cache = parseMarkdownContent(content);

      expect(cache.headings?.[0]?.heading).toBe('Heading');
    });

    it('should not set frontmatter when the YAML is a sequence', () => {
      const content = '---\n- a\n- b\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatter).toBeUndefined();
    });

    it('should not set frontmatterPosition when the YAML is a sequence', () => {
      const content = '---\n- a\n- b\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterPosition).toBeUndefined();
    });

    it('should not set frontmatterLinks when the YAML is a sequence', () => {
      const content = '---\n- a\n- b\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks).toBeUndefined();
    });

    it('should still add the yaml section when the YAML is a sequence', () => {
      const content = '---\n- a\n- b\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.sections?.find((section) => section.type === 'yaml')).toBeDefined();
    });

    it('should still parse the body when the YAML is a sequence', () => {
      const content = '---\n- a\n- b\n---\n# Heading';
      const cache = parseMarkdownContent(content);

      expect(cache.headings?.[0]?.heading).toBe('Heading');
    });

    it('should not extract links from a sequence block', () => {
      const content = '---\n- "[[Other Note]]"\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks).toBeUndefined();
    });

    it('should not parse content before frontmatter as body', () => {
      const content = '---\nkey: value\n---\n';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatter?.['key']).toBe('value');
    });

    it('should extract wikilinks from a string frontmatter value', () => {
      const content = '---\nrelated: "[[Other Note|Alias]]"\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks).toHaveLength(1);
      expect(cache.frontmatterLinks?.[0]?.key).toBe('related');
      expect(cache.frontmatterLinks?.[0]?.link).toBe('Other Note');
      expect(cache.frontmatterLinks?.[0]?.displayText).toBe('Alias');
      expect(cache.frontmatterLinks?.[0]?.original).toBe('[[Other Note|Alias]]');
    });

    it('should extract wikilinks from an array frontmatter value with indexed keys', () => {
      const content = '---\nrefs:\n  - "[[A]]"\n  - "[[B]]"\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks).toHaveLength(2);
      expect(cache.frontmatterLinks?.[0]?.key).toBe('refs.0');
      expect(cache.frontmatterLinks?.[0]?.link).toBe('A');
      expect(cache.frontmatterLinks?.[1]?.key).toBe('refs.1');
      expect(cache.frontmatterLinks?.[1]?.link).toBe('B');
    });

    it('should set frontmatterLinks to an empty array when there are no links', () => {
      const content = '---\ntitle: Plain\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks).toEqual([]);
    });

    it('should ignore non-string frontmatter values and non-string array items', () => {
      const content = '---\ncount: 5\nnums:\n  - 1\n  - 2\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks).toEqual([]);
    });

    it('should give a wikilink with no alias the display text Obsidian derives from its target', () => {
      const content = '---\nrelated: "[[Target]]"\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks).toEqual([{
        displayText: 'Target',
        key: 'related',
        link: 'Target',
        original: '[[Target]]'
      }]);
    });

    it('should title a subpath wikilink the way Obsidian shows it', () => {
      const content = '---\nrelated: "[[Note#Section]]"\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks?.[0]?.link).toBe('Note#Section');
      expect(cache.frontmatterLinks?.[0]?.displayText).toBe('Note > Section');
    });

    it('should not read a pipe at the start of the target as an empty alias', () => {
      const content = '---\nrelated: "[[|Target]]"\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks?.[0]?.link).toBe('|Target');
      expect(cache.frontmatterLinks?.[0]?.displayText).toBe('|Target');
    });

    it('should drop a trailing backslash from the target', () => {
      const content = '---\nrelated: "[[Target\\\\]]"\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks?.[0]?.link).toBe('Target');
    });

    it('should fold a non-breaking space in the target and normalize it, as Obsidian does', () => {
      const content = '---\nspaced: "[[A\u{A0}B]]"\ncomposed: "[[Cafe\u{301}]]"\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks?.[0]?.link).toBe('A B');
      expect(cache.frontmatterLinks?.[1]?.link).toBe('Caf\u{E9}');
    });

    it('should not find a wikilink written inside a longer value', () => {
      const content = '---\nrelated: "see [[Target]] later"\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks).toEqual([]);
    });

    it('should extract a markdown link whose target is internal', () => {
      const content = '---\nrelated: "[Shown](Target.md)"\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks).toEqual([{
        displayText: 'Shown',
        key: 'related',
        link: 'Target.md',
        original: '[Shown](Target.md)'
      }]);
    });

    it('should keep the whole value as the original when a markdown link carries a title', () => {
      const content = '---\nrelated: "[Shown](Target.md \\"Title\\")"\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks?.[0]?.link).toBe('Target.md');
      expect(cache.frontmatterLinks?.[0]?.original).toBe('[Shown](Target.md "Title")');
    });

    it('should unwrap an angle-bracketed markdown target', () => {
      const content = '---\nrelated: "[Shown](<Some Target.md>)"\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks?.[0]?.link).toBe('Some Target.md');
    });

    it('should decode a percent-encoded markdown target', () => {
      const content = '---\nrelated: "[Shown](Target%20A.md)"\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks?.[0]?.link).toBe('Target A.md');
    });

    it('should keep a markdown target that cannot be decoded as it is', () => {
      const content = '---\nrelated: "[Shown](Target%ZZ.md)"\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks?.[0]?.link).toBe('Target%ZZ.md');
    });

    it('should skip a markdown link that points out of the vault', () => {
      const content = '---\nsite: "[Site](https://example.com)"\nmail: "[Mail](mailto:someone@example.com)"\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks).toEqual([]);
    });

    it('should keep an explicitly relative markdown target even when it carries a colon', () => {
      const content = '---\nhere: "[A](./a:b.md)"\nup: "[B](../a:b.md)"\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks?.map((link) => link.link)).toEqual(['./a:b.md', '../a:b.md']);
    });

    it('should read a markdown link with no target as no link, where Obsidian throws instead', () => {
      const content = '---\nrelated: "[Shown]()"\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks).toEqual([]);
    });

    it('should ignore a value that merely opens and closes like a markdown link', () => {
      const content = '---\nrelated: "[Shown)"\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks).toEqual([]);
    });

    it('should not read an embed as a frontmatter link', () => {
      const content = '---\nrelated: "![Shown](Target.md)"\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks).toEqual([]);
    });

    it('should key a link nested in an object by its dotted path', () => {
      const content = '---\nmeta:\n  related:\n    - "[[A]]"\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks?.[0]?.key).toBe('meta.related.0');
    });

    it('should reach a link at any nesting depth', () => {
      const content = '---\na:\n  b:\n    c:\n      - d: "[[Deep]]"\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks?.[0]?.key).toBe('a.b.c.0.d');
      expect(cache.frontmatterLinks?.[0]?.link).toBe('Deep');
    });

    it('should walk past a null frontmatter value rather than throwing on it', () => {
      const content = '---\nempty:\nrelated: "[[Target]]"\n---\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatterLinks?.[0]?.key).toBe('related');
    });
  });

  describe('headings', () => {
    it('should parse h1 through h6', () => {
      const content = '# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6';
      const cache = parseMarkdownContent(content);

      expect(cache.headings).toHaveLength(HEADING_COUNT_ALL);
      expect(cache.headings?.[0]).toMatchObject({ heading: 'H1', level: 1 });
      expect(cache.headings?.[1]).toMatchObject({ heading: 'H2', level: HEADING_LEVEL_2 });
      expect(cache.headings?.[HEADING_INDEX_LAST]).toMatchObject({ heading: 'H6', level: HEADING_LEVEL_6 });
    });

    it('should track heading positions', () => {
      const content = 'Some text\n# Heading\nMore text';
      const cache = parseMarkdownContent(content);

      expect(cache.headings).toHaveLength(1);
      expect(cache.headings?.[0]?.position.start.line).toBe(1);
      expect(cache.headings?.[0]?.position.start.col).toBe(0);
    });

    it('should not parse headings inside code blocks', () => {
      const content = '```\n# Not a heading\n```\n# Real heading';
      const cache = parseMarkdownContent(content);

      expect(cache.headings).toHaveLength(1);
      expect(cache.headings?.[0]?.heading).toBe('Real heading');
    });

    it('should not parse headings inside tilde fenced code blocks', () => {
      const content = '~~~\n# Not a heading\n~~~\n# Real heading';
      const cache = parseMarkdownContent(content);

      expect(cache.headings).toHaveLength(1);
      expect(cache.headings?.[0]?.heading).toBe('Real heading');
    });

    it('should not parse tags inside inline code', () => {
      const content = '`#not-a-tag` followed by\n#real-tag';
      const cache = parseMarkdownContent(content);

      expect(cache.tags).toHaveLength(1);
      expect(cache.tags?.[0]?.tag).toBe('#real-tag');
    });
  });

  describe('tags', () => {
    it('should parse inline tags', () => {
      const content = 'Some text #tag1 and #tag2';
      const cache = parseMarkdownContent(content);

      expect(cache.tags).toHaveLength(TAG_COUNT);
      expect(cache.tags?.[0]?.tag).toBe('#tag1');
      expect(cache.tags?.[1]?.tag).toBe('#tag2');
    });

    it('should parse nested tags', () => {
      const content = 'A #parent/child tag';
      const cache = parseMarkdownContent(content);

      expect(cache.tags).toHaveLength(1);
      expect(cache.tags?.[0]?.tag).toBe('#parent/child');
    });

    it('should not parse tags in code blocks', () => {
      const content = '```\n#not-a-tag\n```\n#real-tag';
      const cache = parseMarkdownContent(content);

      expect(cache.tags).toHaveLength(1);
      expect(cache.tags?.[0]?.tag).toBe('#real-tag');
    });

    it('should not parse tags in inline code', () => {
      const content = 'Text `#not-a-tag` and #real-tag';
      const cache = parseMarkdownContent(content);

      expect(cache.tags).toHaveLength(1);
      expect(cache.tags?.[0]?.tag).toBe('#real-tag');
    });

    it('should track tag positions', () => {
      const content = 'Text #mytag rest';
      const cache = parseMarkdownContent(content);

      expect(cache.tags?.[0]?.position.start.col).toBe(TAG_COL_OFFSET);
    });

    it('should parse tags at the beginning of a line', () => {
      const content = '#tag-at-start';
      const cache = parseMarkdownContent(content);

      expect(cache.tags).toHaveLength(1);
      expect(cache.tags?.[0]?.tag).toBe('#tag-at-start');
    });

    it('should parse tags with underscores and hyphens', () => {
      const content = '#tag_with-mixed';
      const cache = parseMarkdownContent(content);

      expect(cache.tags).toHaveLength(1);
      expect(cache.tags?.[0]?.tag).toBe('#tag_with-mixed');
    });
  });

  describe('links', () => {
    it('should parse wikilinks', () => {
      const content = 'See [[Page Name]] for details';
      const cache = parseMarkdownContent(content);

      expect(cache.links).toHaveLength(1);
      expect(cache.links?.[0]).toMatchObject({
        displayText: 'Page Name',
        link: 'Page Name',
        original: '[[Page Name]]'
      });
    });

    it('should parse wikilinks with display text', () => {
      const content = 'See [[Page Name|Custom Text]]';
      const cache = parseMarkdownContent(content);

      expect(cache.links).toHaveLength(1);
      expect(cache.links?.[0]).toMatchObject({
        displayText: 'Custom Text',
        link: 'Page Name'
      });
    });

    it('should parse markdown links', () => {
      const content = 'Visit [Example](https://example.com)';
      const cache = parseMarkdownContent(content);

      expect(cache.links).toHaveLength(1);
      expect(cache.links?.[0]).toMatchObject({
        displayText: 'Example',
        link: 'https://example.com'
      });
    });

    it('should not parse links in code blocks', () => {
      const content = '```\n[[not a link]]\n```\n[[real link]]';
      const cache = parseMarkdownContent(content);

      expect(cache.links).toHaveLength(1);
      expect(cache.links?.[0]?.link).toBe('real link');
    });

    it('should not parse markdown links in code blocks', () => {
      const content = '```\n[text](url)\n```\n[real](link)';
      const cache = parseMarkdownContent(content);

      expect(cache.links).toHaveLength(1);
      expect(cache.links?.[0]?.link).toBe('link');
    });

    it('should set default displayText for wiki links without display', () => {
      const content = '[[note]]';
      const cache = parseMarkdownContent(content);

      expect(cache.links?.[0]?.displayText).toBe('note');
    });
  });

  describe('embeds', () => {
    it('should parse wiki embeds', () => {
      const content = '![[image.png]]';
      const cache = parseMarkdownContent(content);

      expect(cache.embeds).toHaveLength(1);
      expect(cache.embeds?.[0]).toMatchObject({
        link: 'image.png',
        original: '![[image.png]]'
      });
    });

    it('should parse wiki embeds with display text', () => {
      const content = '![[note#heading|100]]';
      const cache = parseMarkdownContent(content);

      expect(cache.embeds).toHaveLength(1);
      expect(cache.embeds?.[0]).toMatchObject({
        displayText: '100',
        link: 'note#heading'
      });
    });

    it('should parse markdown embeds', () => {
      const content = '![Alt text](image.png)';
      const cache = parseMarkdownContent(content);

      expect(cache.embeds).toHaveLength(1);
      expect(cache.embeds?.[0]).toMatchObject({
        displayText: 'Alt text',
        link: 'image.png'
      });
    });

    it('should not parse wiki embeds in code blocks', () => {
      const content = '```\n![[not-embed.png]]\n```\n![[real-embed.png]]';
      const cache = parseMarkdownContent(content);

      expect(cache.embeds).toHaveLength(1);
      expect(cache.embeds?.[0]?.link).toBe('real-embed.png');
    });

    it('should not parse markdown embeds in code blocks', () => {
      const content = '```\n![alt](not-embed.png)\n```\n![alt](real-embed.png)';
      const cache = parseMarkdownContent(content);

      expect(cache.embeds).toHaveLength(1);
      expect(cache.embeds?.[0]?.link).toBe('real-embed.png');
    });

    it('should set default displayText to link for wiki embeds without display', () => {
      const content = '![[note.md]]';
      const cache = parseMarkdownContent(content);

      expect(cache.embeds?.[0]?.displayText).toBe('note.md');
    });
  });

  describe('list items', () => {
    it('should parse unordered list items', () => {
      const content = '- Item 1\n- Item 2\n- Item 3';
      const cache = parseMarkdownContent(content);

      expect(cache.listItems).toHaveLength(LIST_ITEM_COUNT_3);
    });

    it('should parse ordered list items', () => {
      const content = '1. First\n2. Second';
      const cache = parseMarkdownContent(content);

      expect(cache.listItems).toHaveLength(LIST_ITEM_COUNT_2);
    });

    it('should parse task list items', () => {
      const content = '- [ ] Incomplete\n- [x] Complete';
      const cache = parseMarkdownContent(content);

      expect(cache.listItems).toHaveLength(LIST_ITEM_COUNT_2);
      expect(cache.listItems?.[0]?.task).toBe(' ');
      expect(cache.listItems?.[1]?.task).toBe('x');
    });

    it('should track parent for nested items', () => {
      const content = '- Parent\n  - Child';
      const cache = parseMarkdownContent(content);

      expect(cache.listItems).toHaveLength(LIST_ITEM_COUNT_2);
      // Child's parent should reference parent's line
      expect(cache.listItems?.[1]?.parent).toBe(0);
    });

    it('should set negative parent for root items', () => {
      const content = 'Some text\n\n- Root 1\n- Root 2';
      const cache = parseMarkdownContent(content);

      expect(cache.listItems).toHaveLength(LIST_ITEM_COUNT_2);
      // Root items have parent = negative of first root item's line (line 2 here)
      expect(cache.listItems?.[0]?.parent).toBe(ROOT_PARENT_LINE);
      expect(cache.listItems?.[1]?.parent).toBe(ROOT_PARENT_LINE);
    });

    it('should take the nearest earlier item with less indent as the parent across nesting changes', () => {
      const content = 'Text\n\n- A\n  - B\n    - C\n- D\n  - E';
      const cache = parseMarkdownContent(content);

      expect(cache.listItems?.map((item) => item.parent)).toEqual([
        ROOT_PARENT_LINE,
        LINE_A,
        LINE_B,
        ROOT_PARENT_LINE,
        LINE_D
      ]);
    });

    // Each row was measured on a real Obsidian 1.14.4: every item's [start line, start col, start offset, parent].
    it.each([
      { content: '- A\n  - B\n  - C', expected: [[0, 0, 0, -1], [1, 2, 6, 0], [2, 2, 12, 0]] },
      { content: '- A\n  - B\n    - C\n  - D\n- E', expected: [[0, 0, 0, -1], [1, 2, 6, 0], [2, 4, 14, 1], [3, 2, 20, 0], [4, 0, 24, -1]] },
      { content: '- A\n\t- B\n\t\t- C\n\t- D', expected: [[0, 0, 0, -1], [1, 1, 5, 0], [2, 2, 11, 1], [3, 1, 16, 0]] },
      { content: '1. A\n   1. B\n   2. C\n2. D', expected: [[0, 0, 0, -1], [1, 3, 8, 0], [2, 3, 16, 0], [3, 0, 21, -1]] },
      { content: '- [ ] A\n  - [x] B\n  - C', expected: [[0, 0, 0, -1], [1, 2, 10, 0], [2, 2, 20, 0]] },
      { content: 'para\n\n  - A\n    - B\n  - C', expected: [[2, 0, 6, -2], [3, 4, 16, 2], [4, 0, 20, -2]] },
      { content: '* A\n    * B\n  * C', expected: [[0, 0, 0, -1], [1, 2, 6, 0], [2, 2, 14, 0]] },
      { content: '- A\n - B\n   - C', expected: [[0, 0, 0, -1], [1, 0, 4, -1], [2, 3, 12, 1]] },
      { content: '- A\n  - B\n\ntext\n\n- C\n  - D', expected: [[0, 0, 0, -1], [1, 2, 6, 0], [5, 0, 17, -5], [6, 2, 23, 5]] },
      // Whitespace after the marker moves the content column, up to four columns of it.
      { content: '-   A\n   - B\n    - C', expected: [[0, 0, 0, -1], [1, 0, 6, -1], [2, 0, 13, -1]] },
      { content: '-      A\n  - B\n-  \n  - C', expected: [[0, 0, 0, -1], [1, 2, 11, 0], [2, 0, 15, -1], [3, 0, 19, -1]] },
      // An item holding nothing but the list nested in it is no parent: that list is rooted at its own first line.
      { content: '- \n  - C', expected: [[0, 0, 0, -1], [1, 2, 5, -1]] },
      { content: '-  \n   - C', expected: [[0, 0, 0, -1], [1, 3, 7, -1]] },
      { content: '- A\n- \n  - C', expected: [[0, 0, 0, -1], [1, 0, 4, -1], [2, 2, 9, -2]] },
      { content: '- \n\n  - C', expected: [[0, 0, 0, -1], [2, 2, 6, -2]] },
      { content: '- \n  - C\n    - D\n  - E', expected: [[0, 0, 0, -1], [1, 2, 5, -1], [2, 4, 13, 1], [3, 2, 19, -1]] },
      { content: '- [ ]\n  - C', expected: [[0, 0, 0, -1], [1, 2, 8, 0]] },
      { content: '- [ ] \n  - C', expected: [[0, 0, 0, -1], [1, 2, 9, 0]] }
    ])('should start each item where its container\'s content starts in $content', ({ content, expected }) => {
      const cache = parseMarkdownContent(content);

      expect(cache.listItems?.map((item) => [item.position.start.line, item.position.start.col, item.position.start.offset, item.parent]))
        .toEqual(expected);
    });

    // Each row was measured on a real Obsidian 1.14.4: every item's parent, and every list section's
    // [start line, end line, end col].
    it.each([
      // Blank lines alone never end a list.
      { content: '- A\n\n- B', lists: [[0, 2, 3]], parents: [-1, -1] },
      { content: '- A\n\n\n- B', lists: [[0, 3, 3]], parents: [-1, -1] },
      { content: '- A\n\n\n  - B', lists: [[0, 3, 5]], parents: [-1, 0] },
      { content: '- A\n  - B\n\n\n- C', lists: [[0, 4, 3]], parents: [-1, 0, -1] },
      // After a blank line, content less indented than the list's content ends it; content indented that far stays in.
      { content: '- A\n\ntext\n\n  - B', lists: [[0, 0, 3], [4, 4, 5]], parents: [-1, -4] },
      { content: '- A\n\n  text\n\n- B', lists: [[0, 4, 3]], parents: [-1, -1] },
      { content: '- A\n\n text\n\n- B', lists: [[0, 0, 3], [4, 4, 3]], parents: [-1, -4] },
      { content: '- A\n\n    code\n\n- B', lists: [[0, 4, 3]], parents: [-1, -1] },
      { content: '1. A\n\n   text\n\n2. B', lists: [[0, 4, 4]], parents: [-1, -1] },
      { content: '1. A\n\n  text\n\n2. B', lists: [[0, 0, 4], [4, 4, 4]], parents: [-1, -4] },
      { content: '- A\n\n  ```\n  x\n  ```\n\n- B', lists: [[0, 6, 3]], parents: [-1, -1] },
      // With no blank line before it, only a heading, a fence, a thematic break or a comment ends a list.
      { content: '- A\ntext\n- B', lists: [[0, 2, 3]], parents: [-1, -1] },
      { content: '- A\ntext\n\n- B', lists: [[0, 3, 3]], parents: [-1, -1] },
      { content: '- \ntext\n- B', lists: [[0, 2, 3]], parents: [-1, -1] },
      { content: '- A\n> q\n- B', lists: [[0, 2, 3]], parents: [-1, -1] },
      { content: '- A\n$$\nx\n$$\n- B', lists: [[0, 4, 3]], parents: [-1, -1] },
      { content: '- A\n<div>x</div>\n- B', lists: [[0, 2, 3]], parents: [-1, -1] },
      { content: '- A\n  # h\n- B', lists: [[0, 2, 3]], parents: [-1, -1] },
      { content: '- A\n# H\n- B', lists: [[0, 0, 3], [2, 2, 3]], parents: [-1, -2] },
      { content: '- A\n```\nx\n```\n- B', lists: [[0, 0, 3], [4, 4, 3]], parents: [-1, -4] },
      { content: '- A\n***\n- B', lists: [[0, 0, 3], [2, 2, 3]], parents: [-1, -2] },
      { content: '- A\n---\n- B', lists: [[0, 0, 3], [2, 2, 3]], parents: [-1, -2] },
      { content: '- A\n%%\nx\n%%\n- B', lists: [[0, 0, 3], [4, 4, 3]], parents: [-1, -4] },
      // A top-level item of another kind starts a list of its own; a nested one does not.
      { content: '- A\n* B', lists: [[0, 0, 3], [1, 1, 3]], parents: [-1, -1] },
      { content: '- A\n\n* B', lists: [[0, 0, 3], [2, 2, 3]], parents: [-1, -2] },
      { content: '- A\n1. B', lists: [[0, 0, 3], [1, 1, 4]], parents: [-1, -1] },
      { content: '1. A\n2) B', lists: [[0, 0, 4], [1, 1, 4]], parents: [-1, -1] },
      { content: '- A\n  - B\n  * C\n- D', lists: [[0, 3, 3]], parents: [-1, 0, 0, -1] },
      // A block after a nested list inside the same item roots that nested list at its own first line.
      { content: '- A\n  - B\n\n  text\n\n    - C', lists: [[0, 5, 7]], parents: [-1, -1, 0] },
      { content: '- A\n  - B\n  # h\n    - C', lists: [[0, 3, 7]], parents: [-1, -1, 0] },
      { content: '- A\n  - B\n  text\n    - C', lists: [[0, 3, 7]], parents: [-1, 0, 1] },
      { content: 'p\n\n- A\n  - B\n\n  text\n\n    - C', lists: [[2, 7, 7]], parents: [-2, -3, 2] },
      { content: 'p\n\n- A\n  - B\n    - B2\n\n  text\n\n    - C', lists: [[2, 8, 7]], parents: [-2, -3, 3, 2] },
      { content: 'p\n\n- A\n  - B\n\n  - B3', lists: [[2, 5, 6]], parents: [-2, 2, 2] },
      { content: 'p\n\n- A\n\n  text\n\n  - C', lists: [[2, 6, 5]], parents: [-2, 2] },
      { content: 'p\n\n- A\n  - B\n  # h', lists: [[2, 4, 5]], parents: [-2, -3] },
      { content: 'p\n\n- A\n  - B\n\n  text', lists: [[2, 5, 6]], parents: [-2, -3] },
      { content: 'p\n\n- A\n  - B\n\n  text\n- D\n  - E', lists: [[2, 7, 5]], parents: [-2, -3, -2, 6] },
      { content: 'p\n\n- A\n  - B\n- D\n  - E\n\n  text', lists: [[2, 7, 6]], parents: [-2, 2, -2, -5] },
      { content: 'p\n\n- A\n  - B\n    - C\n\n    text', lists: [[2, 6, 8]], parents: [-2, 2, -4] }
    ])('should group the items of $content into lists as Obsidian does', ({ content, lists, parents }) => {
      const cache = parseMarkdownContent(content);

      expect(cache.listItems?.map((item) => item.parent)).toEqual(parents);
      expect(
        cache.sections?.filter((section) => section.type === 'list').map((section) => [
          section.position.start.line,
          section.position.end.line,
          section.position.end.col
        ])
      ).toEqual(lists);
    });

    // Each row was measured on a real Obsidian 1.14.4: every item's [start line, start col, start offset, parent], and
    // every list section's [start offset, end offset]. A list inside a blockquote has no section of its own.
    it.each([
      { content: '> - A\n>   - B\n', expected: [[0, 2, 2, -1], [1, 4, 10, 0]], lists: [] },
      { content: '> - A\n> - B\n', expected: [[0, 2, 2, -1], [1, 2, 8, -1]], lists: [] },
      { content: '> > - A\n> >   - B\n', expected: [[0, 4, 4, -1], [1, 6, 14, 0]], lists: [] },
      { content: '> [!note]\n> - A\n> - B\n', expected: [[1, 2, 12, -1], [2, 2, 18, -1]], lists: [] },
      { content: '> [!note] Title\n> - A\n>   - B\n', expected: [[1, 2, 18, -1], [2, 4, 26, 1]], lists: [] },
      { content: '> text\n> - A\n', expected: [[1, 2, 9, -1]], lists: [] },
      { content: '> text\n>\n> - A\n', expected: [[2, 2, 11, -2]], lists: [] },
      { content: '> - A\n- B\n', expected: [[0, 2, 2, -1], [1, 0, 6, -1]], lists: [[6, 9]] },
      { content: '- A\n> - B\n', expected: [[0, 0, 0, -1], [1, 2, 6, -1]], lists: [[0, 9]] },
      { content: '- A\n  > - B\n', expected: [[0, 0, 0, -1], [1, 4, 8, -1]], lists: [[0, 11]] },
      { content: '>- A\n>- B\n', expected: [[0, 1, 1, -1], [1, 1, 6, -1]], lists: [] },
      { content: '>  - A\n>    - B\n', expected: [[0, 2, 2, -1], [1, 5, 12, 0]], lists: [] },
      { content: '> 1. A\n> 2. B\n', expected: [[0, 2, 2, -1], [1, 2, 9, -1]], lists: [] },
      { content: '> - A\n\n> - B\n', expected: [[0, 2, 2, -1], [2, 2, 9, -2]], lists: [] },
      { content: '> - A\n>\n> - B\n', expected: [[0, 2, 2, -1], [2, 2, 10, -1]], lists: [] },
      { content: '> - A\n  - B\n', expected: [[0, 2, 2, -1], [1, 0, 6, -1]], lists: [[6, 11]] },
      { content: '> - A\ntext\n> - B\n', expected: [[0, 2, 2, -1], [2, 2, 13, -1]], lists: [] },
      { content: '>\t- A\n', expected: [], lists: [] },
      { content: '> - A\n>   more\n> - B\n', expected: [[0, 2, 2, -1], [2, 2, 17, -1]], lists: [] },
      { content: '> - [ ] A\n> - [x] B\n', expected: [[0, 2, 2, -1], [1, 2, 12, -1]], lists: [] },
      { content: '  > - A\n  >   - B\n', expected: [[0, 4, 4, -1], [1, 6, 14, 0]], lists: [] },
      { content: 'text\n\n> - A\n', expected: [[2, 2, 8, -2]], lists: [] },
      { content: '> - A\n> > - B\n', expected: [[0, 2, 2, -1], [1, 4, 10, -1]], lists: [] },
      { content: '> - A\n>   - B\n>     - C\n>   - D\n', expected: [[0, 2, 2, -1], [1, 4, 10, 0], [2, 6, 20, 1], [3, 4, 28, 0]], lists: [] },
      { content: '> - A\n> > - B\n> - C\n', expected: [[0, 2, 2, -1], [1, 4, 10, -1], [2, 2, 16, -1]], lists: [] },
      { content: '> - A\n- B\n> - C\n', expected: [[0, 2, 2, -1], [1, 0, 6, -1], [2, 2, 12, -2]], lists: [[6, 15]] },
      { content: '- A\n> - B\n- C\n', expected: [[0, 0, 0, -1], [1, 2, 6, -1], [2, 0, 10, -1]], lists: [[0, 13]] },
      { content: '- A\n  - B\n> - C\n  - D\n', expected: [[0, 0, 0, -1], [1, 2, 6, 0], [2, 2, 12, -2], [3, 2, 18, 0]], lists: [[0, 21]] },
      { content: '> - A\n>\n>   text\n> - B\n', expected: [[0, 2, 2, -1], [3, 2, 19, -1]], lists: [] },
      { content: '> - A\n>\n> text\n> - B\n', expected: [[0, 2, 2, -1], [3, 2, 17, -3]], lists: [] },
      { content: '> - A\n> # H\n> - B\n', expected: [[0, 2, 2, -1], [2, 2, 14, -2]], lists: [] },
      { content: '> - A\n>   - B\n>\n>   text\n', expected: [[0, 2, 2, -1], [1, 4, 10, -1]], lists: [] },
      { content: '> \t- A\n', expected: [], lists: [] },
      { content: '>\t\t- A\n', expected: [], lists: [] },
      { content: '>  \t- A\n', expected: [[0, 2, 2, -1]], lists: [] },
      { content: '> - A\n> \n> - B\n', expected: [[0, 2, 2, -1], [2, 2, 11, -1]], lists: [] },
      { content: '> ```\n> - A\n> ```\n', expected: [], lists: [] },
      { content: '- A\n\n> - B\n', expected: [[0, 0, 0, -1], [2, 2, 7, -2]], lists: [[0, 3]] },
      { content: '- A\n\n  > - B\n', expected: [[0, 0, 0, -1], [2, 4, 9, -2]], lists: [[0, 12]] },
      { content: '> - A\n\n- B\n', expected: [[0, 2, 2, -1], [2, 0, 7, -2]], lists: [[7, 10]] },
      { content: '> > - A\n> - B\n', expected: [[0, 4, 4, -1], [1, 2, 10, -1]], lists: [] },
      { content: '> - A\n> > - B\n>   - C\n', expected: [[0, 2, 2, -1], [1, 4, 10, -1], [2, 4, 18, 0]], lists: [] },
      { content: '> 1. A\n> - B\n', expected: [[0, 2, 2, -1], [1, 2, 9, -1]], lists: [] },
      { content: 'text\n> - A\n', expected: [[1, 2, 7, -1]], lists: [] },
      { content: '- A\n  > - B\n  >   - C\n- D\n', expected: [[0, 0, 0, -1], [1, 4, 8, -1], [2, 6, 18, 1], [3, 0, 22, -1]], lists: [[0, 25]] },
      { content: '>>- A\n', expected: [[0, 2, 2, -1]], lists: [] },
      { content: '   > - A\n', expected: [[0, 5, 5, -1]], lists: [] },
      { content: '> - A\n>     - B\n', expected: [[0, 2, 2, -1], [1, 4, 10, 0]], lists: [] },
      { content: '> - A\n>   - B\n>\n>   - C\n', expected: [[0, 2, 2, -1], [1, 4, 10, 0], [3, 4, 20, 0]], lists: [] },
      { content: '> - A\n>\n>     code\n> - B\n', expected: [[0, 2, 2, -1], [3, 2, 21, -1]], lists: [] },
      { content: '> * A\n> - B\n', expected: [[0, 2, 2, -1], [1, 2, 8, -1]], lists: [] },
      { content: '- A\n  > - B\n  - C\n', expected: [[0, 0, 0, -1], [1, 4, 8, -1], [2, 2, 14, 0]], lists: [[0, 17]] },
      { content: '- A\n  > - B\n\n  > - C\n', expected: [[0, 0, 0, -1], [1, 4, 8, -1], [3, 4, 17, -3]], lists: [[0, 20]] },
      { content: '> - A\n> ---\n> - B\n', expected: [[0, 2, 2, -1], [2, 2, 14, -2]], lists: [] },
      { content: '> > - A\n> >\n> > - B\n> - C\n', expected: [[0, 4, 4, -1], [2, 4, 16, -1], [3, 2, 22, -3]], lists: [] },
      { content: '> [!tip]- Fold\n> 1. A\n>    - B\n> 2. C\n', expected: [[1, 2, 17, -1], [2, 5, 27, 1], [3, 2, 33, -1]], lists: [] },
      { content: '1. x\n   > - A\n   >   - B\n2. y\n', expected: [[0, 0, 0, -1], [1, 5, 10, -1], [2, 7, 21, 1], [3, 0, 25, -1]], lists: [[0, 29]] },
      { content: '> - A\n> ~~~\n> - x\n> ~~~\n> - B\n', expected: [[0, 2, 2, -1], [4, 2, 26, -4]], lists: [] },
      { content: '> - A\n   - B\n', expected: [[0, 2, 2, -1], [1, 0, 6, -1]], lists: [[6, 12]] },
      { content: '> - A\n> - \n>   - B\n', expected: [[0, 2, 2, -1], [1, 2, 8, -1], [2, 4, 15, -2]], lists: [] }
    ])('should find the items of the lists inside a blockquote in $content', ({ content, expected, lists }) => {
      const cache = parseMarkdownContent(content);

      expect(cache.listItems?.map((item) => [item.position.start.line, item.position.start.col, item.position.start.offset, item.parent]) ?? [])
        .toEqual(expected);
      expect(
        cache.sections?.filter((section) => section.type === 'list').map((section) => [section.position.start.offset, section.position.end.offset])
      ).toEqual(lists);
    });
    // Rows from Obsidian 1.14.4's own metadata worker: every item as [start offset, end offset, parent], and every
    // section as [type, start offset, end offset]. A line holding several markers starts an item at each, nested in the
    // one before it. An ordered item not numbered 1 cannot interrupt a blockquote, so a line starting one is taken into
    // the quote lazily and read there: as an item after an item, a heading or an empty `>` line, as paragraph text after
    // a paragraph, and as a line of a fence.
    it.each([
      { content: '- - x', items: [[0, 5, -1], [2, 5, -1]], sections: [['list', 0, 5]] },
      { content: '- - x\n', items: [[0, 5, -1], [2, 5, -1]], sections: [['list', 0, 5]] },
      { content: '* * *x', items: [[0, 6, -1], [2, 6, -1]], sections: [['list', 0, 6]] },
      { content: '1. - x', items: [[0, 6, -1], [3, 6, -1]], sections: [['list', 0, 6]] },
      { content: '- 1. x\n  - y', items: [[0, 12, -1], [2, 6, 0], [9, 12, 0]], sections: [['list', 0, 12]] },
      { content: '- - x\n  more', items: [[0, 12, -1], [2, 12, -1]], sections: [['list', 0, 12]] },
      { content: '- - x\n- y', items: [[0, 5, -1], [2, 5, -1], [6, 9, -1]], sections: [['list', 0, 9]] },
      { content: '> - - x', items: [[2, 7, -1], [4, 7, -1]], sections: [['blockquote', 0, 7]] },
      { content: '- - - x', items: [[0, 7, -1], [2, 7, -1], [4, 7, -1]], sections: [['list', 0, 7]] },
      { content: '- - [ ] x', items: [[0, 9, -1], [2, 9, -1]], sections: [['list', 0, 9]] },
      { content: '> - q\n2. y', items: [[2, 5, -1], [6, 10, -1]], sections: [['blockquote', 0, 10]] },
      { content: '> - q\n2) y', items: [[2, 5, -1], [6, 10, -1]], sections: [['blockquote', 0, 10]] },
      { content: '> q\n2. y', items: [], sections: [['blockquote', 0, 8]] },
      { content: '> text\n9. C\n', items: [], sections: [['blockquote', 0, 11]] },
      { content: '>\n9. C', items: [[2, 6, -1]], sections: [['blockquote', 0, 6]] },
      { content: '> - q\n  2. y', items: [[2, 12, -1]], sections: [['blockquote', 0, 12]] },
      { content: '> - q\n 2. y', items: [[2, 5, -1], [6, 11, -1]], sections: [['blockquote', 0, 11]] },
      { content: '> 9. C\n9. C', items: [[2, 6, -1], [7, 11, -1]], sections: [['blockquote', 0, 11]] },
      { content: '> > - q\n2. y', items: [[4, 7, -1], [8, 12, -1]], sections: [['blockquote', 0, 12]] },
      { content: '> - q\n2. y\n3. z', items: [[2, 5, -1], [6, 10, -1], [11, 15, -1]], sections: [['blockquote', 0, 15]] },
      { content: '> - q\n2. y\n- z', items: [[2, 5, -1], [6, 10, -1], [11, 14, -2]], sections: [['blockquote', 0, 10], ['list', 11, 14]] },
      { content: '> - q\n2. y\n\n3. z', items: [[2, 5, -1], [6, 10, -1], [12, 16, -3]], sections: [['blockquote', 0, 10], ['list', 12, 16]] },
      { content: '> - q\n>\n2. y', items: [[2, 5, -1], [8, 12, -2]], sections: [['blockquote', 0, 12]] },
      { content: '> # h\n2. y', items: [[6, 10, -1]], sections: [['blockquote', 0, 10]] },
      { content: '> ```\n2. y', items: [], sections: [['blockquote', 0, 10]] },
      { content: '> - q\ntext\n2. y', items: [[2, 10, -1], [11, 15, -2]], sections: [['blockquote', 0, 15]] },
      { content: '> - q\n    2. y', items: [[2, 5, -1]], sections: [['blockquote', 0, 5], ['code', 6, 14]] },
      { content: '- a\n> - q\n2. y', items: [[0, 9, -1], [6, 9, -1], [10, 14, -2]], sections: [['list', 0, 9], ['list', 10, 14]] },
      { content: '> * * *\n2. y', items: [[8, 12, -1]], sections: [['blockquote', 0, 12]] },
      { content: '> - q\n2. y\ntext', items: [[2, 5, -1], [6, 15, -1]], sections: [['blockquote', 0, 15]] }
    ])('should read $content as Obsidian does', ({ content, items, sections }) => {
      const cache = parseMarkdownContent(content);

      expect(cache.listItems?.map((item) => [item.position.start.offset, item.position.end.offset, item.parent]) ?? []).toEqual(items);
      expect(cache.sections?.map((section) => [section.type, section.position.start.offset, section.position.end.offset])).toEqual(sections);
    });
    // Each row was measured on a real Obsidian 1.14.4: every item's [start offset, end offset]. An item with more than
    // one child ends where its last child that is not a list ends; any other item ends at its last value line, or, when
    // a sibling follows it after blank lines, at the start of the first of them.
    it.each([
      { content: '- A\n', expected: [[0, 3]] },
      { content: '- A\n\n', expected: [[0, 3]] },
      { content: '- A\n\n\n', expected: [[0, 3]] },
      { content: '- A\n\n- B\n', expected: [[0, 4], [5, 8]] },
      { content: '- A\n\n\n\n- B\n', expected: [[0, 4], [7, 10]] },
      { content: '- A\n\ntext\n', expected: [[0, 3]] },
      { content: '- A\n- B\n\ntext\n', expected: [[0, 3], [4, 7]] },
      { content: '- A\n\n  text\n', expected: [[0, 11]] },
      { content: '- A\n\n  text\n\n- B\n', expected: [[0, 11], [13, 16]] },
      { content: '- A\n\n  text\n- B\n', expected: [[0, 11], [12, 15]] },
      { content: '- A\n\n  text  \n\n- B\n', expected: [[0, 13], [15, 18]] },
      { content: '- A\n  more\n- B\n', expected: [[0, 10], [11, 14]] },
      { content: '- A\ntext\n- B\n', expected: [[0, 8], [9, 12]] },
      { content: '- A\ntext', expected: [[0, 8]] },
      { content: '- A  \n- B\n', expected: [[0, 5], [6, 9]] },
      { content: '- A\n  \n- B\n', expected: [[0, 6], [7, 10]] },
      { content: '- A\n  - B\n- C\n', expected: [[0, 3], [6, 9], [10, 13]] },
      { content: '- A\n  - B\n\n- C\n', expected: [[0, 3], [6, 9], [11, 14]] },
      { content: '- A\n  - B\n\n\n- C\n', expected: [[0, 3], [6, 9], [12, 15]] },
      { content: '- A\n\n\n  - B\n', expected: [[0, 3], [8, 11]] },
      { content: '- A\n\n  - B\n', expected: [[0, 3], [7, 10]] },
      { content: '- A\n  - B\n  text\n- C\n', expected: [[0, 3], [6, 16], [17, 20]] },
      { content: '- A\n  - B\n    more\n- C\n', expected: [[0, 3], [6, 18], [19, 22]] },
      { content: '- A\n  - B\n\n  text\n- C\n', expected: [[0, 17], [6, 9], [18, 21]] },
      { content: '- A\n  - B\n\n  text\n\n- C\n', expected: [[0, 17], [6, 9], [19, 22]] },
      { content: '- A\n  - B\n\n  text\n', expected: [[0, 17], [6, 9]] },
      { content: '- A\n\n  text\n  - B\n- C\n', expected: [[0, 11], [14, 17], [18, 21]] },
      { content: '- A\n  - B\n  - C\n\n- D\n', expected: [[0, 3], [6, 9], [12, 15], [17, 20]] },
      { content: '- \n- B\n', expected: [[0, 2], [3, 6]] },
      { content: '- A\n# H\n', expected: [[0, 3]] },
      { content: '1. A\n\n2. B\n', expected: [[0, 5], [6, 10]] },
      { content: '- [ ] A\n  more\n- [ ] B\n', expected: [[0, 14], [15, 22]] },
      { content: '> - A\n> text\n> - B\n', expected: [[2, 12], [15, 18]] },
      { content: '> - A\n>\n> - B\n', expected: [[2, 7], [10, 13]] },
      { content: '> - A\n>   more\n> - B\n', expected: [[2, 14], [17, 20]] },
      { content: '> - A\n> - B\n\ntext\n', expected: [[2, 5], [8, 11]] },
      { content: '- A\n  - B\n    - C\n\n  text\n- D\n', expected: [[0, 25], [6, 9], [14, 17], [26, 29]] },
      { content: '- A\n\n  - B\n\n- C\n', expected: [[0, 3], [7, 10], [12, 15]] },
      { content: '- A\n  more\n\n- B\n', expected: [[0, 11], [12, 15]] },
      { content: '- A\n- B\n\n- C\n', expected: [[0, 3], [4, 8], [9, 12]] },
      { content: '- A\n  - B\n\n  - C\n', expected: [[0, 3], [6, 10], [13, 16]] },
      { content: '- A\ntext\n\n- B\n', expected: [[0, 9], [10, 13]] },
      { content: '- [ ] A\n\n- [ ] B\n', expected: [[0, 8], [9, 16]] },
      { content: '- \n\n- B\n', expected: [[0, 3], [4, 7]] },
      { content: '- A\n\n  text\n\n  text2\n\n- B\n', expected: [[0, 20], [22, 25]] },
      { content: '- A\n\n\n  text\n\n- B\n', expected: [[0, 12], [14, 17]] },
      { content: '- A\n\n  - B\n\n  - C\n', expected: [[0, 3], [7, 11], [14, 17]] },
      { content: '  - A\n\n  - B\n', expected: [[0, 6], [7, 12]] },
      { content: '- A\n\n- B\n\n- C\n', expected: [[0, 4], [5, 9], [10, 13]] },
      { content: '- A\n\n- B\n\ntext\n', expected: [[0, 4], [5, 8]] },
      { content: '- A\n> q\n\n- B\n', expected: [[0, 7], [9, 12]] },
      { content: '- A\n\n      code\n\n- B\n', expected: [[0, 15], [17, 20]] },
      { content: '- A\n  ```\n  code\n  ```\n\n- B\n', expected: [[0, 22], [24, 27]] },
      { content: '> - A\n>\n>\n> - B\n', expected: [[2, 7], [12, 15]] },
      { content: '- A\n \n\n- B\n', expected: [[0, 4], [7, 10]] },
      { content: '* A\n\n- B\n', expected: [[0, 3], [5, 8]] },
      { content: '- A\n\n# H\n', expected: [[0, 3]] },
      { content: '- A\n\t\n- B\n', expected: [[0, 5], [6, 9]] },
      { content: '- A\n  - B\n\n\n  - C\n', expected: [[0, 3], [6, 10], [14, 17]] },
      { content: '- A\n  more\n- B\n\n- C\n', expected: [[0, 10], [11, 15], [16, 19]] },
      { content: '- A\n  - B\n    - C\n\n    - D\n', expected: [[0, 3], [6, 9], [14, 18], [23, 26]] },
      { content: '> - A\n>   - B\n>\n>   - C\n', expected: [[2, 5], [10, 15], [20, 23]] },
      { content: '- \n  - B\n\n  - C\n', expected: [[0, 15], [5, 9], [12, 15]] },
      { content: '1. A\n   more\n\n2. B\n', expected: [[0, 13], [14, 18]] },
      { content: '- A\n  \n\n- B\n', expected: [[0, 7], [8, 11]] },
      { content: '- A\n\n  \n- B\n', expected: [[0, 7], [8, 11]] },
      { content: '- A\n  \n  \n- B\n', expected: [[0, 9], [10, 13]] },
      { content: '- A\n   \n- B\n', expected: [[0, 7], [8, 11]] },
      { content: '- A\n      \n- B\n', expected: [[0, 10], [11, 14]] },
      { content: '- A\n \n- B\n', expected: [[0, 4], [6, 9]] },
      { content: '> - A\n> \n> - B\n', expected: [[2, 8], [11, 14]] },
      { content: '> - A\n> \n> \n> - B\n', expected: [[2, 8], [14, 17]] },
      { content: '> - A\n>  \n> - B\n', expected: [[2, 8], [12, 15]] },
      { content: '> - A\n>\n>\n>\n> - B\n', expected: [[2, 7], [14, 17]] },
      { content: '- A\n  - B\n  \n  - C\n', expected: [[0, 3], [6, 12], [15, 18]] },
      { content: '- A\n  - B\n    \n  - C\n', expected: [[0, 3], [6, 14], [17, 20]] },
      { content: '- A\n  - B\n      \n  - C\n', expected: [[0, 3], [6, 16], [19, 22]] },
      { content: '- A\n  \n', expected: [[0, 6]] },
      { content: '- A\n  more\n  \n- B\n', expected: [[0, 13], [14, 17]] },
      { content: '- A\ntext\n  \n- B\n', expected: [[0, 11], [12, 15]] },
      { content: '- \n  \n- B\n', expected: [[0, 5], [6, 9]] },
      { content: '- A\n\n\n- B\n', expected: [[0, 4], [6, 9]] },
      { content: '- A\n  \n  \n\n- B\n', expected: [[0, 10], [11, 14]] },
      { content: '1. A\n   \n2. B\n', expected: [[0, 8], [9, 13]] },
      { content: '- A\n  - B\n\n  text\n  - C\n- D\n', expected: [[0, 17], [6, 9], [20, 23], [24, 27]] },
      { content: '- A\n  - B\ntext\n- C\n', expected: [[0, 3], [6, 14], [15, 18]] },
      { content: '> - A\ntext', expected: [[2, 10]] },
      { content: '> - A\ntext\n> - B', expected: [[2, 10], [13, 16]] },
      { content: '> - A\n> more\ntext', expected: [[2, 17]] },
      { content: '> - A\n> more\ntext\n> - B', expected: [[2, 17], [20, 23]] },
      { content: '> - A\n>   - B\ntext\n', expected: [[2, 5], [10, 18]] },
      { content: '- A\n> - B\ntext\n- C', expected: [[0, 14], [6, 14], [15, 18]] },
      { content: '- \n\t\n- B', expected: [[0, 4], [5, 8]] },
      { content: '- \n    \n- B', expected: [[0, 7], [8, 11]] },
      { content: '  - \n\t\n- B', expected: [[0, 6], [7, 10]] },
      { content: '- A\n  - \n    \n- B', expected: [[0, 3], [6, 13], [14, 17]] },
      { content: '- A\n  - \n      \n  - B', expected: [[0, 3], [6, 15], [18, 21]] },
      { content: '- A\n  - \n\t\n- B', expected: [[0, 3], [6, 8], [11, 14]] },
      { content: '- A\n  - \n    \n  - B', expected: [[0, 3], [6, 13], [16, 19]] },
      { content: '- A\n  - X\n\t\n- B', expected: [[0, 3], [6, 9], [12, 15]] },
      { content: '- A\n  - \n   \n- B', expected: [[0, 3], [6, 8], [13, 16]] },
      // A blank line inside a code fence is a line of the code when the item holds it.
      { content: '- A\n  ```\n\t\n* I', expected: [[0, 11], [12, 15]] },
      { content: '- A\n  ```\n  x\n  \n- B', expected: [[0, 16], [17, 20]] },
      { content: '- A\n  ```\n  x\n\n  y\n  ```\n- B', expected: [[0, 24], [25, 28]] }
    ])('should end each item of $content where Obsidian does', ({ content, expected }) => {
      const cache = parseMarkdownContent(content);

      expect(cache.listItems?.map((item) => [item.position.start.offset, item.position.end.offset])).toEqual(expected);
    });

    // Each row was measured on a real Obsidian 1.14.4 over CDP: every item's [start offset, end offset, parent]. A fenced
    // code block, a `%%` comment, a `$$` math block and an indented code block hide every item inside them, an unclosed one
    // runs to the end of its container, and which container that is depends on the quotes and items around it.
    it.each([
      { content: '%%\n- A', expected: [] },
      { content: '%%\n- A\n%%\n- B', expected: [[10, 13, -3]] },
      { content: 'text\n%%\n- A', expected: [] },
      { content: ' %%\n- A', expected: [] },
      { content: '    %%\n- A', expected: [[7, 10, -1]] },
      { content: '%% x %%\n- A', expected: [[8, 11, -1]] },
      { content: '- A\n%% x %%', expected: [[0, 11, -1]] },
      { content: '%%\nx %%\n- A', expected: [[8, 11, -2]] },
      { content: '- A\n  %%\n  - B\n- C', expected: [[0, 14, -1], [15, 18, -1]] },
      { content: '- A\n  %%\n  - B\n  %%\n  - C', expected: [[0, 19, -1], [22, 25, 0]] },
      { content: '> %%\n> - A\n- B', expected: [[11, 14, -2]] },
      { content: '> %%\n>\ntext\n> - B', expected: [] },
      { content: '```\n- A', expected: [] },
      { content: '  ```\n- A', expected: [] },
      { content: '    ```\n- A', expected: [[8, 11, -1]] },
      { content: '```\n- A\n````\n- B', expected: [[13, 16, -3]] },
      { content: '````\n- A\n```\n- B', expected: [] },
      { content: '``` x ` y\n- A', expected: [[10, 13, -1]] },
      { content: '~~~ x ` y\n- A\n~~~\n- B', expected: [[18, 21, -3]] },
      { content: '- A\n  ```\n  - B\n- C', expected: [[0, 15, -1], [16, 19, -1]] },
      { content: '- A\n  ```\nx\n  - B', expected: [[0, 17, -1]] },
      { content: '- A\n  ```\n\n- B', expected: [[0, 10, -1], [11, 14, -1]] },
      { content: '- A\n  ```\n  x\n\n- B', expected: [[0, 14, -1], [15, 18, -1]] },
      { content: '- A\n  ```\n  x\n\n', expected: [[0, 13, -1]] },
      { content: '- A\n  ```\n  x\n  \n', expected: [[0, 16, -1]] },
      { content: '> ```\n> - A\n- B', expected: [[12, 15, -2]] },
      { content: '> ```\nx\n> - B', expected: [] },
      { content: '- A\n> q\n> ```\n> - B', expected: [[0, 19, -1]] },
      { content: '- A\n  > ```\n  > - B\n- C', expected: [[0, 19, -1], [20, 23, -1]] },
      { content: 'text\n> ```\n> - B', expected: [] },
      { content: '> - A\n>   ```\n>\ntext\n> - B', expected: [[2, 13, -1], [23, 26, -4]] },
      { content: '$$\n- A', expected: [] },
      { content: '$$\n- A\n$$\n- B', expected: [[10, 13, -3]] },
      { content: '$$\n- A\nx $$\n- B', expected: [[12, 15, -3]] },
      { content: '$$\n- A\n$$ x\n- B', expected: [] },
      { content: '$$ x $$\n- A', expected: [[8, 11, -1]] },
      { content: 'text\n$$\n- A', expected: [] },
      { content: '- A\n$$\n- B', expected: [[0, 6, -1], [7, 10, -1]] },
      { content: '- A\n$$\n  1. G', expected: [[0, 13, -1]] },
      { content: '- A\n  $$\n  - B\n- C', expected: [[0, 14, -1], [15, 18, -1]] },
      { content: '> q\n$$\n>   - H', expected: [] },
      { content: '    - D', expected: [] },
      { content: '\t- D', expected: [] },
      { content: 'text\n    - D', expected: [] },
      { content: '- A\n      - D', expected: [[0, 13, -1]] },
      { content: '- A\n\n      - D\n- B', expected: [[0, 14, -1], [15, 18, -1]] },
      { content: '>     - D', expected: [] },
      { content: '    a\n    - D', expected: [] },
      { content: '    a\n\n    - D\n- E', expected: [[15, 18, -3]] },
      { content: '- A\n\n      a\n      - D\n  - E', expected: [[0, 22, -1], [25, 28, 0]] },
      { content: '-   A\n   - B\n    - C', expected: [[0, 5, -1], [6, 12, -1], [13, 20, -1]] },
      { content: '> - A\n    text', expected: [[2, 5, -1]] },
      { content: '> - A\n    text\n> - B', expected: [[2, 5, -1], [17, 20, -2]] },
      { content: '- A\n> - G\n    text', expected: [[0, 18, -1], [6, 18, -1]] },
      { content: '> > - A\n>     text\n> > - B', expected: [[4, 7, -1], [23, 26, -2]] },
      { content: '>> - A\n    text\n>> - B', expected: [[3, 6, -1], [19, 22, -2]] },
      { content: '- A\n> > - K\n> %%', expected: [[0, 16, -1], [8, 11, -1]] },
      // A math block ends on a line whose only `$` run is the one it ends with, at least as long as the opening one.
      { content: '$$\n$$ x $$\n1. E', expected: [] },
      { content: '$$\n$$ x $$\n$$\n- A', expected: [[14, 17, -3]] },
      { content: '$$$\n$$\n- A\n$$$\n- B', expected: [[15, 18, -4]] },
      // The note's last line opens no math block, so it continues the item lazily.
      { content: '> - K\n$$', expected: [[2, 8, -1]] },
      { content: '> - K\n$$\n', expected: [[2, 5, -1]] },
      // A line that ends a blockquote nested in an item stays in the item.
      { content: '- A\n>\n$$\n- B', expected: [[0, 8, -1], [9, 12, -1]] },
      { content: '- \n> > - K\n$$\n%% x %%', expected: [[0, 21, -1], [7, 10, -1]] },
      { content: '+ L\n> > - K\n$$\n  ~~~', expected: [[0, 20, -1], [8, 11, -1]] },
      // A `$$` opens a math block only when a line break follows it in the text its list item gathers, which leaves out
      // trailing empty lines, a line the item's strip leaves empty and a line that ends the item.
      { content: '  1. G\n$$\n  ', expected: [[0, 9, -1]] },
      { content: '  1. G\n>   - H\n$$\n  ~~~', expected: [[0, 17, -1], [9, 17, -1]] },
      { content: '+ L\n  - C\n$$\n\t', expected: [[0, 3, -1], [6, 12, 0]] },
      { content: '+ L\n  - C\n$$\n\t\t', expected: [[0, 3, -1], [6, 15, 0]] },
      { content: '- A\n$$\n\n- B', expected: [[0, 7, -1], [8, 11, -1]] },
      { content: '- A\n  $$\n- B', expected: [[0, 8, -1], [9, 12, -1]] },
      { content: '- A\n$$\n\nx', expected: [[0, 6, -1]] },
      { content: '- A\nx $$\n  - C\n  - C\n  $$\n  ', expected: [[0, 8, -1], [11, 14, 0], [17, 25, 0]] }
    ])('should find the items of $content that no block hides, as Obsidian does', ({ content, expected }) => {
      const cache = parseMarkdownContent(content);

      expect(cache.listItems?.map((item) => [item.position.start.offset, item.position.end.offset, item.parent]) ?? []).toEqual(expected);
    });

    // Each row was measured on a real Obsidian 1.14.4 over CDP: every item's [start offset, end offset, parent].
    it.each([
      // An item with nothing after its marker is a parent once it holds something besides one nested list.
      { content: '- \ntext\n  1. G', expected: [[0, 7, -1], [10, 14, 0]] },
      { content: '- \n  1. G\n  - C', expected: [[0, 15, -1], [5, 9, 0], [12, 15, 0]] },
      { content: '- \n%% x %%\n  - C', expected: [[0, 10, -1], [13, 16, 0]] },
      { content: '- \n> q\n  - C', expected: [[0, 6, -1], [9, 12, 0]] },
      { content: '- \n\n  text\n  - C', expected: [[0, 10, -1], [13, 16, 0]] },
      { content: '- A\n  - B\n  1. C', expected: [[0, 3, -1], [6, 9, 0], [12, 16, 0]] },
      { content: '- \n  - C\n\n  text', expected: [[0, 16, -1], [5, 8, -1]] },
      // Obsidian strips an item's later lines to their least indent, and at most to its marker's width, which is one
      // column wider for `1.` to `9.` followed by one space.
      { content: '1. A\n    - D', expected: [[0, 4, -1], [9, 12, 0]] },
      { content: '1. A\n    - D\n   - E', expected: [[0, 4, -1], [8, 12, 0], [16, 19, 0]] },
      { content: '1. A\n       - D', expected: [[0, 4, -1], [9, 15, 0]] },
      { content: '1. A\n   x\n       - M', expected: [[0, 20, -1]] },
      { content: '1.  A\n    - B', expected: [[0, 5, -1], [10, 13, 0]] },
      { content: '1) A\n    - B', expected: [[0, 4, -1], [8, 12, 0]] },
      { content: '10. A\n     - D', expected: [[0, 5, -1], [10, 14, 0]] },
      { content: '  1. A\n      - B', expected: [[0, 6, -1], [13, 16, 0]] },
      { content: '   - K\n text\n       - M', expected: [[0, 23, -1]] },
      // A later line counts too, so it can turn an earlier line into a paragraph continuation.
      { content: '1. A\n       - M\n   - K', expected: [[0, 15, -1], [19, 22, 0]] },
      { content: '9. C\n       - M\n text', expected: [[0, 21, -1]] },
      // Only a bullet or an ordered marker numbered 1 interrupts a paragraph.
      { content: 'text\n2. B', expected: [] },
      { content: 'text\n1. B', expected: [[5, 9, -1]] },
      { content: '- A\n  2. B', expected: [[0, 10, -1]] },
      { content: '> q\n> 2. B', expected: [] },
      // A marker of another kind indented too far to start an item ends the list and starts an indented code block.
      { content: '   - K\n    1. R', expected: [[0, 6, -1]] },
      { content: '   - K\n    1. R\n- C', expected: [[0, 6, -1], [16, 19, -2]] },
      { content: '   - K\n    - R', expected: [[0, 6, -1], [7, 14, -1]] },
      // A nested item of another kind after a blank line is no sibling, so the item before it keeps its last line.
      { content: '1. A\n   - K\n\n    1. R', expected: [[0, 4, -1], [8, 11, 0], [16, 21, 0]] },
      // A nested item's later lines are measured from where its parent's strip leaves them, not from its parent's content.
      { content: '9. C\n    1. R\n    text\n       - M', expected: [[0, 4, -1], [9, 22, 0], [30, 33, 1]] },
      // Inside a blockquote the later lines are read ahead past their quote prefixes too.
      { content: '> 9. C\n>        - M\n>    - K', expected: [[2, 19, -1], [25, 28, 0]] },
      { content: '> 1. A\n>     - D\n>    - E', expected: [[2, 6, -1], [12, 16, 0], [22, 25, 0]] }
    ])('should place the items of $content as Obsidian does', ({ content, expected }) => {
      const cache = parseMarkdownContent(content);

      expect(cache.listItems?.map((item) => [item.position.start.offset, item.position.end.offset, item.parent]) ?? []).toEqual(expected);
    });

    // Each row was measured on a real Obsidian 1.14.4 over CDP: every item's [start offset, end offset, parent], and every
    // section's [type, start offset, end offset]. A marker that ends its line opens an empty item.
    it.each([
      { content: '-\ntext', items: [[0, 6, -1]], sections: [['list', 0, 6]] },
      { content: '*\ntext', items: [[0, 6, -1]], sections: [['list', 0, 6]] },
      { content: '1.\ntext', items: [[0, 7, -1]], sections: [['list', 0, 7]] },
      { content: '-', items: [[0, 1, -1]], sections: [['list', 0, 1]] },
      { content: '1.', items: [[0, 2, -1]], sections: [['list', 0, 2]] },
      { content: 'a\n\n-\ntext', items: [[3, 9, -2]], sections: [['paragraph', 0, 1], ['list', 3, 9]] },
      { content: '-\n- b', items: [[0, 1, -1], [2, 5, -1]], sections: [['list', 0, 5]] },
      { content: '-\n-', items: [[0, 1, -1], [2, 3, -1]], sections: [['list', 0, 3]] },
      { content: '- a\n-\n- c', items: [[0, 3, -1], [4, 5, -1], [6, 9, -1]], sections: [['list', 0, 9]] },
      { content: '- a\n-', items: [[0, 3, -1], [4, 5, -1]], sections: [['list', 0, 5]] },
      { content: '> -\n> text', items: [[2, 10, -1]], sections: [['blockquote', 0, 10]] },
      { content: '---\na: 1\n----\ntext', items: [[12, 18, -2]], sections: [['yaml', 0, 12], ['list', 12, 18]] },
      // It interrupts a paragraph as an item with text does: a bullet, or an ordered marker numbered 1.
      { content: 'a\n*\nb', items: [[2, 5, -1]], sections: [['paragraph', 0, 1], ['list', 2, 5]] },
      { content: 'a\n1.\nb', items: [[2, 6, -1]], sections: [['paragraph', 0, 1], ['list', 2, 6]] },
      { content: 'a\n2.\nb', items: [], sections: [['paragraph', 0, 6]] },
      // Its content starts right past the marker, with no column for the space it lacks.
      { content: '-\n - b', items: [[0, 6, -1], [3, 6, -1]], sections: [['list', 0, 6]] },
      { content: '-\n  - b\n  - c', items: [[0, 13, -1], [3, 7, -1], [9, 13, -1]], sections: [['list', 0, 13]] },
      { content: '2.\n  - C', items: [[0, 8, -1], [5, 8, -1]], sections: [['list', 0, 8]] },
      { content: '10.\n  - b', items: [[0, 3, -1], [4, 9, -1]], sections: [['list', 0, 3], ['list', 4, 9]] },
      // A lone `-` under one line of text, at no indent, is a setext underline instead, even under a line that would open
      // a link reference definition or an HTML block, and under a line that leaves a blockquote.
      { content: 'a\n-', items: [], sections: [['heading', 0, 3]] },
      { content: 'a\n- ', items: [[2, 4, -1]], sections: [['paragraph', 0, 1], ['list', 2, 4]] },
      { content: '- a\n  -', items: [[0, 7, -1]], sections: [['list', 0, 7]] },
      { content: '> a\n> -', items: [], sections: [['blockquote', 0, 7]] },
      { content: '[x]: /u\n-', items: [], sections: [['heading', 0, 9]] },
      { content: '<div>\n-\n- a', items: [[8, 11, -2]], sections: [['heading', 0, 7], ['list', 8, 11]] },
      { content: '> a\nb\n-', items: [], sections: [['blockquote', 0, 3], ['heading', 4, 7]] },
      { content: '- a\n--\nb\n  -', items: [[0, 12, -1]], sections: [['list', 0, 12]] },
      { content: '- a\n  # h\nc\n  -', items: [[0, 15, -1]], sections: [['list', 0, 15]] },
      // A marker-like run that starts no item counts as indent when the list decides whether the line stays in the item.
      { content: '-\n\n-x', items: [[0, 5, -1]], sections: [['list', 0, 5]] },
      { content: '- a\n\n1.x', items: [[0, 8, -1]], sections: [['list', 0, 8]] },
      { content: '-\n---', items: [[0, 5, -1]], sections: [['list', 0, 5]] },
      { content: '1.\n\n -x', items: [[0, 7, -1]], sections: [['list', 0, 7]] },
      { content: '10.\n\n9.x', items: [[0, 3, -1]], sections: [['list', 0, 3], ['paragraph', 5, 8]] },
      // The text after a comment's closing `%%` starts a paragraph, which `2.` cannot interrupt.
      { content: '  %% x\n  %% x\n2.', items: [], sections: [['comment', 0, 11], ['paragraph', 11, 16]] }
    ])('should read the bare list markers of $content as Obsidian does', ({ content, items, sections }) => {
      const cache = parseMarkdownContent(content);

      expect(cache.listItems?.map((item) => [item.position.start.offset, item.position.end.offset, item.parent]) ?? []).toEqual(items);
      expect(cache.sections?.map((section) => [section.type, section.position.start.offset, section.position.end.offset])).toEqual(sections);
    });

    // Each row was measured on a real Obsidian 1.14.4 over CDP: every item's [start offset, end offset, parent], and every
    // section's [type, start offset, end offset].
    it.each([
      // A backtick fence whose info string holds a backtick is no fence, so it continues the item above lazily.
      { content: '- a\n``` a`b\nx', items: [[0, 13, -1]], sections: [['list', 0, 13]] },
      { content: '?>\n* * *x\n``` a`b\n```\n   para\n  \n', items: [[3, 17, -1], [5, 17, -1]], sections: [['paragraph', 0, 2], ['list', 3, 17], ['code', 18, 33]] },
      { content: '- a\n```js\nx\n```', items: [[0, 3, -1]], sections: [['list', 0, 3], ['code', 4, 15]] },
      // An HTML block of the sixth or seventh kind ends only before a line its containers strip to nothing, so a line of
      // whitespace they leave something of is one of its lines.
      { content: '<div>\n  \n- a', items: [], sections: [['html', 0, 12]] },
      { content: '<div>\n\t\n- a', items: [], sections: [['html', 0, 11]] },
      { content: '<div>\n\n- a', items: [[7, 10, -2]], sections: [['html', 0, 5], ['list', 7, 10]] },
      { content: '<a href="x">\n  \n- a', items: [], sections: [['html', 0, 19]] },
      { content: '   para\n</div>\n\tcode\n\t\t\n* * *x\n#', items: [], sections: [['paragraph', 0, 7], ['html', 8, 32]] },
      { content: '- <div>\n   \n  - b', items: [[0, 17, -1]], sections: [['list', 0, 17]] },
      { content: '- <div>\n \n  - b', items: [[0, 7, -1], [12, 15, 0]], sections: [['list', 0, 15]] },
      { content: '> <div>\n> \n> - b', items: [[13, 16, -2]], sections: [['blockquote', 0, 16]] },
      { content: '> <div>\n>  \n> - b', items: [], sections: [['blockquote', 0, 17]] },
      { content: '- a\n> <div>\n> \n> - b', items: [[0, 20, -1], [17, 20, -3]], sections: [['list', 0, 20]] },
      { content: '- a\n> <div>\n>  \n> - b', items: [[0, 21, -1]], sections: [['list', 0, 21]] },
      // A tab after a list marker starts an item, and the item's content starts at the tab's stop, while a tab after a
      // space is content.
      { content: '-\tx', items: [[0, 3, -1]], sections: [['list', 0, 3]] },
      { content: '-\t', items: [[0, 2, -1]], sections: [['list', 0, 2]] },
      { content: '- a\n-\tb', items: [[0, 3, -1], [4, 7, -1]], sections: [['list', 0, 7]] },
      { content: '1. q\n2.\ty', items: [[0, 4, -1], [5, 9, -1]], sections: [['list', 0, 9]] },
      { content: '-\tx\n  - y', items: [[0, 3, -1], [4, 9, -1]], sections: [['list', 0, 9]] },
      { content: '-\tx\n\t- y', items: [[0, 3, -1], [5, 8, 0]], sections: [['list', 0, 8]] },
      { content: '-\tx\n    y', items: [[0, 9, -1]], sections: [['list', 0, 9]] },
      { content: '1.\tx\n\t- y', items: [[0, 4, -1], [6, 9, 0]], sections: [['list', 0, 9]] },
      { content: '- \tx\n  - y', items: [[0, 4, -1], [7, 10, 0]], sections: [['list', 0, 10]] },
      { content: '-    \tv\n    - y', items: [[0, 7, -1], [8, 15, -1]], sections: [['list', 0, 15]] },
      { content: '-\t[ ] x', items: [[0, 7, -1]], sections: [['list', 0, 7]] },
      // A line leaving a blockquote that a list item holds is measured once the item has stripped it.
      { content: '-    v\n> > - K\n    text', items: [[0, 23, -1], [11, 23, -1]], sections: [['list', 0, 23]] },
      { content: '-    v\n> - K\n    text', items: [[0, 21, -1], [9, 21, -1]], sections: [['list', 0, 21]] },
      { content: '-    \tv\n> > - K\n    text', items: [[0, 24, -1], [12, 24, -1]], sections: [['list', 0, 24]] }
    ])('should read the blocks of $content as Obsidian does', ({ content, items, sections }) => {
      const cache = parseMarkdownContent(content);

      expect(cache.listItems?.map((item) => [item.position.start.offset, item.position.end.offset, item.parent]) ?? []).toEqual(items);
      expect(cache.sections?.map((section) => [section.type, section.position.start.offset, section.position.end.offset])).toEqual(sections);
    });
    it('should give every item of a large flat list the root parent', () => {
      const content = `Text\n\n${Array.from({ length: FLAT_LIST_ITEM_COUNT }, (_, index) => `- [ ] item ${String(index)}`).join('\n')}`;
      const cache = parseMarkdownContent(content);

      expect(cache.listItems).toHaveLength(FLAT_LIST_ITEM_COUNT);
      expect(cache.listItems?.every((item) => item.parent === ROOT_PARENT_LINE)).toBe(true);
      expect(cache.sections?.filter((section) => section.type === 'list')).toHaveLength(1);
    });
  });

  describe('sections', () => {
    it('should create paragraph sections', () => {
      const content = 'Some paragraph text';
      const cache = parseMarkdownContent(content);

      expect(cache.sections).toBeDefined();
      const paragraphs = cache.sections?.filter((s) => s.type === 'paragraph');
      expect(paragraphs?.length).toBeGreaterThan(0);
    });

    it('should create heading sections', () => {
      const content = '# Heading\n\nParagraph';
      const cache = parseMarkdownContent(content);

      const headingSections = cache.sections?.filter((s) => s.type === 'heading');
      expect(headingSections).toHaveLength(1);
    });

    it('should create list sections', () => {
      const content = '- Item 1\n- Item 2';
      const cache = parseMarkdownContent(content);

      const listSections = cache.sections?.filter((s) => s.type === 'list');
      expect(listSections).toHaveLength(1);
    });

    // Each row was measured on a real Obsidian 1.14.4 over CDP: every section's [type, start offset, end offset]. A list
    // ends at the end of the last line it holds, trailing whitespace and a whitespace-only line indented to its root
    // item's content included. A tab-led whitespace-only line continues a paragraph, and an indented code block's last
    // line holding only its indent belongs to it only when a line break follows.
    it.each([
      { content: '- A\n  ', expected: [['list', 0, 6]] },
      { content: '- A\n\t', expected: [['list', 0, 5]] },
      { content: '- A\nx  ', expected: [['list', 0, 7]] },
      { content: '- A\n  - B\n  ', expected: [['list', 0, 12]] },
      { content: '- A\n\n  x  \n  ', expected: [['list', 0, 13]] },
      { content: '- A\n  ```\n  ', expected: [['list', 0, 12]] },
      { content: '1. A\n   ', expected: [['list', 0, 8]] },
      { content: '+ L\n  - C\n$$\n\t', expected: [['list', 0, 14]] },
      { content: ' text\n\t\n9. C', expected: [['paragraph', 0, 12]] },
      { content: '       - M\n\t', expected: [['code', 0, 10]] },
      { content: '    code\n\t\n', expected: [['code', 0, 10]] },
      { content: '    code\n     ', expected: [['code', 0, 14]] }
    ])('should end each section of $content where Obsidian does', ({ content, expected }) => {
      const cache = parseMarkdownContent(content);

      expect(cache.sections?.map((section) => [section.type, section.position.start.offset, section.position.end.offset])).toEqual(expected);
    });

    it('should create blockquote sections', () => {
      const content = '> This is a blockquote';
      const cache = parseMarkdownContent(content);

      const blockquoteSections = cache.sections?.filter((s) => s.type === 'blockquote');
      expect(blockquoteSections?.length).toBeGreaterThan(0);
    });

    // Measured on a real Obsidian 1.14.4 over CDP: a blockquote whose first line opens with a callout header is typed
    // `callout`, and every near miss stays `blockquote`.
    it.each([
      ['a callout holding a list', '> [!note]\n> - A\n> - B\n', [['callout', 0, 21]]],
      ['a folded callout with a title', '> [!tip]- Fold\n> 1. A\n>    - B\n> 2. C\n', [['callout', 0, 37]]],
      ['a lowercase type with a lazy line', '> [!note]\ntext\n', [['callout', 0, 14]]],
      ['an uppercase type', '> [!NOTE]\ntext\n', [['callout', 0, 14]]],
      ['an expanded fold sign', '> [!note]+\n> body\n', [['callout', 0, 17]]],
      ['no space after the `>`', '>[!note]\n>body\n', [['callout', 0, 14]]],
      ['two callouts', '> [!note]\n\n> [!tip]\n', [['callout', 0, 9], ['callout', 11, 19]]],
      ['a callout, then a plain blockquote', '> [!note]\nlazy\n\n> plain\n', [['callout', 0, 14], ['blockquote', 16, 23]]],
      ['a callout nested in a blockquote', '> > [!note]\n> > body\n', [['blockquote', 0, 20]]],
      ['two spaces after the `>`', '>  [!note]\n> body\n', [['blockquote', 0, 17]]],
      ['a tab after the `>`', '>\t[!note]\n', [['blockquote', 0, 9]]],
      ['a header on a later line', '> text\n> [!note]\n> body\n', [['blockquote', 0, 23]]],
      ['an empty type', '> [!]\n> body\n', [['blockquote', 0, 12]]],
      ['text right after the header', '> [!note]x\n', [['blockquote', 0, 10]]]
    ])('should type %s as Obsidian does', (_name, content, expected) => {
      const cache = parseMarkdownContent(content);

      expect(cache.sections?.map((s) => [s.type, s.position.start.offset, s.position.end.offset])).toEqual(expected);
    });

    // Measured with Obsidian 1.14.4's own metadata worker, which is remark-parse 8 with Obsidian's comment and math
    // tokenizers: the blocks between the sections found earlier, each starting at its line start, indent included.
    it.each([
      ['an indented callout, whose indent the section starts at', '   > [!note]\n> body\n', [['callout', 0, 19]]],
      ['a callout indented four spaces, which is indented code', '    > [!note]\n', [['code', 0, 13]]],
      ['a callout interrupting a paragraph', 'para\n> [!note]\n', [['paragraph', 0, 4], ['callout', 5, 14]]],
      ['an indented paragraph', '  para\n  more\n', [['paragraph', 0, 13]]],
      ['a line indented four spaces', '    code\n', [['code', 0, 8]]],
      ['a line opening with a tab', '\tcode\n', [['code', 0, 5]]],
      ['a tab after a space, which indents nothing', ' \tcode\n', [['paragraph', 0, 6]]],
      ['indented code across a blank line', '    code\n\n    more\n', [['code', 0, 18]]],
      ['indented code and a whitespace line indented as far', '    a\n    \nb\n', [['code', 0, 10], ['paragraph', 11, 12]]],
      ['indented code, then a less indented paragraph', '    code\n  para\n', [['code', 0, 8], ['paragraph', 9, 15]]],
      ['a line indented four spaces inside a paragraph', 'para\n    not code\n', [['paragraph', 0, 17]]],
      ['a tab-indented line inside a paragraph', 'para\n\tmore\n', [['paragraph', 0, 10]]],
      ['a paragraph ending in an indent-only line', 'para\n    ', [['paragraph', 0, 9]]],
      ['a whitespace line after indented code at the end', '    a\n  ', [['code', 0, 5]]],
      ['an empty line after a blockquote', '> q\n\n', [['blockquote', 0, 3]]],
      ['indented code after a blank line', 'para\n\n    code\n', [['paragraph', 0, 4], ['code', 6, 14]]],
      ['a fence interrupting a paragraph', 'para\n```\nx\n```\n', [['paragraph', 0, 4], ['code', 5, 14]]],
      ['an unclosed fence, which runs to the end', 'a\n```\nb', [['paragraph', 0, 1], ['code', 2, 7]]],
      ['a fence indented four spaces', '    ```\nx\n```\n', [['code', 0, 7], ['paragraph', 8, 9], ['code', 10, 14]]],
      ['a fence line indented four spaces, which closes nothing', '```\n    ```\n```\n', [['code', 0, 15]]],
      ['a tilde fence holding a backtick fence', '~~~\nx\n```\n~~~\n', [['code', 0, 13]]],
      ['a backtick in a backtick fence\'s info', '``` a`b\nx\n', [['paragraph', 0, 9]]],
      ['a thematic break interrupting a paragraph', 'para\n***\n', [['paragraph', 0, 4], ['thematicBreak', 5, 8]]],
      ['a thematic break with spaces', 'x\n  _ _ _\n', [['paragraph', 0, 1], ['thematicBreak', 2, 9]]],
      ['a thematic break indented four spaces', '    ---\n', [['code', 0, 7]]],
      ['a blockquote interrupting a paragraph', 'para\n> q\n', [['paragraph', 0, 4], ['blockquote', 5, 8]]],
      ['a lazy line of a blockquote', '> q\n> r\nlazy\n', [['blockquote', 0, 12]]],
      ['a blockquote ended by indented code', '> q\n    code\n', [['blockquote', 0, 3], ['code', 4, 12]]],
      ['a blockquote ended by a fence', '> q\n```\nx\n```\n', [['blockquote', 0, 3], ['code', 4, 13]]],
      ['a blockquote ended by a thematic break', '> q\n  ***\n', [['blockquote', 0, 3], ['thematicBreak', 4, 9]]],
      ['a blockquote ended by a math block', '> q\n$$\nx\n$$\n', [['blockquote', 0, 3], ['math', 4, 11]]],
      ['a blockquote ended by a comment', '> q\n%%\nx\n%%\n', [['blockquote', 0, 3], ['comment', 4, 11]]],
      ['a blockquote ended by an HTML block', '> q\n<!-- c -->\n', [['blockquote', 0, 3], ['html', 4, 14]]],
      ['a blockquote continued by an inline tag', '> q\n<span>\n', [['blockquote', 0, 10]]],
      ['a blockquote ended by a setext heading', '> q\nfoo\n---\n', [['blockquote', 0, 3], ['heading', 4, 11]]],
      ['a blockquote ended by an ATX heading', '> q\n  # x\n', [['blockquote', 0, 3], ['heading', 4, 9]]],
      ['a lazy line of an open fence in a blockquote', '> ```\n> x\nlazy\n', [['blockquote', 0, 14]]],
      ['a comment', '%%\nx\n%%\n', [['comment', 0, 7]]],
      ['a comment interrupting a paragraph', 'para\n%%\nx\n%%\n', [['paragraph', 0, 4], ['comment', 5, 12]]],
      ['an unclosed comment', '%%\nx\n', [['comment', 0, 5]]],
      ['a comment closed mid-line', '%%\nx\n%% after\nmore\n\nnext\n', [['comment', 0, 7], ['paragraph', 7, 18], ['paragraph', 20, 24]]],
      ['a comment closed on its own line', '%% a %%\n', [['paragraph', 0, 7]]],
      ['a second percent sign on the opening line', '%%x%y\nz\n', [['paragraph', 0, 7]]],
      ['a comment opener with nothing after it', '%%', [['comment', 0, 2]]],
      ['a math block', '$$\nx\n$$\n', [['math', 0, 7]]],
      ['a math block interrupting a paragraph', 'para\n$$x\n', [['paragraph', 0, 4], ['math', 5, 9]]],
      ['a math block closed on its own line', 'para\n$$ x $$\n', [['paragraph', 0, 12]]],
      ['an unclosed math block', '$$\nx\n$$ after\n', [['math', 0, 14]]],
      ['a math block closed after text', '$$\nx\nafter $$  \nnext\n', [['math', 0, 15], ['paragraph', 16, 20]]],
      ['a math closer holding another dollar sign', '$$\na $ b $$\nc\n', [['math', 0, 14]]],
      ['three dollar signs', '$$$\nx\n$$$\n', [['math', 0, 9]]],
      ['a math opener at the very end', '$$', [['paragraph', 0, 2]]],
      ['a math block whose second line is empty', '$$\n\n$$\nx\n', [['math', 0, 6], ['paragraph', 7, 8]]],
      ['an HTML block', '<div>\nx\n\ny\n', [['html', 0, 7], ['paragraph', 9, 10]]],
      ['an HTML block interrupting a paragraph', 'para\n<div>\n', [['paragraph', 0, 4], ['html', 5, 10]]],
      ['an inline tag after a paragraph', 'para\n<span>\n', [['paragraph', 0, 11]]],
      ['an inline tag alone', '<a href="x">\n', [['html', 0, 12]]],
      ['an inline tag followed by text', '<a href="x"> text\n', [['paragraph', 0, 17]]],
      ['an HTML comment across a blank line', '<!-- c\n\nd -->\n', [['html', 0, 13]]],
      ['an unclosed HTML comment', '<!-- open\nx\n', [['html', 0, 12]]],
      ['an HTML comment closed on its first line', '<!-- a -->b\nc\n\nd\n', [['html', 0, 11], ['paragraph', 12, 13], ['paragraph', 15, 16]]],
      ['a script block', 'para\n<script>\nx\n</script>\n', [['paragraph', 0, 4], ['html', 5, 25]]],
      ['a processing instruction', '<?php\nx ?>\ny\n', [['html', 0, 10], ['paragraph', 11, 12]]],
      ['a declaration', '<!DOCTYPE html>\nx\n', [['html', 0, 15], ['paragraph', 16, 17]]],
      ['a CDATA section', '<![CDATA[\nx\n]]>\n', [['html', 0, 15]]],
      ['an HTML block line of only whitespace', '<div>\n  \nx\n', [['html', 0, 10]]],
      ['an indented HTML block', '  <div>\n', [['html', 0, 7]]],
      ['a table', '| a | b |\n| - | - |\n| 1 | 2 |\n', [['table', 0, 29]]],
      ['a table without outer pipes', 'a | b\n:- | -:\n1 | 2\n\npara\n', [['table', 0, 19], ['paragraph', 21, 25]]],
      ['a table ended by a row starting with a pipe', 'a|b\n-|-\n|x|y|\n', [['table', 0, 7], ['paragraph', 8, 13]]],
      ['a table ended by a row without a leading pipe', '|a|b|\n|-|-|\nx|y\n', [['table', 0, 11], ['paragraph', 12, 15]]],
      ['a table ended by a line without a pipe', '| a | b |\n| - | - |\n| 1 | 2 |\npara\n', [['table', 0, 29], ['paragraph', 30, 34]]],
      ['a table row whose only pipe comes first', '|a|\n|-|\n|x\n', [['table', 0, 7], ['paragraph', 8, 10]]],
      ['a table with alignment', 'a|b\n:-|-:\n', [['table', 0, 9]]],
      ['a delimiter row with a stray character', 'a|b\n-|x\n', [['paragraph', 0, 7]]],
      ['a delimiter row of only a pipe', 'a|b\n|\n', [['paragraph', 0, 5]]],
      ['a delimiter row with an empty cell', 'a|b\n-||-\n', [['paragraph', 0, 8]]],
      ['a delimiter row with a colon cell', 'a|b\n:|:\n', [['table', 0, 7]]],
      ['a header with no delimiter row', 'a|b\n', [['paragraph', 0, 3]]],
      ['a table after a paragraph', 'para\n| a | b |\n| - | - |\n', [['paragraph', 0, 24]]],
      ['a setext heading', 'a\n===\n', [['heading', 0, 5]]],
      ['a setext heading over two lines of text', 'a\nb\n---\n', [['paragraph', 0, 3], ['thematicBreak', 4, 7]]],
      ['an indented setext underline', '  a\n  ---\n', [['paragraph', 0, 3], ['thematicBreak', 4, 9]]],
      ['a setext underline with trailing spaces', 'a\n===  \n', [['paragraph', 0, 7]]],
      ['an empty ATX heading', 'x\n#\n', [['paragraph', 0, 1], ['heading', 2, 3]]],
      ['an indented ATX heading', 'para\n  # x\n', [['paragraph', 0, 4], ['heading', 5, 10]]],
      ['a hash run with no space after it', '#x\n', [['paragraph', 0, 2]]],
      ['seven hashes', '####### x\n', [['paragraph', 0, 9]]],
      ['a trailing whitespace-only line', 'a\n   ', [['paragraph', 0, 5]]],
      ['paragraphs separated by blank lines', 'para\n\n\n   para2\n', [['paragraph', 0, 4], ['paragraph', 7, 15]]]
    ])('should read %s as Obsidian does', (_name, content, expected) => {
      const cache = parseMarkdownContent(content);

      expect(cache.sections?.map((s) => [s.type, s.position.start.offset, s.position.end.offset])).toEqual(expected);
    });

    // Measured the same way: a heading the gap scan finds is a heading in the cache too, in document order.
    it.each([
      ['a setext heading before an ATX one', 'a\n===\n# B\n', [['a', 1, 0, 5], ['B', 1, 6, 9]]],
      ['an empty ATX heading after a paragraph', '# B\nx\n#\n', [['B', 1, 0, 3], ['', 1, 6, 7]]],
      ['an empty ATX heading before a paragraph', '#\nText\n', [['', 1, 0, 1]]],
      ['a closing sequence', '# A #\n', [['A', 1, 0, 5]]],
      ['a setext heading whose text opens with whitespace', ' \tx\n===\n', [['x', 1, 0, 7]]],
      ['hashes inside the text', '## A ## b\n', [['A ## b', 2, 0, 9]]],
      ['a hash glued to a word', '# a#b\n', [['a#b', 1, 0, 5]]],
      ['only whitespace after the hashes', '#  \n', [['', 1, 0, 3]]]
    ])('should read the headings of %s as Obsidian does', (_name, content, expected) => {
      const cache = parseMarkdownContent(content);

      expect(cache.headings?.map((h) => [h.heading, h.level, h.position.start.offset, h.position.end.offset])).toEqual(expected);
    });

    // Measured with Obsidian 1.14.4's own metadata worker: a heading comes from block context, so a heading line inside
    // an unclosed fence, comment, math block or HTML block is a line of that block, and no heading at all.
    it.each([
      ['a heading line in an unclosed HTML comment', '<!-- c\n# H\n', [['html', 0, 11]], undefined],
      ['a heading line in an unclosed comment', '%% end\n# H\n', [['comment', 0, 11]], undefined],
      ['a heading line in an unclosed fence', '```\n# H\n', [['code', 0, 8]], undefined],
      ['a heading line in an unclosed math block', '$$\n# H\n', [['math', 0, 7]], undefined],
      ['a heading line in an HTML block before an empty line', '<div>\n# H\n\n# I\n', [['html', 0, 9], ['heading', 11, 14]], [['I', 1, 11, 14]]],
      ['a heading line in a closing-tag HTML block', '</script>\n## a b\n', [['html', 0, 16]], undefined],
      ['a heading after a closed fence', '```\nx\n```\n# H\n', [['code', 0, 9], ['heading', 10, 13]], [['H', 1, 10, 13]]],
      ['a heading line in a comment after a paragraph', 'para\n%%\n# H\n%%\n# I\n', [['paragraph', 0, 4], ['comment', 5, 14], ['heading', 15, 18]], [['I', 1, 15, 18]]]
    ])('should hide the heading lines of %s as Obsidian does', (_name, content, expectedSections, expectedHeadings) => {
      const cache = parseMarkdownContent(content);

      expect(cache.sections?.map((s) => [s.type, s.position.start.offset, s.position.end.offset])).toEqual(expectedSections);
      expect(cache.headings?.map((h) => [h.heading, h.level, h.position.start.offset, h.position.end.offset])).toEqual(expectedHeadings);
    });

    // Measured the same way: link reference definitions, footnote definitions and block ids, with every section's id,
    // every list item's id and the `blocks` collection, keyed by the lower-cased id.
    it.each([
      ['a link reference definition', '[a]: http://x "t"\n', [['definition', 0, 17, undefined]], undefined, undefined],
      ['a definition whose destination is on the next line', '[a]:\n  /url\n', [['definition', 0, 11, undefined]], undefined, undefined],
      ['a definition whose title is on the next line', '[a]: /u\n"title"\n', [['definition', 0, 15, undefined]], undefined, undefined],
      ['a definition whose title never closes', '[a]: /u\n"title\n', [['paragraph', 0, 14, undefined]], undefined, undefined],
      ['a definition with text after its title', '[a]: /u "t" x\n', [['paragraph', 0, 13, undefined]], undefined, undefined],
      ['a definition with an angle-bracket destination', '[a]: <u v>\n', [['definition', 0, 10, undefined]], undefined, undefined],
      ['a definition with an unclosed angle bracket', '[a]: <u\n', [['paragraph', 0, 7, undefined]], undefined, undefined],
      ['a definition after a paragraph', 'para\n[a]: /u\n', [['paragraph', 0, 12, undefined]], undefined, undefined],
      ['an indented definition', '   [a]: /u\n', [['definition', 0, 10, undefined]], undefined, undefined],
      ['a definition with an empty label', '[]: /u\n', [['paragraph', 0, 6, undefined]], undefined, undefined],
      ['a definition across an empty line', '[a]:\n\n/u\n', [['definition', 0, 8, undefined]], undefined, undefined],
      ['a space before the colon', '[a] : /u\n', [['paragraph', 0, 8, undefined]], undefined, undefined],
      ['a definition and a paragraph', '[a]: /u\npara\n', [['definition', 0, 7, undefined], ['paragraph', 8, 12, undefined]], undefined, undefined],
      ['two definitions', '[a]: /u\n[b]: /v\n', [['definition', 0, 7, undefined], ['definition', 8, 15, undefined]], undefined, undefined],
      ['a definition whose destination looks like a fence', '[c]:\n```\n- a\n', [['definition', 0, 8, undefined], ['list', 9, 12, undefined]], [[9, undefined]], undefined],
      ['a footnote definition with an indented line', '[^1]: n\n    more\n', [['footnoteDefinition', 0, 16, undefined]], undefined, undefined],
      ['a footnote definition with a lazy line', '[^1]: n\nlazy\n', [['footnoteDefinition', 0, 12, undefined]], undefined, undefined],
      ['a footnote definition before an empty line', '[^1]: n\n\nlazy\n', [['footnoteDefinition', 0, 7, undefined], ['paragraph', 9, 13, undefined]], undefined, undefined],
      ['a footnote definition across an empty line', '[^1]: n\n\n    more\n', [['footnoteDefinition', 0, 17, undefined]], undefined, undefined],
      ['a footnote definition ended by a list', '[^1]: n\n- a\n', [['footnoteDefinition', 0, 7, undefined], ['list', 8, 11, undefined]], [[8, undefined]], undefined],
      ['a footnote definition ended by a heading', '[^1]: n\n# h\n', [['footnoteDefinition', 0, 7, undefined], ['heading', 8, 11, undefined]], undefined, undefined],
      ['a footnote definition ended by a setext heading', '[^1]: n\nfoo\n===\n', [['footnoteDefinition', 0, 7, undefined], ['heading', 8, 15, undefined]], undefined, undefined],
      ['two footnote definitions', '[^1]: n\n[^2]: m\n', [['footnoteDefinition', 0, 7, undefined], ['footnoteDefinition', 8, 15, undefined]], undefined, undefined],
      ['a footnote definition ended by a definition', '[^1]: n\n[a]: /u\n', [['footnoteDefinition', 0, 7, undefined], ['definition', 8, 15, undefined]], undefined, undefined],
      ['an empty footnote definition', '[^1]:\n', [['footnoteDefinition', 0, 5, undefined]], undefined, undefined],
      ['an empty footnote definition and a lazy line', '[^1]:\nlazy\n', [['footnoteDefinition', 0, 5, undefined], ['paragraph', 6, 10, undefined]], undefined, undefined],
      ['a footnote label with a space', '[^ 1]: n\n', [['paragraph', 0, 8, undefined]], undefined, undefined],
      ['a footnote definition after a paragraph', 'para\n[^1]: n\n', [['paragraph', 0, 12, undefined]], undefined, undefined],
      ['trailing empty lines after a footnote definition', '[^1]: n\n\n\n', [['footnoteDefinition', 0, 7, undefined]], undefined, undefined],
      ['an id ending a paragraph', 'para ^abc\n', [['paragraph', 0, 9, 'abc']], undefined, [['abc', 'abc', 0, 9]]],
      ['an id on a paragraph\'s last line', 'para\n^abc\n', [['paragraph', 0, 9, 'abc']], undefined, [['abc', 'abc', 0, 9]]],
      ['an id with trailing whitespace', 'para ^abc  \n', [['paragraph', 0, 11, undefined]], undefined, undefined],
      ['an id holding an underscore', 'para ^a_b\n', [['paragraph', 0, 9, undefined]], undefined, undefined],
      ['an id glued to a word', 'para^abc\n', [['paragraph', 0, 8, undefined]], undefined, undefined],
      ['an id mid-paragraph', 'a ^x\nb\n', [['paragraph', 0, 6, undefined]], undefined, undefined],
      ['an id in an indented paragraph', '   para ^x\n', [['paragraph', 0, 10, 'x']], undefined, [['x', 'x', 0, 10]]],
      ['an id after a tab', 'p\t^ab\n', [['paragraph', 0, 5, 'ab']], undefined, [['ab', 'ab', 0, 5]]],
      ['two ids on a line', 'p ^x ^y\n', [['paragraph', 0, 7, 'y']], undefined, [['y', 'y', 0, 7]]],
      ['an id after emphasis', 'p *e* ^x\n', [['paragraph', 0, 8, 'x']], undefined, [['x', 'x', 0, 8]]],
      ['an escaped caret', 'p \\^x\n', [['paragraph', 0, 5, undefined]], undefined, undefined],
      ['an upper-case id', 'p ^A\n', [['paragraph', 0, 4, 'A']], undefined, [['a', 'A', 0, 4]]],
      ['a standalone id after a paragraph', 'para\n\n^abc\n', [['paragraph', 0, 4, 'abc']], undefined, [['abc', 'abc', 0, 4]]],
      ['a standalone id alone', '^abc\n', undefined, undefined, undefined],
      ['a standalone id with no line break', '^abc', undefined, undefined, undefined],
      ['an id opening a paragraph a list interrupts', '^abc\n- a\n', [['paragraph', 0, 4, 'abc'], ['list', 5, 8, undefined]], [[5, undefined]], [['abc', 'abc', 0, 4]]],
      ['a standalone id before a list', '^abc\n\n- a\n', [['list', 6, 9, undefined]], [[6, undefined]], undefined],
      ['two ids on two lines', '^a\n^b\n', [['paragraph', 0, 5, 'b']], undefined, [['b', 'b', 0, 5]]],
      ['two standalone ids after a paragraph', 'p\n\n^a\n\n^b\n', [['paragraph', 0, 1, 'b']], undefined, [['b', 'b', 0, 1]]],
      ['a standalone id overriding an inline one', 'p ^x\n\n^y\n', [['paragraph', 0, 4, 'y']], undefined, [['y', 'y', 0, 4]]],
      ['a standalone id after a list', '- a\n\n^x\n', [['list', 0, 3, 'x']], [[0, undefined]], [['x', 'x', 0, 3]]],
      ['a standalone id after code', '```\nx\n```\n^c\n', [['code', 0, 9, 'c']], undefined, [['c', 'c', 0, 9]]],
      ['a standalone id after a heading', '# H\n^h\n', [['heading', 0, 3, 'h']], undefined, [['h', 'h', 0, 3]]],
      ['a standalone id after frontmatter', '---\na: 1\n---\n^y\n', [['yaml', 0, 12, 'y']], undefined, [['y', 'y', 0, 12]]],
      ['a standalone id after a definition', '[a]: /u\n^d\n', [['definition', 0, 7, 'd']], undefined, [['d', 'd', 0, 7]]],
      ['an id in a heading', '# H ^id\n', [['heading', 0, 7, 'id']], undefined, [['id', 'id', 0, 7]]],
      ['an id in a blockquote', '> q\n> ^q1\n', [['blockquote', 0, 9, 'q1']], undefined, [['q1', 'q1', 0, 9]]],
      ['ids in two paragraphs of a blockquote', '> a ^x\n>\n> b ^y\n', [['blockquote', 0, 15, 'y']], undefined, [['y', 'y', 0, 15]]],
      ['an id in a quoted list', '> - a ^x\n', [['blockquote', 0, 8, 'x']], [[2, undefined]], [['x', 'x', 0, 8]]],
      ['an id in a table cell', '| a | b |\n| - | - |\n| c | d ^t |\n', [['table', 0, 32, 't']], undefined, [['t', 't', 0, 32]]],
      ['an id in a footnote definition', '[^1]: n ^id\n', [['footnoteDefinition', 0, 11, 'id']], undefined, [['id', 'id', 0, 11]]],
      ['an id on a footnote definition\'s lazy line', '[^1]: n\n^abc\n', [['footnoteDefinition', 0, 12, 'abc']], undefined, [['abc', 'abc', 0, 12]]],
      ['ids on list items', '- a ^x\n  - b ^y\n', [['list', 0, 15, undefined]], [[0, 'x'], [9, 'y']], [['x', 'x', 0, 6], ['y', 'y', 9, 15]]],
      ['an id on an item\'s continuation line', '- a\n  ^sub\n- b ^S\n', [['list', 0, 17, undefined]], [[0, 'sub'], [11, 'S']], [['sub', 'sub', 0, 10], ['s', 'S', 11, 17]]],
      ['a standalone id inside an item', '- a\n\n  ^sub\n', [['list', 0, 11, undefined]], [[0, 'sub']], [['sub', 'sub', 0, 11]]],
      ['an id on a nested item\'s lazy line', '- a\n  - b ^y\n  ^z\n', [['list', 0, 17, undefined]], [[0, undefined], [6, 'z']], [['z', 'z', 6, 17]]],
      ['an id on an ordered item', '1. a ^x\n2. b\n', [['list', 0, 12, undefined]], [[0, 'x'], [8, undefined]], [['x', 'x', 0, 7]]],
      ['an id on a task', '- [ ] t ^x\n', [['list', 0, 10, undefined]], [[0, 'x']], [['x', 'x', 0, 10]]],
      ['an item\'s id before a lazy blockquote\'s', '- a ^li\n> q ^q\n', [['list', 0, 14, undefined]], [[0, 'li']], [['li', 'li', 0, 14]]],
      ['an id in a list nested in an empty item', '- \n  - b ^y\n', [['list', 0, 11, undefined]], [[0, undefined], [5, 'y']], [['y', 'y', 5, 11]]],
      ['a definition with an escaped bracket in its label', '[a\\]b]: /u\n', [['definition', 0, 10, undefined]], undefined, undefined],
      ['a definition with an empty angle-bracket destination', '[a]: <>\n', [['paragraph', 0, 7, undefined]], undefined, undefined],
      ['a title glued to an angle-bracket destination', '[a]: <u>"t"\n', [['paragraph', 0, 11, undefined]], undefined, undefined],
      ['a title holding an empty line', '[a]: /u "t\n\nx"\n', [['paragraph', 0, 10, undefined], ['paragraph', 12, 14, undefined]], undefined, undefined],
      ['a title closed right after a line break', '[a]: /u "t\n"\n', [['paragraph', 0, 12, undefined]], undefined, undefined],
      ['a title across a line break', '[a]: /u "t\nu"\n', [['definition', 0, 13, undefined]], undefined, undefined],
      ['a title in parentheses', '[a]: /u (t)\n', [['definition', 0, 11, undefined]], undefined, undefined],
      ['a title in single quotes', '[a]: /u \'t\'\n', [['definition', 0, 11, undefined]], undefined, undefined],
      ['an unclosed footnote label', '[^ab\n', [['paragraph', 0, 4, undefined]], undefined, undefined],
      ['a footnote definition with a tab-indented line', '[^1]: n\n\tmore\n', [['footnoteDefinition', 0, 13, undefined]], undefined, undefined],
      ['a footnote definition and an item numbered 2', '[^1]: n\n2. a\n', [['footnoteDefinition', 0, 12, undefined]], undefined, undefined],
      ['a footnote definition and an item numbered 10', '[^1]: n\n10. a\n', [['footnoteDefinition', 0, 13, undefined]], undefined, undefined],
      ['a footnote label running to the end of the note', '[^ab', [['paragraph', 0, 4, undefined]], undefined, undefined],
      ['an empty footnote label', '[^]: n\n', [['paragraph', 0, 6, undefined]], undefined, undefined],
      ['a footnote label without a colon', '[^a] n\n', [['paragraph', 0, 6, undefined]], undefined, undefined]
    ])('should read the definitions and block ids of %s as Obsidian does', (_name, content, expectedSections, expectedItemIds, expectedBlocks) => {
      const cache = parseMarkdownContent(content);

      expect(cache.sections?.map((s) => [s.type, s.position.start.offset, s.position.end.offset, s.id])).toEqual(expectedSections);
      expect(cache.listItems?.map((item) => [item.position.start.offset, item.id])).toEqual(expectedItemIds);
      expect(cache.blocks && Object.entries(cache.blocks).map(([key, block]) => [key, block.id, block.position.start.offset, block.position.end.offset]))
        .toEqual(expectedBlocks);
    });

    // Measured the same way: the footnotes, footnote references and link reference definitions, and the `text` and
    // `element` sections Obsidian's worker appends to a note that references a footnote, with the `element` section's id.
    it.each([
      ['a link reference definition', '[a]: http://x \'t\'\n', undefined, undefined, [['a', 'http://x', 0, 17]], [['definition', 0, 0, 17, undefined]], undefined],
      ['a definition with an angle-bracket destination', '[a]: <u v>\n', undefined, undefined, [['a', 'u v', 0, 10]], [['definition', 0, 0, 10, undefined]], undefined],
      ['a definition whose angle brackets are empty', '[a]: <>x\n', undefined, undefined, [['a', 'x', 0, 8]], [['definition', 0, 0, 8, undefined]], undefined],
      ['a definition with an escape and character references', '[A]: /u\\_x\\q&amp;&#65;&#x42;&copy;&#0;&amp\n', undefined, undefined, [['A', String.raw`/u_x\q&AB©${REPLACEMENT_CHARACTER}&amp`, 0, 42]], [['definition', 0, 0, 42, undefined]], undefined],
      ['a definition with an escaped bracket in its label', '[a\\]b]: /u\n', undefined, undefined, [[String.raw`a\]b`, '/u', 0, 10]], [['definition', 0, 0, 10, undefined]], undefined],
      ['a definition with spaces in its label', '[ Foo  bar ]: /u\n', undefined, undefined, [[' Foo  bar ', '/u', 0, 16]], [['definition', 0, 0, 16, undefined]], undefined],
      ['two definitions of one label', '[a]: /u\n[a]: /w\n', undefined, undefined, [['a', '/u', 0, 7], ['a', '/w', 8, 15]], [['definition', 0, 0, 7, undefined], ['definition', 1, 8, 15, undefined]], undefined],
      ['a footnote definition', '[^Foo]: note\n', [['foo', 0, 12]], undefined, undefined, [['footnoteDefinition', 0, 0, 12, undefined]], undefined],
      ['a referenced footnote', 'text[^1]\n\n[^1]: note', [['1', 10, 20]], [['1', 4, 8]], undefined, [['paragraph', 0, 0, 8, undefined], ['footnoteDefinition', 2, 10, 20, undefined], ['text', 3, 20, 20, undefined], ['element', 3, 20, 20, undefined]], undefined],
      ['a reference to a missing footnote', 'a[^x] b[^x]\n', undefined, undefined, undefined, [['paragraph', 0, 0, 11, undefined]], undefined],
      ['references differing in case', 'a[^n] b[^N]\n\n[^N]: y\n', [['n', 13, 20]], [['n', 1, 5], ['n', 7, 11]], undefined, [['paragraph', 0, 0, 11, undefined], ['footnoteDefinition', 2, 13, 20, undefined], ['text', 3, 20, 20, undefined], ['element', 3, 20, 20, undefined]], undefined],
      ['two definitions of one referenced label', 't[^n] [^n]\n\n[^n]: x\n[^n]: y', [['n', 12, 19], ['n', 20, 27]], [['n', 1, 5], ['n', 6, 10]], undefined, [['paragraph', 0, 0, 10, undefined], ['footnoteDefinition', 2, 12, 19, undefined], ['footnoteDefinition', 3, 20, 27, undefined], ['text', 4, 27, 27, undefined], ['element', 4, 27, 27, undefined]], undefined],
      ['an inline footnote', 'x ^[inline note] y', [['[inline0', 4, 15]], undefined, undefined, [['paragraph', 0, 0, 18, undefined], ['text', 1, 18, 18, undefined], ['element', 1, 18, 18, undefined]], undefined],
      ['an inline footnote with brackets and code', 'x ^[in [b] `]` c] z', [['[inline0', 4, 16]], undefined, undefined, [['paragraph', 0, 0, 19, undefined], ['text', 1, 19, 19, undefined], ['element', 1, 19, 19, undefined]], undefined],
      ['an empty inline footnote', '^[]', undefined, [['', 0, 3]], undefined, [['paragraph', 0, 0, 3, undefined], ['text', 1, 3, 3, undefined], ['element', 1, 3, 3, undefined]], undefined],
      ['an unclosed inline footnote', '^[x\n', undefined, undefined, undefined, [['paragraph', 0, 0, 3, undefined]], undefined],
      ['an inline footnote after a reference', 'a[^1] ^[x]\n\n[^1]: n', [['[inline1', 8, 9], ['1', 12, 19]], [['1', 1, 5]], undefined, [['paragraph', 0, 0, 10, undefined], ['footnoteDefinition', 2, 12, 19, undefined], ['text', 3, 19, 19, undefined], ['element', 3, 19, 19, undefined]], undefined],
      ['a reference and an inline footnote inside a definition', '[^1]: a[^1] ^[b]', [['1', 0, 16], ['[inline1', 14, 15]], [['1', 7, 11]], undefined, [['footnoteDefinition', 0, 0, 16, undefined], ['text', 1, 16, 16, undefined], ['element', 1, 16, 16, undefined]], undefined],
      ['a reference inside an inline footnote', 'a ^[b [^c] d]\n\n[^c]: e', [['[inline0', 4, 12], ['c', 15, 22]], undefined, undefined, [['paragraph', 0, 0, 13, undefined], ['footnoteDefinition', 2, 15, 22, undefined], ['text', 3, 22, 22, undefined], ['element', 3, 22, 22, undefined]], undefined],
      ['an escaped reference and a reference in code', '\\[^1] `[^1]` ``[^1]` [^1]\n\n[^1]: n', [['1', 27, 34]], [['1', 21, 25]], undefined, [['paragraph', 0, 0, 25, undefined], ['footnoteDefinition', 2, 27, 34, undefined], ['text', 3, 34, 34, undefined], ['element', 3, 34, 34, undefined]], undefined],
      ['an unclosed code span before a reference', '` [^1]\n\n[^1]: n', [['1', 8, 15]], [['1', 2, 6]], undefined, [['paragraph', 0, 0, 6, undefined], ['footnoteDefinition', 2, 8, 15, undefined], ['text', 3, 15, 15, undefined], ['element', 3, 15, 15, undefined]], undefined],
      ['a reference in a fence', '```\n[^1]\n```\n\n[^1]: n', [['1', 14, 21]], undefined, undefined, [['code', 0, 0, 12, undefined], ['footnoteDefinition', 4, 14, 21, undefined]], undefined],
      ['a reference in a heading, a quote and a table', '# H[^1]\n\n> q[^1]\n\n| a[^1] | b |\n| - | - |\n\n[^1]: n', [['1', 43, 50]], [['1', 3, 7], ['1', 12, 16], ['1', 21, 25]], undefined, [['heading', 0, 0, 7, undefined], ['blockquote', 2, 9, 16, undefined], ['table', 4, 18, 41, undefined], ['footnoteDefinition', 7, 43, 50, undefined], ['text', 8, 50, 50, undefined], ['element', 8, 50, 50, undefined]], undefined],
      ['a label with a space', 'a[^b c]\n\n[^b]: x', [['b', 9, 16]], undefined, undefined, [['paragraph', 0, 0, 7, undefined], ['footnoteDefinition', 2, 9, 16, undefined]], undefined],
      ['an id in a referenced footnote', '[^n]: x ^id\n\nt[^n]', [['n', 0, 11]], [['n', 14, 18]], undefined, [['footnoteDefinition', 0, 0, 11, 'id'], ['paragraph', 2, 13, 18, undefined], ['text', 3, 18, 18, undefined], ['element', 3, 18, 18, 'id']], [['id', 'id', 18, 18]]],
      ['an id in an inline footnote', 't ^[x ^q]', [['[inline0', 4, 8]], undefined, undefined, [['paragraph', 0, 0, 9, undefined], ['text', 1, 9, 9, undefined], ['element', 1, 9, 9, 'q']], [['q', 'q', 9, 9]]],
      ['an id in a nested inline footnote', 't ^[a ^[b ^q] c]', [['[inline0', 4, 15]], undefined, undefined, [['paragraph', 0, 0, 16, undefined], ['text', 1, 16, 16, undefined], ['element', 1, 16, 16, 'q']], [['q', 'q', 16, 16]]],
      ['an id after an inline footnote', 't ^[x] ^id', [['[inline0', 4, 5]], undefined, undefined, [['paragraph', 0, 0, 10, 'id'], ['text', 1, 10, 10, undefined], ['element', 1, 10, 10, undefined]], [['id', 'id', 0, 10]]],
      ['a standalone id after a referenced footnote', 't[^n]\n\n[^n]: x\n\n^abc', [['n', 7, 14]], [['n', 1, 5]], undefined, [['paragraph', 0, 0, 5, undefined], ['footnoteDefinition', 2, 7, 14, 'abc'], ['text', 5, 20, 20, undefined], ['element', 5, 20, 20, undefined]], [['abc', 'abc', 7, 14]]],
      ['trailing empty lines after a reference', 't[^n]\n\n[^n]: x\n\n', [['n', 7, 14]], [['n', 1, 5]], undefined, [['paragraph', 0, 0, 5, undefined], ['footnoteDefinition', 2, 7, 14, undefined], ['text', 3, 14, 14, undefined], ['element', 3, 14, 14, undefined]], undefined],
      ['a reference after frontmatter', '---\na: 1\n---\nt ^[x]', [['[inline0', 17, 18]], undefined, undefined, [['yaml', 0, 0, 12, undefined], ['paragraph', 3, 13, 19, undefined], ['text', 4, 19, 19, undefined], ['element', 4, 19, 19, undefined]], undefined],
      ['a definition with out-of-range character references', '[a]: /u&#xD800;&#1114112;&#x10FFFF;\n', undefined, undefined, [['a', `/u${REPLACEMENT_CHARACTER}${REPLACEMENT_CHARACTER}${LAST_CHARACTER}`, 0, 35]], [['definition', 0, 0, 35, undefined]], undefined],
      ['an inline footnote with an escaped bracket', String.raw`x ^[a \] b] y`, [['[inline0', 4, 10]], undefined, undefined, [['paragraph', 0, 0, 13, undefined], ['text', 1, 13, 13, undefined], ['element', 1, 13, 13, undefined]], undefined],
      ['an inline footnote with code spans of two lengths', 'x ^[a ``b` ]`` c] y', [['[inline0', 4, 16]], undefined, undefined, [['paragraph', 0, 0, 19, undefined], ['text', 1, 19, 19, undefined], ['element', 1, 19, 19, undefined]], undefined],
      ['an id in the first of two nested inline footnotes', 't ^[a ^[b ^q] ^[c] d]', [['[inline0', 4, 20]], undefined, undefined, [['paragraph', 0, 0, 21, undefined], ['text', 1, 21, 21, undefined], ['element', 1, 21, 21, 'q']], [['q', 'q', 21, 21]]]
    ])('should collect the footnotes and references of %s as Obsidian does', (
      _name,
      content,
      expectedFootnotes,
      expectedRefs,
      expectedReferenceLinks,
      expectedSections,
      expectedBlocks
    ) => {
      const cache = parseMarkdownContent(content);

      expect(cache.footnotes?.map((f) => [f.id, f.position.start.offset, f.position.end.offset])).toEqual(expectedFootnotes);
      expect(cache.footnoteRefs?.map((f) => [f.id, f.position.start.offset, f.position.end.offset])).toEqual(expectedRefs);
      expect(cache.referenceLinks?.map((r) => [r.id, r.link, r.position.start.offset, r.position.end.offset])).toEqual(expectedReferenceLinks);
      expect(cache.sections?.map((s) => [s.type, s.position.start.line, s.position.start.offset, s.position.end.offset, s.id])).toEqual(expectedSections);
      expect(cache.blocks && Object.entries(cache.blocks).map(([key, block]) => [key, block.id, block.position.start.offset, block.position.end.offset]))
        .toEqual(expectedBlocks);
    });

    it('should leave a named character reference as written when there is no document to decode it', () => {
      vi.stubGlobal('document', undefined);
      try {
        expect(parseMarkdownContent('[a]: /u&copy;&#65;\n').referenceLinks?.map((link) => link.link)).toEqual(['/u&copy;A']);
      } finally {
        vi.unstubAllGlobals();
      }
    });
    // Measured the same way: the list lines Obsidian reads as something else - a thematic break, which `remark-parse`
    // tries before a list item, a table row, and a line an HTML block hides.
    it.each([
      ['a thematic break of asterisks', '* * *\n', [['thematicBreak', 0, 5]], undefined],
      ['a thematic break interrupting a paragraph', 'para\n- - -\n', [['paragraph', 0, 4], ['thematicBreak', 5, 10]], undefined],
      ['a thematic break ending a list', '- a\n- - -\n- b\n', [['list', 0, 3], ['thematicBreak', 4, 9], ['list', 10, 13]], [[0, 3, -1], [10, 13, -2]]],
      ['a thematic break inside an item', '- a\n  - - -\n', [['list', 0, 11]], [[0, 11, -1]]],
      ['a thematic break indented inside an item', '- a\n    * * *\n', [['list', 0, 13]], [[0, 13, -1]]],
      ['a thematic break inside an item\'s first line', '- * * *\n', [['list', 0, 7]], [[0, 7, -1]]],
      ['a thematic break in a blockquote', '> * * *\n', [['blockquote', 0, 7]], undefined],
      ['a table delimiter row of dashes', 'a | b\n- | -\n', [['table', 0, 11]], undefined],
      ['a table row that looks like an item', 'a | b\n- | -\n- c | d\n', [['table', 0, 19]], undefined],
      ['a row without the header\'s leading pipe', '|a|b|\n|-|-|\n- x|y\n', [['table', 0, 11], ['list', 12, 17]], [[12, 17, -2]]],
      ['a delimiter-like row inside an item', '- x\n  a | b\n  - | -\n', [['list', 0, 19]], [[0, 11, -1], [14, 19, 0]]],
      ['an ordered item numbered 2 after a paragraph', 'a\n2. b\n', [['paragraph', 0, 6]], undefined],
      ['an HTML block hiding an item', '<div>\n- a\n', [['html', 0, 9]], undefined],
      ['an HTML block ended by an empty line', '<div>\n\n- a\n', [['html', 0, 5], ['list', 7, 10]], [[7, 10, -2]]],
      ['an HTML comment hiding an item', '<!-- c\n- a\n-->\n- b\n', [['html', 0, 14], ['list', 15, 18]], [[15, 18, -3]]],
      ['a one-line HTML comment', '<!-- c -->\n- a\n', [['html', 0, 10], ['list', 11, 14]], [[11, 14, -1]]],
      ['an HTML block interrupting a paragraph', 'para\n<div>\n- a\n', [['paragraph', 0, 4], ['html', 5, 14]], undefined],
      ['an inline tag after a paragraph', 'para\n<span>\n- a\n', [['paragraph', 0, 11], ['list', 12, 15]], [[12, 15, -2]]],
      ['an inline tag alone', '<span>\n* b\n', [['html', 0, 10]], undefined],
      ['an HTML block after a list', '- a\n\n<div>\n- b\n', [['list', 0, 3], ['html', 5, 14]], [[0, 3, -1]]],
      ['an HTML block inside an item', '- a\n\n  <div>\n  - b\n', [['list', 0, 18]], [[0, 18, -1]]],
      ['an HTML comment inside an item', '- a\n  <!-- x\n  - b\n', [['list', 0, 18]], [[0, 18, -1]]],
      ['an HTML block lazily inside an item', '- a\n<div>\n  - n\n', [['list', 0, 15]], [[0, 15, -1]]],
      ['an HTML block lazily inside an item, then a sibling', '- a\n<div>\n- b\n', [['list', 0, 13]], [[0, 9, -1], [10, 13, -1]]],
      ['a lazy HTML block before an empty line', '2. y\n<p>x</p>\n\n2. y\n', [['list', 0, 19]], [[0, 13, -1], [15, 19, -1]]],
      ['an HTML block in a blockquote', '> <div>\n> - a\n', [['blockquote', 0, 13]], undefined],
      ['an HTML block leaving a blockquote', '> q\n<div>\n- a\n', [['blockquote', 0, 3], ['html', 4, 13]], undefined]
    ])('should read the list lines of %s as Obsidian does', (_name, content, expectedSections, expectedItems) => {
      const cache = parseMarkdownContent(content);

      expect(cache.sections?.map((s) => [s.type, s.position.start.offset, s.position.end.offset])).toEqual(expectedSections);
      expect(cache.listItems?.map((item) => [item.position.start.offset, item.position.end.offset, item.parent])).toEqual(expectedItems);
    });
    it('should create code sections for fenced code blocks in gaps', () => {
      const content = '# Heading\n\n```\ncode\n```';
      const cache = parseMarkdownContent(content);

      const codeSections = cache.sections?.filter((s) => s.type === 'code');
      expect(codeSections?.length).toBeGreaterThan(0);
    });

    it('should create thematicBreak sections', () => {
      const content = '# Heading\n\n---';
      const cache = parseMarkdownContent(content);

      const thematicBreakSections = cache.sections?.filter((s) => s.type === 'thematicBreak');
      expect(thematicBreakSections?.length).toBeGreaterThan(0);
    });

    it('should create thematicBreak sections for *** separator', () => {
      const content = '# Heading\n\n***';
      const cache = parseMarkdownContent(content);

      const thematicBreakSections = cache.sections?.filter((s) => s.type === 'thematicBreak');
      expect(thematicBreakSections?.length).toBeGreaterThan(0);
    });

    it('should create thematicBreak sections for ___ separator', () => {
      const content = '# Heading\n\n___';
      const cache = parseMarkdownContent(content);

      const thematicBreakSections = cache.sections?.filter((s) => s.type === 'thematicBreak');
      expect(thematicBreakSections?.length).toBeGreaterThan(0);
    });

    it('should handle trailing content after last section', () => {
      const content = '# Heading\n\nTrailing paragraph';
      const cache = parseMarkdownContent(content);

      const paragraphs = cache.sections?.filter((s) => s.type === 'paragraph');
      expect(paragraphs?.length).toBeGreaterThan(0);
    });

    it('should handle multiple list groups separated by blank lines', () => {
      const content = '- List 1\n\nSome text\n\n- List 2';
      const cache = parseMarkdownContent(content);

      const listSections = cache.sections?.filter((s) => s.type === 'list');
      expect(listSections).toHaveLength(LIST_ITEM_COUNT_2);
    });

    // Regression: a gap holding more than one block used to reconstruct the second block's offset from
    // the first block's LENGTH plus a single separator character, on top of an offset that had already
    // advanced to the first block's end. The lookup then ran past the block and threw
    // "Block not found in content". A standalone `%%` comment after a blank line is the everyday shape
    // that hit it, and real Obsidian parses every shape below.
    it('should parse a standalone comment block that follows a blank line', () => {
      const content = 'text\n\n%% c %%\n';
      const cache = parseMarkdownContent(content);

      const paragraphs = cache.sections?.filter((section) => section.type === 'paragraph');
      expect(paragraphs).toHaveLength(PARAGRAPH_COUNT_2);
    });

    it('should position each block of a multi-block gap at its own offset', () => {
      const content = 'text\n\n%% c %%\n';
      const cache = parseMarkdownContent(content);

      const paragraphs = ensureNonNullable(cache.sections).filter((section) => section.type === 'paragraph');
      const [first, second] = paragraphs;
      expect(first?.position.start.offset).toBe(0);
      expect(first?.position.end.offset).toBe(FIRST_BLOCK_END_OFFSET);
      expect(second?.position.start.offset).toBe(SECOND_BLOCK_START_OFFSET);
      expect(second?.position.start.line).toBe(SECOND_BLOCK_LINE);
      expect(second?.position.start.col).toBe(0);
    });

    it('should parse blocks separated by a blank line that carries whitespace', () => {
      const content = 'first paragraph\n   \nsecond paragraph';
      const cache = parseMarkdownContent(content);

      const paragraphs = ensureNonNullable(cache.sections).filter((section) => section.type === 'paragraph');
      expect(paragraphs).toHaveLength(PARAGRAPH_COUNT_2);
      expect(paragraphs[1]?.position.start.offset).toBe(content.indexOf('second'));
    });

    it('should parse three blocks separated by blank lines', () => {
      const content = 'alpha\n\nbeta\n\ngamma\n';
      const cache = parseMarkdownContent(content);

      const paragraphs = ensureNonNullable(cache.sections).filter((section) => section.type === 'paragraph');
      expect(paragraphs).toHaveLength(PARAGRAPH_COUNT_3);
      expect(paragraphs[1]?.position.start.offset).toBe(content.indexOf('beta'));
      expect(paragraphs[2]?.position.start.offset).toBe(content.indexOf('gamma'));
    });
  });

  describe('position accuracy', () => {
    it('should track correct line, col, and offset', () => {
      const content = 'Line zero\n# Heading on line 1';
      const cache = parseMarkdownContent(content);

      const heading = cache.headings?.[0];
      expect(heading?.position.start.line).toBe(1);
      expect(heading?.position.start.col).toBe(0);
      expect(heading?.position.start.offset).toBe(HEADING_OFFSET);
    });
  });

  describe('sections with tilde fenced code blocks in gaps', () => {
    it('should detect tilde fenced code blocks as code sections', () => {
      const content = '# Heading\n\n~~~\ncode here\n~~~';
      const cache = parseMarkdownContent(content);
      const codeSections = cache.sections?.filter((s) => s.type === 'code');
      expect(codeSections?.length).toBeGreaterThan(0);
    });
  });

  describe('list items in code blocks', () => {
    it('should not parse list items inside code blocks', () => {
      const content = '```\n- not a list\n```\n- real item';
      const cache = parseMarkdownContent(content);
      expect(cache.listItems).toHaveLength(1);
    });

    // Measured on a real Obsidian 1.14.4.
    it('should not parse tags or links inside a code block in a blockquote', () => {
      const cache = parseMarkdownContent('> ```\n> #tag [[L]]\n> ```\n\n#out [[M]]\n');

      expect(cache.tags?.map((tag) => tag.tag)).toEqual(['#out']);
      expect(cache.links?.map((link) => link.link)).toEqual(['M']);
    });
  });

  describe('embeds in code blocks', () => {
    it('should not parse wiki embeds inside inline code', () => {
      const content = '`![[not-embed]]` followed by\n![[real-embed.png]]';
      const cache = parseMarkdownContent(content);
      expect(cache.embeds).toHaveLength(1);
      expect(cache.embeds?.[0]?.link).toBe('real-embed.png');
    });
  });

  describe('links in inline code', () => {
    it('should not parse wikilinks inside inline code', () => {
      const content = '`[[not-a-link]]` and [[real-link]]';
      const cache = parseMarkdownContent(content);
      expect(cache.links).toHaveLength(1);
      expect(cache.links?.[0]?.link).toBe('real-link');
    });

    it('should not parse markdown links inside inline code', () => {
      const content = '`[text](url)` and [real](link)';
      const cache = parseMarkdownContent(content);
      expect(cache.links).toHaveLength(1);
      expect(cache.links?.[0]?.link).toBe('link');
    });
  });

  describe('markdown embeds in inline code', () => {
    it('should not parse markdown embeds in inline code', () => {
      const content = '`![alt](img.png)` and ![real](embed.png)';
      const cache = parseMarkdownContent(content);
      expect(cache.embeds).toHaveLength(1);
      expect(cache.embeds?.[0]?.link).toBe('embed.png');
    });
  });

  describe('frontmatter with empty YAML', () => {
    it('should handle empty frontmatter gracefully', () => {
      // Frontmatter regex requires at least one newline between delimiters
      const content = '---\n\n---\nBody';
      const cache = parseMarkdownContent(content);
      expect(cache.frontmatter).toBeUndefined();
      expect(cache.frontmatterPosition).toBeUndefined();
      expect(cache.frontmatterLinks).toBeUndefined();
    });
  });

  describe('nested list items across separate groups', () => {
    it('should correctly handle multiple separate list groups with nesting', () => {
      const content = '- Parent\n  - Child\n\nText\n\n- Another parent\n  - Another child';
      const cache = parseMarkdownContent(content);
      expect(cache.listItems).toHaveLength(NESTED_LIST_TOTAL_COUNT);
      const listSections = cache.sections?.filter((s) => s.type === 'list');
      expect(listSections).toHaveLength(LIST_ITEM_COUNT_2);
    });
  });

  describe('addGapSections edge cases', () => {
    it('should handle gap content where block cannot be found via indexOf', () => {
      // A heading followed by a gap that contains blocks which, after trim+split,
      // produce a trimmed string that indexOf cannot find at the expected offset
      // because the offset has moved past it. This exercises the blockStart < 0 branch.
      const content = '# Heading\n\n \n\nSome text';
      const cache = parseMarkdownContent(content);

      // The whitespace-only block between heading and "Some text" should not create a section
      const paragraphs = cache.sections?.filter((s) => s.type === 'paragraph');
      expect(paragraphs?.length).toBeGreaterThan(0);
    });
  });

  describe('offsetToLoc edge cases', () => {
    it('should handle empty content', () => {
      const cache = parseMarkdownContent('');
      expect(cache.sections).toBeUndefined();
    });
  });

  describe('position end offset is exclusive', () => {
    it('should make a wikilink position slice back to its original', () => {
      const content = 'See [[Page Name]] for details';
      const cache = parseMarkdownContent(content);

      const link = ensureNonNullable(cache.links?.[0]);
      expect(content.slice(link.position.start.offset, link.position.end.offset)).toBe(link.original);
    });

    it('should make a markdown link position slice back to its original', () => {
      const content = 'Visit [Example](https://example.com) now';
      const cache = parseMarkdownContent(content);

      const link = ensureNonNullable(cache.links?.[0]);
      expect(content.slice(link.position.start.offset, link.position.end.offset)).toBe(link.original);
    });

    it('should make a wiki embed position slice back to its original', () => {
      const content = 'Before ![[image.png]] after';
      const cache = parseMarkdownContent(content);

      const embed = ensureNonNullable(cache.embeds?.[0]);
      expect(content.slice(embed.position.start.offset, embed.position.end.offset)).toBe(embed.original);
    });

    it('should make a markdown embed position slice back to its original', () => {
      const content = 'Before ![Alt text](image.png) after';
      const cache = parseMarkdownContent(content);

      const embed = ensureNonNullable(cache.embeds?.[0]);
      expect(content.slice(embed.position.start.offset, embed.position.end.offset)).toBe(embed.original);
    });

    it('should make a heading position slice back to the whole heading line', () => {
      const content = 'Some text\n# Heading\nMore text';
      const cache = parseMarkdownContent(content);

      const heading = ensureNonNullable(cache.headings?.[0]);
      expect(content.slice(heading.position.start.offset, heading.position.end.offset)).toBe('# Heading');
    });

    it('should make a tag position slice back to the tag text', () => {
      const content = 'Text #mytag rest';
      const cache = parseMarkdownContent(content);

      const tag = ensureNonNullable(cache.tags?.[0]);
      expect(content.slice(tag.position.start.offset, tag.position.end.offset)).toBe(tag.tag);
    });

    it('should make a list item position slice back to the whole item line', () => {
      const content = '- First item\n- Second item';
      const cache = parseMarkdownContent(content);

      const item = ensureNonNullable(cache.listItems?.[0]);
      expect(content.slice(item.position.start.offset, item.position.end.offset)).toBe('- First item');
    });
  });

  // Measured with Obsidian 1.14.4's own metadata worker: `\r\n`, `\n` and a lone `\r` are one line break each, and every
  // position is in the original text, a line ending before its `\r`.
  describe('line breaks other than LF', () => {
    function toTuple(pos: Pos): number[] {
      return [pos.start.line, pos.start.col, pos.start.offset, pos.end.line, pos.end.col, pos.end.offset];
    }

    it('should end an item followed by a sibling after a blank CRLF line at that line', () => {
      const cache = parseMarkdownContent('- A\r\n\r\n- B\r\n');
      expect(cache.listItems?.map((item) => [item.position.start.offset, item.position.end.offset])).toEqual([[0, 5], [7, 10]]);
    });

    it('should end an item at an indented blank CRLF line it holds', () => {
      const cache = parseMarkdownContent('- A\r\n  \r\n- B\r\n');
      expect(cache.listItems?.map((item) => [item.position.start.offset, item.position.end.offset])).toEqual([[0, 7], [9, 12]]);
    });

    it('should report every collection of a CRLF note at its original positions', () => {
      const content = '# Head\r\n\r\nPara #tag [[L]] ![[E]]\r\n\r\n- [ ] item\r\n  - sub\r\n\r\n```\r\ncode #no\r\n```\r\n';
      const cache = parseMarkdownContent(content);
      expect(cache.headings?.map((heading) => toTuple(heading.position))).toEqual([[0, 0, 0, 0, 6, 6]]);
      expect(cache.tags?.map((tag) => [tag.tag, ...toTuple(tag.position)])).toEqual([['#tag', 2, 5, 15, 2, 9, 19]]);
      expect(cache.links?.map((link) => [link.original, ...toTuple(link.position)])).toEqual([['[[L]]', 2, 10, 20, 2, 15, 25]]);
      expect(cache.embeds?.map((embed) => [embed.original, ...toTuple(embed.position)])).toEqual([['![[E]]', 2, 16, 26, 2, 22, 32]]);
      expect(cache.listItems?.map((item) => [item.parent, ...toTuple(item.position)])).toEqual([
        [-4, 4, 0, 36, 4, 10, 46],
        [4, 5, 2, 50, 5, 7, 55]
      ]);
      expect(cache.sections?.map((section) => [section.type, ...toTuple(section.position)])).toEqual([
        ['heading', 0, 0, 0, 0, 6, 6],
        ['paragraph', 2, 0, 10, 2, 22, 32],
        ['list', 4, 0, 36, 5, 7, 55],
        ['code', 7, 0, 59, 9, 3, 77]
      ]);
    });

    it('should read a CRLF frontmatter block', () => {
      const cache = parseMarkdownContent('---\r\na: "[[T]]"\r\n---\r\nbody\r\n');
      expect(cache.frontmatter).toEqual({ a: '[[T]]' });
      expect(cache.frontmatterLinks).toEqual([{ displayText: 'T', key: 'a', link: 'T', original: '[[T]]' }]);
      expect(cache.frontmatterPosition?.start.offset).toBe(0);
    });

    it('should end a CRLF frontmatter block at its closing delimiter, before the CR', () => {
      const cache = parseMarkdownContent('---\r\ntags: [x]\r\nrel: "[[T]]"\r\n---\r\n# Head');
      expect(cache.frontmatterPosition && toTuple(cache.frontmatterPosition)).toEqual([0, 0, 0, 3, 3, 33]);
      expect(cache.sections?.map((section) => [section.type, ...toTuple(section.position)])).toEqual([
        ['yaml', 0, 0, 0, 3, 3, 33],
        ['heading', 4, 0, 35, 4, 6, 41]
      ]);
    });

    it('should keep the CRLF inside a link that spans two lines in its original', () => {
      const cache = parseMarkdownContent('See [a\r\nb](x.md) here');
      expect(cache.links?.map((link) => [link.original, link.displayText, ...toTuple(link.position)])).toEqual([
        ['[a\r\nb](x.md)', 'a\nb', 0, 4, 4, 1, 8, 16]
      ]);
    });

    it('should take a lone CR as a line break', () => {
      const cache = parseMarkdownContent('- A\r- B\r# H\rtext');
      expect(cache.listItems?.map((item) => [item.parent, ...toTuple(item.position)])).toEqual([
        [-1, 0, 0, 0, 0, 3, 3],
        [-1, 1, 0, 4, 1, 3, 7]
      ]);
      expect(cache.sections?.map((section) => [section.type, ...toTuple(section.position)])).toEqual([
        ['list', 0, 0, 0, 1, 3, 7],
        ['heading', 2, 0, 8, 2, 3, 11],
        ['paragraph', 3, 0, 12, 3, 4, 16]
      ]);
    });

    it('should report the footnotes and references of a CRLF note at their original positions', () => {
      const cache = parseMarkdownContent('text[^1]\r\n\r\n[^1]: note\r\n[a]: /u\r\n');
      expect(cache.footnotes?.map((footnote) => [footnote.id, ...toTuple(footnote.position)])).toEqual([['1', 2, 0, 12, 2, 10, 22]]);
      expect(cache.footnoteRefs?.map((ref) => [ref.id, ...toTuple(ref.position)])).toEqual([['1', 0, 4, 4, 0, 8, 8]]);
      expect(cache.referenceLinks?.map((link) => [link.id, link.link, ...toTuple(link.position)])).toEqual([['a', '/u', 3, 0, 24, 3, 7, 31]]);
      expect(cache.sections?.slice(-2).map((section) => [section.type, ...toTuple(section.position)])).toEqual([
        ['text', 4, 0, 31, 4, 0, 31],
        ['element', 4, 0, 31, 4, 0, 31]
      ]);
    });

    it('should put the footnote list after a standalone id ending a lone-CR note', () => {
      const cache = parseMarkdownContent('a ^[b\rc]\r^x');
      expect(cache.footnotes?.map((footnote) => [footnote.id, ...toTuple(footnote.position)])).toEqual([['[inline0', 0, 4, 4, 1, 1, 7]]);
      expect(cache.sections?.slice(-2).map((section) => [section.type, ...toTuple(section.position)])).toEqual([
        ['text', 3, 0, 11, 3, 0, 11],
        ['element', 3, 0, 11, 3, 0, 11]
      ]);
      expect(cache.blocks?.['x'] && toTuple(cache.blocks['x'].position)).toEqual([0, 0, 0, 2, 2, 11]);
    });

    it('should report nothing for a note holding only blank CRLF lines', () => {
      expect(parseMarkdownContent('\r\n\r\n')).toEqual({});
    });

    it('should take CRLF and LF mixed in one note as one line break each', () => {
      const cache = parseMarkdownContent('- A\r\n- B\n- C\r\n');
      expect(cache.listItems?.map((item) => toTuple(item.position))).toEqual([
        [0, 0, 0, 0, 3, 3],
        [1, 0, 5, 1, 3, 8],
        [2, 0, 9, 2, 3, 12]
      ]);
    });
  });

  describe('complex document', () => {
    it('should parse a document with mixed content', () => {
      const content = [
        '---',
        'title: Test',
        'tags: [meta]',
        '---',
        '',
        '# Introduction',
        '',
        'Some text with #inline-tag and [[a link]].',
        '',
        '## Details',
        '',
        '- [ ] Task 1',
        '- [x] Task 2',
        '',
        '![[embed.png]]'
      ].join('\n');

      const cache = parseMarkdownContent(content);

      expect(cache.frontmatter?.['title']).toBe('Test');
      expect(cache.headings).toHaveLength(COMPLEX_HEADING_COUNT);
      expect(cache.tags).toHaveLength(1);
      expect(cache.links).toHaveLength(1);
      expect(cache.embeds).toHaveLength(1);
      expect(cache.listItems).toHaveLength(COMPLEX_LIST_ITEM_COUNT);
    });
  });
});
