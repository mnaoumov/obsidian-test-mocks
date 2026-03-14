import type { Events as EventsOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { Events } from '../../src/obsidian/Events.ts';

describe('Events', () => {
  it('should create an instance via create__', () => {
    const events = Events.create__();
    expect(events).toBeInstanceOf(Events);
  });

  it('should throw when accessing an unmocked property', () => {
    const events = Events.create__();
    const record = events as unknown as Record<string, unknown>;
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

  describe('on', () => {
    it('should register a callback and return an event ref', () => {
      const events = Events.create__();
      const cb = vi.fn();
      const ref = events.on('test-event', cb);
      expect(ref).toBeDefined();
      // EventRef has a name property at runtime even though the obsidian type does not expose it
      const refRecord = ref as unknown as Record<string, unknown>;
      expect(refRecord['name']).toBe('test-event');
    });
  });

  describe('trigger', () => {
    it('should invoke registered callbacks with provided data', () => {
      const events = Events.create__();
      const cb = vi.fn();
      events.on('test-event', cb);
      events.trigger('test-event', 'arg1', 'arg2');
      expect(cb).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should not throw when triggering an event with no listeners', () => {
      const events = Events.create__();
      expect(() => {
        events.trigger('no-listeners');
      }).not.toThrow();
    });

    it('should invoke callback with context when ctx is provided', () => {
      const events = Events.create__();
      const ctx = { value: 'context' };
      const cb = vi.fn(function getContext(this: unknown) {
        return this;
      });
      events.on('ctx-event', cb, ctx);
      events.trigger('ctx-event');
      expect(cb.mock.instances[0]).toBe(ctx);
    });
  });

  describe('off', () => {
    it('should remove a registered callback', () => {
      const events = Events.create__();
      const cb = vi.fn();
      events.on('test-event', cb);
      events.off('test-event', cb);
      events.trigger('test-event');
      expect(cb).not.toHaveBeenCalled();
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
      const cb = vi.fn();
      const ref = events.on('test-event', cb);
      events.offref(ref);
      events.trigger('test-event');
      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe('tryTrigger', () => {
    it('should invoke the callback from the event ref with provided args', () => {
      const events = Events.create__();
      const cb = vi.fn();
      const ref = events.on('test-event', cb);
      events.tryTrigger(ref, ['data1', 'data2']);
      expect(cb).toHaveBeenCalledWith('data1', 'data2');
    });
  });
});
