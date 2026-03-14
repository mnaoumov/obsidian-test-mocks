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
} from '../../src/globals/Document.prototype.ts';

describe('Document.prototype extensions', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('on / off', () => {
    it('should register and invoke a delegated event listener', () => {
      const listener = vi.fn();
      on.call(document, 'click', 'div', listener);
      document.dispatchEvent(new Event('click'));
      expect(listener).toHaveBeenCalledOnce();
    });

    it('should unregister a delegated event listener', () => {
      const listener = vi.fn();
      on.call(document, 'click', 'div', listener);
      off.call(document, 'click', 'div', listener);
      document.dispatchEvent(new Event('click'));
      expect(listener).not.toHaveBeenCalled();
    });

    it('should not throw when removing a listener that was never registered', () => {
      const listener = vi.fn();
      off.call(document, 'click', 'div', listener);
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
