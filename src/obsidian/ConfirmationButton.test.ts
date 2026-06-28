import type { ConfirmationButton as ConfirmationButtonOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { ConfirmationButton } from './ConfirmationButton.ts';

describe('ConfirmationButton', () => {
  it('should create an instance via create2__', () => {
    const button = ConfirmationButton.create2__(createDiv());
    expect(button).toBeInstanceOf(ConfirmationButton);
  });

  describe('onClick', () => {
    it('should register a click handler and return this', () => {
      const button = ConfirmationButton.create2__(createDiv());
      const handler = vi.fn();
      const result = button.onClick(handler);
      expect(result).toBe(button);
      button.simulateClick__();
      expect(handler).toHaveBeenCalledOnce();
    });
  });

  describe('setCancel', () => {
    it('should return this', () => {
      const button = ConfirmationButton.create2__(createDiv());
      expect(button.setCancel()).toBe(button);
    });
  });

  describe('setInitialFocus', () => {
    it('should return this', () => {
      const button = ConfirmationButton.create2__(createDiv());
      expect(button.setInitialFocus()).toBe(button);
    });
  });

  describe('setSecondary', () => {
    it('should return this', () => {
      const button = ConfirmationButton.create2__(createDiv());
      expect(button.setSecondary()).toBe(button);
    });
  });

  describe('asOriginalType3__', () => {
    it('should return the same instance typed as the original', () => {
      const button = ConfirmationButton.create2__(createDiv());
      const original: ConfirmationButtonOriginal = button.asOriginalType3__();
      expect(original).toBe(button);
    });
  });

  describe('fromOriginalType3__', () => {
    it('should return the same instance typed as the mock type', () => {
      const button = ConfirmationButton.create2__(createDiv());
      const mock = ConfirmationButton.fromOriginalType3__(button.asOriginalType3__());
      expect(mock).toBe(button);
    });
  });
});
