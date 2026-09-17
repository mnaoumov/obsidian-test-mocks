import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { iconRegistry } from '../../internal/icon-registry.ts';
import { addIcon } from './addIcon.ts';
import { getIcon } from './getIcon.ts';

afterEach(() => {
  iconRegistry.clear();
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

describe('getIcon element shape', () => {
  it('should build an svg with a 100-unit view box, the content and the icon classes', () => {
    addIcon('my-icon', '<path d="M0 0"></path>');
    const svg = getIcon('my-icon');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 100 100');
    expect(svg?.innerHTML).toBe('<path d="M0 0"></path>');
    expect(svg?.classList.contains('svg-icon')).toBe(true);
    expect(svg?.classList.contains('my-icon')).toBe(true);
  });

  it('should return a new element on each call', () => {
    addIcon('my-icon', '');
    expect(getIcon('my-icon')).not.toBe(getIcon('my-icon'));
  });

  it('should return null for a built-in Lucide id the mock does not bundle', () => {
    expect(getIcon('lucide-file')).toBeNull();
  });
});
