import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { iconRegistry } from '../../../src/internal/icon-registry.ts';
import { addIcon } from '../../../src/obsidian/functions/addIcon.ts';
import { getIcon } from '../../../src/obsidian/functions/getIcon.ts';
import { getIconIds } from '../../../src/obsidian/functions/getIconIds.ts';
import { removeIcon } from '../../../src/obsidian/functions/removeIcon.ts';
import { setIcon } from '../../../src/obsidian/functions/setIcon.ts';

afterEach(() => {
  iconRegistry.clear();
});

describe('addIcon', () => {
  it('should add an icon to the registry', () => {
    addIcon('my-icon', '<path d="M0 0"/>');
    expect(iconRegistry.has('my-icon')).toBe(true);
  });
});

describe('removeIcon', () => {
  it('should remove an icon from the registry', () => {
    addIcon('my-icon', '<path d="M0 0"/>');
    removeIcon('my-icon');
    expect(iconRegistry.has('my-icon')).toBe(false);
  });

  it('should not throw when removing a non-existent icon', () => {
    expect(() => {
      removeIcon('non-existent');
    }).not.toThrow();
  });
});

describe('getIcon', () => {
  it('should return an SVG element for a registered icon', () => {
    addIcon('test-icon', '<circle r="5"/>');
    const svg = getIcon('test-icon');
    expect(svg).not.toBeNull();
    expect(svg?.tagName.toLowerCase()).toBe('svg');
  });

  it('should return null for a non-existent icon', () => {
    expect(getIcon('missing')).toBeNull();
  });
});

describe('getIconIds', () => {
  it('should return all registered icon IDs', () => {
    addIcon('alpha', '<path/>');
    addIcon('beta', '<path/>');
    const ids = getIconIds();
    expect(ids).toContain('alpha');
    expect(ids).toContain('beta');
  });

  it('should return empty array when no icons registered', () => {
    expect(getIconIds()).toEqual([]);
  });
});

describe('setIcon', () => {
  it('should set the icon content on a parent element', () => {
    addIcon('my-icon', '<b>icon</b>');
    const el = createDiv();
    el.textContent = 'old content';
    setIcon(el, 'my-icon');
    expect(el.textContent).not.toBe('old content');
  });

  it('should do nothing when icon is not registered', () => {
    const el = createDiv();
    el.textContent = 'original';
    setIcon(el, 'missing');
    expect(el.textContent).toBe('original');
  });
});
