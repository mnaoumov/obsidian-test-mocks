import {
  describe,
  expect,
  it
} from 'vitest';

import {
  setupUIEventPrototype,
  teardownUIEventPrototype
} from './ui-event-setup.ts';

describe('UIEvent.prototype', () => {
  it('should expose win as the global window', () => {
    const event = new UIEvent('click');
    expect(event.win).toBe(window);
  });

  it('should expose doc as the window document', () => {
    const event = new UIEvent('click');
    expect(event.doc).toBe(window.document);
  });

  it('should expose targetNode as the event target when it is a node', () => {
    const target = document.createElement('div');
    const event = new MouseEvent('click');
    target.dispatchEvent(event);
    expect(event.targetNode).toBe(target);
  });

  it('should expose targetNode as null when there is no node target', () => {
    const event = new UIEvent('click');
    expect(event.targetNode).toBeNull();
  });

  it('should report instanceOf for matching constructors', () => {
    const event = new MouseEvent('click');
    expect(event.instanceOf(MouseEvent)).toBe(true);
    expect(event.instanceOf(KeyboardEvent)).toBe(false);
  });

  describe('teardownUIEventPrototype', () => {
    it('should remove the members, and setup should restore them', () => {
      teardownUIEventPrototype();
      expect('win' in UIEvent.prototype).toBe(false);
      setupUIEventPrototype();
      expect('win' in UIEvent.prototype).toBe(true);
    });
  });
});
