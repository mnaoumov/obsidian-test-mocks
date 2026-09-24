/**
 * @file
 *
 * Splits a source file into its leading `@file` documentation block and everything else.
 *
 * Every file in this repo and in the sibling repos it shares helpers with opens with one: a `/** @file`
 * JSDoc block carrying the prose that says why the file exists. That block is the one part of a shared copy
 * that is legitimately per-repo - it names the gates THIS checkout runs, the repo the copy came from, and
 * what was measured here - while the code underneath is supposed to be byte-identical everywhere.
 *
 * `check:helpers-sync` is the caller, and the whole reason this is a function rather than three lines inline
 * is that the gate script runs `main()` at import time, so nothing inside it can carry a unit test. Living
 * here it is testable, and it is also inside the roster that gate compares - the function deciding what the
 * gate cannot see is itself one of the things the gate watches.
 *
 * **What counts as a file header is deliberately narrow**: the text must OPEN with `/**`, and the first tag
 * in that block must be `@file`. A file whose first block is an ordinary comment, or whose header is missing
 * altogether, gets a `null` header and its whole text as the body - which is what lets a caller report "you
 * claimed a header difference and there is no header here" instead of quietly comparing everything.
 */

/**
 * A source file cut in two at the end of its `@file` block.
 *
 * `body` is always the text the caller should compare; when there is no header it is the whole file, so a
 * caller that ignores `header` still behaves correctly rather than comparing nothing.
 */
export interface FileHeaderSplit {
  body: string;
  header: null | string;
}

const BLOCK_COMMENT_END = '*/';

const BLOCK_COMMENT_START = '/**';

/*
 * The first tag of the opening block, with the leading whitespace and asterisks of whatever comment layout
 * put it there. Anchored at the start of the block's contents rather than searched for anywhere in it, so a
 * block that merely MENTIONS `@file` in its prose is not mistaken for one that is a file header.
 */
const LEADING_FILE_TAG_REG_EXP = /^[\s*]*@file\b/;

/**
 * Splits a source file at the end of its leading `@file` block.
 *
 * @param text - The file's full text.
 * @returns The header and the body, or a `null` header and the whole text as the body when the file does not
 * open with an `@file` block.
 */
export function splitFileHeader(text: string): FileHeaderSplit {
  if (!text.startsWith(BLOCK_COMMENT_START)) {
    return { body: text, header: null };
  }

  const endIndex = text.indexOf(BLOCK_COMMENT_END, BLOCK_COMMENT_START.length);
  if (endIndex === -1) {
    return { body: text, header: null };
  }

  const contents = text.slice(BLOCK_COMMENT_START.length, endIndex);
  if (!LEADING_FILE_TAG_REG_EXP.test(contents)) {
    return { body: text, header: null };
  }

  const headerEndIndex = endIndex + BLOCK_COMMENT_END.length;
  return { body: text.slice(headerEndIndex), header: text.slice(0, headerEndIndex) };
}
