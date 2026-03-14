import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { createSpan } from './createSpan.ts';

describe('createSpan', () => {
  it('should create a span element', () => {
    const span = createSpan();
    expect(span.tagName).toBe('SPAN');
  });

  it('should set className when passed a string', () => {
    const span = createSpan('my-class');
    expect(span.className).toBe('my-class');
  });

  it('should set className from DomElementInfo', () => {
    const span = createSpan({ cls: 'info-class' });
    expect(span.className).toBe('info-class');
  });

  it('should invoke the callback with the span', () => {
    const callback = vi.fn();
    const span = createSpan(undefined, callback);
    expect(callback).toHaveBeenCalledWith(span);
  });
});
