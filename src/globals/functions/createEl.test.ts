import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { createEl } from './createEl.ts';

describe('createEl', () => {
  it('should create an element with the given tag', () => {
    const el = createEl('div');
    expect(el.tagName).toBe('DIV');
  });

  it('should set className when passed a string', () => {
    const el = createEl('div', 'my-class');
    expect(el.className).toBe('my-class');
  });

  it('should set className from DomElementInfo with string cls', () => {
    const el = createEl('div', { cls: 'info-cls' });
    expect(el.className).toBe('info-cls');
  });

  it('should set className from DomElementInfo with array cls', () => {
    const el = createEl('div', { cls: ['cls-a', 'cls-b'] });
    expect(el.className).toBe('cls-a cls-b');
  });

  it('should set title', () => {
    const el = createEl('div', { title: 'my title' });
    expect(el.title).toBe('my title');
  });

  it('should set href attribute', () => {
    const el = createEl('a', { href: 'https://example.com' });
    expect(el.getAttribute('href')).toBe('https://example.com');
  });

  it('should set placeholder', () => {
    const el = createEl('input', { placeholder: 'Enter text' });
    expect(el.placeholder).toBe('Enter text');
  });

  it('should set type', () => {
    const el = createEl('input', { type: 'password' });
    expect(el.type).toBe('password');
  });

  it('should set value', () => {
    const el = createEl('input', { value: 'hello' });
    expect(el.value).toBe('hello');
  });

  it('should set text content from string', () => {
    const el = createEl('div', { text: 'hello world' });
    expect(el.textContent).toBe('hello world');
  });

  it('should append text as DocumentFragment', () => {
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createTextNode('frag text'));
    const el = createEl('div', { text: frag });
    expect(el.textContent).toBe('frag text');
  });

  it('should set arbitrary attributes', () => {
    const el = createEl('div', { attr: { 'aria-label': 'test', 'data-id': '123' } });
    expect(el.getAttribute('data-id')).toBe('123');
    expect(el.getAttribute('aria-label')).toBe('test');
  });

  it('should remove attribute when value is null', () => {
    const el = createEl('div', { attr: { 'data-remove': null } });
    expect(el.getAttribute('data-remove')).toBeNull();
  });

  it('should convert numeric attribute values to strings', () => {
    const el = createEl('div', { attr: { tabindex: 0 } });
    expect(el.getAttribute('tabindex')).toBe('0');
  });

  it('should append to parent', () => {
    const parent = document.createElement('div');
    const el = createEl('span', { parent });
    expect(parent.lastChild).toBe(el);
  });

  it('should prepend to parent when prepend is true', () => {
    const parent = document.createElement('div');
    const existing = document.createElement('span');
    parent.appendChild(existing);
    const el = createEl('div', { parent, prepend: true });
    expect(parent.firstChild).toBe(el);
  });

  it('should invoke the callback with the element', () => {
    const callback = vi.fn();
    const el = createEl('div', undefined, callback);
    expect(callback).toHaveBeenCalledWith(el);
  });

  it('should handle empty options object', () => {
    const el = createEl('div', {});
    expect(el.tagName).toBe('DIV');
  });
});
