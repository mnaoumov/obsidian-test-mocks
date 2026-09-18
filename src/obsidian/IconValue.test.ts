import type { IconValue as IconValueOriginal } from 'obsidian';

import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { iconRegistry } from '../internal/icon-registry.ts';
import { App } from './App.ts';
import { addIcon } from './functions/addIcon.ts';
import { IconValue } from './IconValue.ts';
import { RenderContext } from './RenderContext.ts';

afterEach(() => {
  iconRegistry.clear();
});

describe('IconValue', () => {
  it('should carry the image icon', () => {
    expect(new IconValue().icon).toBe('lucide-image');
  });

  it('should create an instance via create2__', () => {
    const value = IconValue.create2__('icon-name');
    expect(value).toBeInstanceOf(IconValue);
  });

  it('should default to empty string', () => {
    const value = IconValue.create2__();
    expect(value.data).toBe('');
  });

  describe('asOriginalType5__', () => {
    it('should return the same instance typed as the original', () => {
      const value = IconValue.create2__();
      const original: IconValueOriginal = value.asOriginalType5__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType5__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = IconValue.create2__();
      const mock = IconValue.fromOriginalType5__(value.asOriginalType5__());
      expect(mock).toBe(value);
    });
  });

  describe('renderTo', () => {
    it('should append the registered icon for its id', () => {
      addIcon('render-me', '<circle r="5"/>');
      const el = createDiv();
      new IconValue('render-me').renderTo(el, RenderContext.create__(App.createConfigured__()));

      const svgEl = el.firstElementChild;
      expect(svgEl?.tagName.toLowerCase()).toBe('svg');
      expect(svgEl?.classList.contains('render-me')).toBe(true);
    });

    it('should fall back to question-mark-glyph for an unknown id', () => {
      addIcon('question-mark-glyph', '<rect width="10" height="10"/>');
      const el = createDiv();
      new IconValue('nothing-registered').renderTo(el, RenderContext.create__(App.createConfigured__()));
      expect(el.firstElementChild?.classList.contains('question-mark-glyph')).toBe(true);
    });

    it('should render nothing when neither the id nor the fallback resolves, which the empty registry makes the default', () => {
      const el = createDiv();
      new IconValue('lucide-file').renderTo(el, RenderContext.create__(App.createConfigured__()));
      expect(el.childNodes).toHaveLength(0);
    });
  });
});
