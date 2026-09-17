import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { castTo } from './castTo.ts';
import {
  delegatedOff,
  delegatedOn
} from './delegated-event-registry.ts';

interface EventsHolder {
  _EVENTS?: Record<string, unknown[]>;
}

interface Tree {
  button: HTMLElement;
  icon: HTMLElement;
  root: HTMLElement;
}

function click(target: EventTarget): Event {
  const event = new Event('click', { bubbles: true });
  target.dispatchEvent(event);
  return event;
}

function createTree(): Tree {
  const root = document.createElement('div');
  const button = document.createElement('button');
  button.className = 'action';
  const icon = document.createElement('span');
  button.append(icon);
  root.append(button);
  return { button, icon, root };
}

describe('delegatedOn', () => {
  it('should call the listener with the target, the event and the matching ancestor', () => {
    const { button, icon, root } = createTree();
    const listener = vi.fn(function getThis(this: unknown) {
      return this;
    });
    delegatedOn(root, 'click', '.action', listener);
    const event = click(icon);
    expect(listener).toHaveBeenCalledExactlyOnceWith(event, button);
    expect(listener.mock.instances[0]).toBe(root);
  });

  it('should not call the listener when nothing up to the target matches', () => {
    const { icon, root } = createTree();
    const listener = vi.fn();
    delegatedOn(root, 'click', '.missing', listener);
    click(icon);
    click(root);
    expect(listener).not.toHaveBeenCalled();
  });

  it('should not match ancestors above the listening target', () => {
    const { icon } = createTree();
    const listener = vi.fn();
    delegatedOn(icon, 'click', '.action', listener);
    click(icon);
    expect(listener).not.toHaveBeenCalled();
  });

  it('should ignore events whose target has no matchParent', () => {
    const listener = vi.fn();
    const target = new EventTarget();
    delegatedOn(target, 'click', '*', listener);
    click(target);
    expect(listener).not.toHaveBeenCalled();
  });

  it('should keep each registration in _EVENTS and call a listener registered twice twice', () => {
    const { icon, root } = createTree();
    const listener = vi.fn();
    delegatedOn(root, 'click', '.action', listener);
    delegatedOn(root, 'click', '.action', listener);
    expect(castTo<EventsHolder>(root)._EVENTS?.['click']).toHaveLength(2);
    click(icon);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});

describe('delegatedOff', () => {
  it('should remove every registration with the same selector, listener and options', () => {
    const { icon, root } = createTree();
    const listener = vi.fn();
    delegatedOn(root, 'click', '.action', listener);
    delegatedOn(root, 'click', '.action', listener);
    delegatedOff(root, 'click', '.action', listener);
    click(icon);
    expect(listener).not.toHaveBeenCalled();
    expect(castTo<EventsHolder>(root)._EVENTS?.['click']).toEqual([]);
  });

  it('should keep registrations with a different selector, listener or options', () => {
    const { icon, root } = createTree();
    const listener = vi.fn();
    const otherListener = vi.fn();
    const options = { capture: false };
    delegatedOn(root, 'click', '.action', listener);
    delegatedOn(root, 'click', 'button', listener);
    delegatedOn(root, 'click', '.action', otherListener);
    delegatedOn(root, 'click', '.action', listener, options);
    delegatedOff(root, 'click', '.action', listener);
    click(icon);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(otherListener).toHaveBeenCalledOnce();
  });

  it('should not throw when the target has no registrations', () => {
    const target = document.createElement('div');
    expect(() => {
      delegatedOff(target, 'click', '*', vi.fn());
    }).not.toThrow();
  });

  it('should not throw when the type has no registrations', () => {
    const target = document.createElement('div');
    delegatedOn(target, 'focus', '*', vi.fn());
    expect(() => {
      delegatedOff(target, 'click', '*', vi.fn());
    }).not.toThrow();
  });
});
