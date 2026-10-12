import type { Pos } from 'obsidian';

import {
  describe,
  expect,
  it
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
      // An item with nothing after its marker is never a parent: the list nested in it is rooted at its own first line.
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
      { content: '- A\n> > - K\n> %%', expected: [[0, 16, -1], [8, 11, -1]] }
    ])('should find the items of $content that no block hides, as Obsidian does', ({ content, expected }) => {
      const cache = parseMarkdownContent(content);

      expect(cache.listItems?.map((item) => [item.position.start.offset, item.position.end.offset, item.parent]) ?? []).toEqual(expected);
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
