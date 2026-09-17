import type {
  EventRef as EventRefOriginal,
  Events as EventsOriginal
} from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { strictProxy } from '../internal/strict-proxy.ts';
import { ensureGenericObject } from '../internal/type-guards.ts';
import { Events } from './Events.ts';

describe('Events', () => {
  it('should create an instance via create__', () => {
    const events = Events.create__();
    expect(events).toBeInstanceOf(Events);
  });

  it('should throw when accessing an unmocked property', () => {
    const events = Events.create__();
    const record = ensureGenericObject(events);
    expect(() => record['nonExistentProperty']).toThrow(
      'Property "nonExistentProperty" is not mocked in Events. To override, assign a value first: mock.nonExistentProperty = ...'
    );
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original obsidian type', () => {
      const events = Events.create__();
      const original: EventsOriginal = events.asOriginalType__();
      expect(original).toBe(events);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const events = Events.create__();
      const mock = Events.fromOriginalType__(events.asOriginalType__());
      expect(mock).toBe(events);
    });
  });

  describe('on', () => {
    it('should register a callback and return an event ref', () => {
      const events = Events.create__();
      const callback = vi.fn();
      const ref = events.on('test-event', callback);
      expect(ref).toBeDefined();
      // EventRef has a name property at runtime even though the obsidian type does not expose it
      const refRecord = ensureGenericObject(ref);
      expect(refRecord['name']).toBe('test-event');
      expect(events._['test-event']?.[0]).toBe(ref);
    });
  });

  describe('trigger', () => {
    it('should invoke registered callbacks with provided data', () => {
      const events = Events.create__();
      const callback = vi.fn();
      events.on('test-event', callback);
      events.trigger('test-event', 'arg1', 'arg2');
      expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should keep calling later handlers when one throws', () => {
      vi.useFakeTimers();
      try {
        const events = Events.create__();
        const callback = vi.fn();
        events.on('test-event', () => {
          throw new Error('handler failed');
        });
        events.on('test-event', callback);
        events.trigger('test-event');
        expect(callback).toHaveBeenCalled();
        expect(() => {
          vi.runAllTimers();
        }).toThrow('handler failed');
      } finally {
        vi.useRealTimers();
      }
    });

    it('should iterate a copy of the handlers', () => {
      const events = Events.create__();
      const lateCallback = vi.fn();
      events.on('test-event', () => {
        events.on('test-event', lateCallback);
      });
      events.trigger('test-event');
      expect(lateCallback).not.toHaveBeenCalled();
    });

    it('should not throw when triggering an event with no listeners', () => {
      const events = Events.create__();
      expect(() => {
        events.trigger('no-listeners');
      }).not.toThrow();
    });

    it('should invoke callback with context when ctx is provided', () => {
      const events = Events.create__();
      const context = { value: 'context' };
      const callback = vi.fn(function getContext(this: unknown) {
        return this;
      });
      events.on('ctx-event', callback, context);
      events.trigger('ctx-event');
      expect(callback.mock.instances[0]).toBe(context);
    });
  });

  describe('off', () => {
    it('should remove a registered callback', () => {
      const events = Events.create__();
      const callback = vi.fn();
      events.on('test-event', callback);
      events.off('test-event', callback);
      events.trigger('test-event');
      expect(callback).not.toHaveBeenCalled();
    });

    it('should drop the event entry list once it is empty', () => {
      const events = Events.create__();
      const callback = vi.fn();
      const otherCallback = vi.fn();
      events.on('test-event', callback);
      events.on('test-event', otherCallback);
      events.off('test-event', callback);
      expect(events._['test-event']).toHaveLength(1);
      events.off('test-event', otherCallback);
      expect('test-event' in events._).toBe(false);
    });

    it('should not throw when removing from a non-existent event', () => {
      const events = Events.create__();
      expect(() => {
        events.off('missing', vi.fn());
      }).not.toThrow();
    });
  });

  describe('offref', () => {
    it('should remove a callback by event ref', () => {
      const events = Events.create__();
      const callback = vi.fn();
      const ref = events.on('test-event', callback);
      events.offref(ref);
      events.trigger('test-event');
      expect(callback).not.toHaveBeenCalled();
    });

    it('should remove only the registration the ref was returned for', () => {
      const events = Events.create__();
      const callback = vi.fn();
      const ref = events.on('test-event', callback);
      events.on('test-event', callback);
      events.offref(ref);
      events.trigger('test-event');
      expect(callback).toHaveBeenCalledTimes(1);
      events.offref(ref);
      expect(events._['test-event']).toHaveLength(1);
    });

    it('should ignore a ref for an event with no handlers', () => {
      const events = Events.create__();
      const ref = Events.create__().on('test-event', vi.fn());
      expect(() => {
        events.offref(ref);
      }).not.toThrow();
    });

    it('should not throw when event ref has no name or fn', () => {
      const events = Events.create__();
      // eslint-disable-next-line unicorn/name-replacements -- `fn` is the member name on Obsidian's own `EventRef`, which is what this literal stands in for.
      const emptyRef = strictProxy<EventRefOriginal>({ fn: undefined, name: undefined });
      expect(() => {
        events.offref(emptyRef);
      }).not.toThrow();
    });
  });

  describe('tryTrigger', () => {
    it('should invoke the callback from the event ref with provided args', () => {
      const events = Events.create__();
      const callback = vi.fn();
      const ref = events.on('test-event', callback);
      events.tryTrigger(ref, ['data1', 'data2']);
      expect(callback).toHaveBeenCalledWith('data1', 'data2');
    });

    it('should call the handler with the registered context', () => {
      const events = Events.create__();
      const context = { value: 'context' };
      const callback = vi.fn(function getContext(this: unknown) {
        return this;
      });
      const ref = events.on('test-event', callback, context);
      events.tryTrigger(ref, []);
      expect(callback.mock.instances[0]).toBe(context);
    });

    it('should rethrow a handler error from a timeout instead of propagating it', () => {
      vi.useFakeTimers();
      try {
        const events = Events.create__();
        const error = new Error('handler failed');
        const ref = events.on('test-event', () => {
          throw error;
        });
        expect(() => {
          events.tryTrigger(ref, []);
        }).not.toThrow();
        expect(() => {
          vi.runAllTimers();
        }).toThrow(error);
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
