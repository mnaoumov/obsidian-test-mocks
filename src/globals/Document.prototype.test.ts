import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import {
  off,
  on
} from './Document.prototype.ts';

describe('Document.prototype extensions', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  describe('on / off', () => {
    it('should register and invoke a delegated event listener for a matching target', () => {
      const listener = vi.fn();
      const div = document.body.createDiv();
      on.call(document, 'click', 'div', listener);
      div.dispatchEvent(new Event('click', { bubbles: true }));
      expect(listener).toHaveBeenCalledExactlyOnceWith(expect.any(Event), div);
      off.call(document, 'click', 'div', listener);
    });

    it('should unregister a delegated event listener', () => {
      const listener = vi.fn();
      const div = document.body.createDiv();
      on.call(document, 'click', 'div', listener);
      off.call(document, 'click', 'div', listener);
      div.dispatchEvent(new Event('click', { bubbles: true }));
      expect(listener).not.toHaveBeenCalled();
    });

    it('should not throw when removing a listener that was never registered', () => {
      const listener = vi.fn();
      off.call(document, 'click', 'div', listener);
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
