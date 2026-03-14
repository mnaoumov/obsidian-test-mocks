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
    wrapper.appendChild(fragment);
    expect(wrapper.innerHTML).toContain('bold');
  });
});
