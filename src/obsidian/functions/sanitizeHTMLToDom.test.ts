import {
  describe,
  expect,
  it
} from 'vitest';

import { sanitizeHTMLToDom } from './sanitizeHTMLToDom.ts';

describe('sanitizeHTMLToDom', () => {
  it('should return a DocumentFragment', () => {
    const fragment = sanitizeHTMLToDom('<b>bold</b>');
    expect(fragment).toBeInstanceOf(DocumentFragment);
  });

  it('should contain the HTML content', () => {
    const fragment = sanitizeHTMLToDom('<b>bold</b>');
    const wrapper = createDiv();
    wrapper.append(fragment);
    expect(wrapper.innerHTML).toContain('bold');
  });
});

describe('sanitizeHTMLToDom sanitizing', () => {
  it('should strip scripts and event handlers', () => {
    const wrapper = createDiv();
    wrapper.append(sanitizeHTMLToDom('<img src="a.png" onerror="alert(1)"><script>alert(2)</script>'));
    expect(wrapper.innerHTML).toBe('<img src="a.png">');
  });

  it('should open links in a new window', () => {
    const wrapper = createDiv();
    wrapper.append(sanitizeHTMLToDom('<a href="https://example.com">x</a>'));
    expect(wrapper.querySelector('a')?.getAttribute('target')).toBe('_blank');
  });
});
