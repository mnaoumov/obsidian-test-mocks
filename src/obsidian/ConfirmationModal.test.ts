import type { ConfirmationModal as ConfirmationModalOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { App } from './App.ts';
import { ConfirmationModal } from './ConfirmationModal.ts';

function createModal(): ConfirmationModal {
  const app = App.createConfigured__();
  return ConfirmationModal.create2__(app);
}

describe('ConfirmationModal', () => {
  it('should create an instance with buttonContainerEl', () => {
    const modal = createModal();
    expect(modal).toBeInstanceOf(ConfirmationModal);
    expect(modal.buttonContainerEl).toBeInstanceOf(HTMLElement);
  });

  describe('addButton', () => {
    it('should invoke the callback with a ConfirmationButton and return this', () => {
      const modal = createModal();
      const cb = vi.fn();
      const result = modal.addButton(cb);
      expect(cb).toHaveBeenCalledOnce();
      expect(result).toBe(modal);
    });
  });

  describe('addCancelButton', () => {
    it('should return this', () => {
      const modal = createModal();
      expect(modal.addCancelButton('Cancel')).toBe(modal);
    });
  });

  describe('addCheckbox', () => {
    it('should invoke the callback when the checkbox changes', () => {
      const modal = createModal();
      const cb = vi.fn();
      modal.addCheckbox('Enable', cb);
      const checkbox = modal.contentEl.querySelector('input');
      expect(checkbox).not.toBeNull();
      if (checkbox) {
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('change'));
      }
      expect(cb).toHaveBeenCalledWith(true);
    });

    it('should return this', () => {
      const modal = createModal();
      expect(modal.addCheckbox('x', vi.fn())).toBe(modal);
    });
  });

  describe('addClass', () => {
    it('should add a class to containerEl and return this', () => {
      const modal = createModal();
      const result = modal.addClass('my-class');
      expect(modal.containerEl.classList.contains('my-class')).toBe(true);
      expect(result).toBe(modal);
    });
  });

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original', () => {
      const modal = createModal();
      const original: ConfirmationModalOriginal = modal.asOriginalType2__();
      expect(original).toBe(modal);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const modal = createModal();
      const mock = ConfirmationModal.fromOriginalType2__(modal.asOriginalType2__());
      expect(mock).toBe(modal);
    });
  });
});
