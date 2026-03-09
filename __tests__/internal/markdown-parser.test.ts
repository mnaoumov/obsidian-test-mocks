import {
  describe,
  expect,
  it
} from 'vitest';

import { parseMarkdownContent } from '../../src/internal/markdown-parser.ts';

const HEADING_COUNT_ALL = 6;
const HEADING_LEVEL_2 = 2;
const HEADING_INDEX_LAST = 5;
const HEADING_LEVEL_6 = 6;
const TAG_COUNT = 2;
const TAG_COL_OFFSET = 5;
const LIST_ITEM_COUNT_3 = 3;
const LIST_ITEM_COUNT_2 = 2;
const ROOT_PARENT_LINE = -2;
const HEADING_OFFSET = 10;
const COMPLEX_HEADING_COUNT = 2;
const COMPLEX_LIST_ITEM_COUNT = 2;

describe('parseMarkdownContent', () => {
  describe('empty document', () => {
    it('should return empty cache for empty string', () => {
      const cache = parseMarkdownContent('');
      expect(cache.frontmatter).toBeUndefined();
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

    it('should handle frontmatter with only whitespace content', () => {
      const content = '---\n \n---\n\nBody';
      const cache = parseMarkdownContent(content);

      expect(cache.frontmatter).toBeDefined();
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
