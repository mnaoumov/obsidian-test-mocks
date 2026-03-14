import type { MarkdownRenderChild as MarkdownRenderChildOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { MarkdownRenderChild } from '../../src/obsidian/MarkdownRenderChild.ts';

describe('MarkdownRenderChild', () => {
  it('should create an instance via create2__', () => {
    const el = createDiv();
    const child = MarkdownRenderChild.create2__(el);
    expect(child).toBeInstanceOf(MarkdownRenderChild);
  });

  it('should set containerEl from constructor', () => {
    const el = createDiv();
    const child = MarkdownRenderChild.create2__(el);
    expect(child.containerEl).toBe(el);
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const child = MarkdownRenderChild.create2__(createDiv());
      const original: MarkdownRenderChildOriginal = child.asOriginalType__();
      expect(original).toBe(child);
    });
  });
});
