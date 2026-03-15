import type { MarkdownPreviewRenderer as MarkdownPreviewRendererOriginal } from 'obsidian';

import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { MarkdownPreviewRenderer } from './MarkdownPreviewRenderer.ts';

function postProcessor(): void {
  // Noop
}

afterEach(() => {
  // Clean up registered post processors
  MarkdownPreviewRenderer.unregisterPostProcessor(postProcessor);
});

describe('MarkdownPreviewRenderer', () => {
  describe('registerPostProcessor / unregisterPostProcessor', () => {
    it('should register a post processor', () => {
      expect(() => {
        MarkdownPreviewRenderer.registerPostProcessor(postProcessor);
      }).not.toThrow();
    });

    it('should unregister a post processor', () => {
      MarkdownPreviewRenderer.registerPostProcessor(postProcessor);
      expect(() => {
        MarkdownPreviewRenderer.unregisterPostProcessor(postProcessor);
      }).not.toThrow();
    });
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      const renderer = new MarkdownPreviewRenderer(null, createDiv(), createDiv(), null);
      expect(renderer).toBeInstanceOf(MarkdownPreviewRenderer);
    });

    it('should accept optional observeInsertion parameter', () => {
      const renderer = new MarkdownPreviewRenderer(null, createDiv(), createDiv(), null, true);
      expect(renderer).toBeInstanceOf(MarkdownPreviewRenderer);
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const renderer = new MarkdownPreviewRenderer(null, createDiv(), createDiv(), null);
      const original: MarkdownPreviewRendererOriginal = renderer.asOriginalType__();
      expect(original).toBe(renderer);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const renderer = new MarkdownPreviewRenderer(null, createDiv(), createDiv(), null);
      const mock = MarkdownPreviewRenderer.fromOriginalType__(renderer.asOriginalType__());
      expect(mock).toBe(renderer);
    });
  });
});
