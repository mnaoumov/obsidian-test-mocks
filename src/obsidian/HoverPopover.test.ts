import type {
  HoverParent as HoverParentOriginal,
  HoverPopover as HoverPopoverOriginal
} from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { castTo } from '../internal/cast.ts';
import { HoverPopover } from './HoverPopover.ts';

describe('HoverPopover', () => {
  function createParent(): HoverParentOriginal {
    return { hoverPopover: null };
  }

  function createPopover(): HoverPopover {
    return HoverPopover.create2__(createParent(), createDiv());
  }

  it('should create an instance via create2__', () => {
    const popover = createPopover();
    expect(popover).toBeInstanceOf(HoverPopover);
  });

  it('should throw when accessing an unmocked property', () => {
    const popover = createPopover();
    const record = castTo<Record<string, unknown>>(popover);
    expect(() => record['nonExistentProperty']).toThrow(
      'Property "nonExistentProperty" is not mocked in HoverPopover. To override, assign a value first: mock.nonExistentProperty = ...'
    );
  });

  it('should initialize hoverEl as an HTML element', () => {
    const popover = createPopover();
    expect(popover.hoverEl).toBeInstanceOf(HTMLElement);
  });

  it('should initialize state to 0', () => {
    const popover = createPopover();
    expect(popover.state).toBe(0);
  });

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original obsidian type', () => {
      const popover = createPopover();
      const original: HoverPopoverOriginal = popover.asOriginalType2__();
      expect(original).toBe(popover);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const popover = createPopover();
      const mock = HoverPopover.fromOriginalType2__(popover.asOriginalType2__());
      expect(mock).toBe(popover);
    });
  });

  describe('forLeaf__', () => {
    it('should return null', () => {
      const result = HoverPopover.forLeaf__({} as never);
      expect(result).toBeNull();
    });
  });

  describe('create2__ with optional parameters', () => {
    it('should accept null targetEl', () => {
      const popover = HoverPopover.create2__(createParent(), null);
      expect(popover).toBeInstanceOf(HoverPopover);
    });

    it('should accept waitTime and staticPos', () => {
      const WAIT_TIME = 300;
      const popover = HoverPopover.create2__(createParent(), createDiv(), WAIT_TIME, { x: 0, y: 0 });
      expect(popover).toBeInstanceOf(HoverPopover);
    });
  });
});
