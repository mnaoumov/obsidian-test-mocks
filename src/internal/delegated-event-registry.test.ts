import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import {
  delegatedOff,
  delegatedOn
} from './delegated-event-registry.ts';

describe('delegatedOn', () => {
  it('should register an event listener', () => {
    const target = document.createElement('div');
    const listener = vi.fn();
    delegatedOn(target, 'click', listener);
    target.dispatchEvent(new Event('click'));
    expect(listener).toHaveBeenCalledOnce();
  });

  it('should pass the event and delegate target to the listener', () => {
    const target = document.createElement('div');
    const listener = vi.fn();
    delegatedOn(target, 'click', listener);
    const event = new Event('click');
    target.dispatchEvent(event);
    expect(listener).toHaveBeenCalledWith(event, expect.anything());
  });
});

describe('delegatedOff', () => {
  it('should remove a previously registered listener', () => {
    const target = document.createElement('div');
    const listener = vi.fn();
    delegatedOn(target, 'click', listener);
    delegatedOff(target, 'click', listener);
    target.dispatchEvent(new Event('click'));
    expect(listener).not.toHaveBeenCalled();
  });

  it('should not throw when removing a listener that was never added', () => {
    const target = document.createElement('div');
    expect(() => {
      delegatedOff(target, 'click', vi.fn());
    }).not.toThrow();
  });

  it('should not throw when type has no listeners', () => {
    const target = document.createElement('div');
    delegatedOn(target, 'focus', vi.fn());
    expect(() => {
      delegatedOff(target, 'click', vi.fn());
    }).not.toThrow();
  });
});
