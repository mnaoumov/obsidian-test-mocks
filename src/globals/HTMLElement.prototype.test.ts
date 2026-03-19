import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import {
  find,
  findAll,
  findAllSelf,
  hide,
  innerHeight,
  innerWidth,
  isShown,
  off,
  on,
  onClickEvent,
  onNodeInserted,
  onWindowMigrated,
  setCssProps,
  setCssStyles,
  show,
  toggle,
  toggleVisibility,
  trigger
} from './HTMLElement.prototype.ts';

describe('HTMLElement.prototype extensions', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('find', () => {
    it('should return the matching child element', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      child.className = 'target';
      parent.appendChild(child);
      expect(find.call(parent, '.target')).toBe(child);
    });

    it('should throw when no element matches', () => {
      const el = document.createElement('div');
      expect(() => find.call(el, '.missing')).toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all matching children', () => {
      const parent = document.createElement('div');
      const items = [document.createElement('span'), document.createElement('span')];
      for (const item of items) {
        item.className = 'item';
        parent.appendChild(item);
      }
      expect(findAll.call(parent, '.item')).toHaveLength(items.length);
    });
  });

  describe('findAllSelf', () => {
    it('should include self when it matches', () => {
      const el = document.createElement('div');
      el.className = 'self';
      const results = findAllSelf.call(el, '.self');
      expect(results[0]).toBe(el);
    });

    it('should not include self when it does not match', () => {
      const el = document.createElement('div');
      const results = findAllSelf.call(el, '.other');
      expect(results).toHaveLength(0);
    });
  });

  describe('hide / show / isShown / toggle', () => {
    it('should hide the element', () => {
      const el = document.createElement('div');
      hide.call(el);
      expect(el.style.display).toBe('none');
    });

    it('should show the element', () => {
      const el = document.createElement('div');
      el.style.display = 'none';
      show.call(el);
      expect(el.style.display).toBe('');
    });

    it('should report shown state based on offsetParent', () => {
      const el = document.createElement('div');
      expect(isShown.call(el)).toBe(false);
      Object.defineProperty(el, 'offsetParent', { configurable: true, value: document.body });
      expect(isShown.call(el)).toBe(true);
    });

    it('should toggle display', () => {
      const el = document.createElement('div');
      toggle.call(el, false);
      expect(el.style.display).toBe('none');
      toggle.call(el, true);
      expect(el.style.display).toBe('');
    });
  });

  describe('toggleVisibility', () => {
    it('should set visibility to visible', () => {
      const el = document.createElement('div');
      toggleVisibility.call(el, true);
      expect(el.style.visibility).toBe('visible');
    });

    it('should set visibility to hidden', () => {
      const el = document.createElement('div');
      toggleVisibility.call(el, false);
      expect(el.style.visibility).toBe('hidden');
    });
  });

  describe('innerHeight / innerWidth', () => {
    it('should return clientHeight', () => {
      const el = document.createElement('div');
      expect(innerHeight.call(el)).toBe(el.clientHeight);
    });

    it('should return clientWidth', () => {
      const el = document.createElement('div');
      expect(innerWidth.call(el)).toBe(el.clientWidth);
    });
  });

  describe('on / off', () => {
    it('should register and invoke a delegated listener', () => {
      const el = document.createElement('div');
      const listener = vi.fn();
      on.call(el, 'click', 'span', listener);
      el.dispatchEvent(new Event('click'));
      expect(listener).toHaveBeenCalledOnce();
    });

    it('should unregister a delegated listener', () => {
      const el = document.createElement('div');
      const listener = vi.fn();
      on.call(el, 'click', 'span', listener);
      off.call(el, 'click', 'span', listener);
      el.dispatchEvent(new Event('click'));
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('onClickEvent', () => {
    it('should invoke the listener on click', () => {
      const el = document.createElement('div');
      const listener = vi.fn();
      onClickEvent.call(el, listener);
      el.click();
      expect(listener).toHaveBeenCalledOnce();
    });
  });

  describe('onNodeInserted', () => {
    it('should invoke the listener immediately', () => {
      const el = document.createElement('div');
      const listener = vi.fn();
      onNodeInserted(el, listener);
      expect(listener).toHaveBeenCalledOnce();
    });

    it('should return a cleanup function that does not throw', () => {
      const el = document.createElement('div');
      const cleanup = onNodeInserted(el, vi.fn());
      expect(typeof cleanup).toBe('function');
      cleanup();
      expect(true).toBe(true);
    });
  });

  describe('onWindowMigrated', () => {
    it('should return a cleanup function that does not throw', () => {
      const el = document.createElement('div');
      const cleanup = onWindowMigrated(el, vi.fn());
      expect(typeof cleanup).toBe('function');
      cleanup();
      expect(true).toBe(true);
    });
  });

  describe('setCssProps', () => {
    it('should set CSS custom properties', () => {
      const el = document.createElement('div');
      setCssProps.call(el, { '--color': 'red', '--size': '12px' });
      expect(el.style.getPropertyValue('--color')).toBe('red');
      expect(el.style.getPropertyValue('--size')).toBe('12px');
    });
  });

  describe('setCssStyles', () => {
    it('should assign style properties', () => {
      const el = document.createElement('div');
      setCssStyles.call(el, { color: 'blue', fontSize: '14px' });
      expect(el.style.color).toBe('blue');
      expect(el.style.fontSize).toBe('14px');
    });
  });

  describe('trigger', () => {
    it('should dispatch a custom event', () => {
      const el = document.createElement('div');
      const listener = vi.fn();
      el.addEventListener('my-event', listener);
      trigger.call(el, 'my-event');
      expect(listener).toHaveBeenCalledOnce();
    });
  });
});
