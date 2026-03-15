import type { Modal as ModalOriginal } from 'obsidian';

import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { App } from './App.ts';

let app: App;

beforeEach(async () => {
  vi.useFakeTimers();
  app = await App.createConfigured__();
});

// Use dynamic import to avoid issues with module loading
const { Modal } = await import('./Modal.ts');

describe('Modal', () => {
  it('should create an instance via create__', () => {
    const modal = Modal.create__(app);
    expect(modal).toBeInstanceOf(Modal);
  });

  it('should have app property', () => {
    const modal = Modal.create__(app);
    expect(modal.app).toBe(app);
  });

  it('should have HTML elements', () => {
    const modal = Modal.create__(app);
    expect(modal.containerEl).toBeInstanceOf(HTMLElement);
    expect(modal.contentEl).toBeInstanceOf(HTMLElement);
    expect(modal.modalEl).toBeInstanceOf(HTMLElement);
    expect(modal.titleEl).toBeInstanceOf(HTMLElement);
  });

  describe('setTitle', () => {
    it('should set the title text', () => {
      const modal = Modal.create__(app);
      modal.setTitle('Test Title');
      expect(modal.titleEl.textContent).toBe('Test Title');
    });
  });

  describe('setContent', () => {
    it('should set string content', () => {
      const modal = Modal.create__(app);
      modal.setContent('Hello');
      expect(modal.contentEl.textContent).toBe('Hello');
    });

    it('should set DocumentFragment content', () => {
      const modal = Modal.create__(app);
      const fragment = document.createDocumentFragment();
      const span = document.createElement('span');
      span.textContent = 'Fragment';
      fragment.appendChild(span);
      modal.setContent(fragment);
      expect(modal.contentEl.textContent).toContain('Fragment');
    });
  });

  describe('open / close', () => {
    it('should call onOpen when opened', () => {
      const modal = Modal.create__(app);
      const spy = vi.spyOn(modal, 'onOpen');
      modal.open();
      expect(spy).toHaveBeenCalledOnce();
    });

    it('should call onClose when closed', () => {
      const modal = Modal.create__(app);
      const spy = vi.spyOn(modal, 'onClose');
      modal.close();
      expect(spy).toHaveBeenCalledOnce();
    });

    it('should auto-close after setTimeout when opened', () => {
      const modal = Modal.create__(app);
      const closeSpy = vi.spyOn(modal, 'close');
      modal.open();
      vi.runAllTimers();
      // Close is called: once in setTimeout
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('setCloseCallback', () => {
    it('should call the callback on close', () => {
      const modal = Modal.create__(app);
      const cb = vi.fn();
      modal.setCloseCallback(cb);
      modal.close();
      expect(cb).toHaveBeenCalledOnce();
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const modal = Modal.create__(app);
      const original: ModalOriginal = modal.asOriginalType__();
      expect(original).toBe(modal);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const modal = Modal.create__(app);
      const mock = Modal.fromOriginalType__(modal.asOriginalType__());
      expect(mock).toBe(modal);
    });
  });
});
