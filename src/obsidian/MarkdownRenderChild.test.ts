import type { MarkdownRenderChild as MarkdownRenderChildOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { MarkdownRenderChild } from './MarkdownRenderChild.ts';

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

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original', () => {
      const child = MarkdownRenderChild.create2__(createDiv());
      const original: MarkdownRenderChildOriginal = child.asOriginalType2__();
      expect(original).toBe(child);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const child = MarkdownRenderChild.create2__(createDiv());
      const mock = MarkdownRenderChild.fromOriginalType2__(child.asOriginalType2__());
      expect(mock).toBe(child);
    });
  });
});
