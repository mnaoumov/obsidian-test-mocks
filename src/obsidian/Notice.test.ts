import type { Notice as NoticeOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { Notice } from './Notice.ts';

const DURATION = 5000;

describe('Notice', () => {
  it('should create an instance via create__', () => {
    const notice = Notice.create__('Hello');
    expect(notice).toBeInstanceOf(Notice);
  });

  it('should set message text content from string', () => {
    const notice = Notice.create__('Hello');
    expect(notice.messageEl.textContent).toBe('Hello');
  });

  it('should set message content from DocumentFragment', () => {
    const fragment = document.createDocumentFragment();
    const span = document.createElement('span');
    span.textContent = 'Fragment';
    fragment.appendChild(span);
    const notice = Notice.create__(fragment);
    expect(notice.messageEl.textContent).toContain('Fragment');
  });

  it('should store the duration', () => {
    const notice = Notice.create__('msg', DURATION);
    expect(notice.duration__).toBe(DURATION);
  });

  it('should default duration to 0', () => {
    const notice = Notice.create__('msg');
    expect(notice.duration__).toBe(0);
  });

  describe('setMessage', () => {
    it('should update message with string', () => {
      const notice = Notice.create__('old');
      notice.setMessage('new');
      expect(notice.messageEl.textContent).toBe('new');
    });

    it('should update message with DocumentFragment', () => {
      const notice = Notice.create__('old');
      const fragment = document.createDocumentFragment();
      fragment.append('fragment');
      notice.setMessage(fragment);
      expect(notice.messageEl.textContent).toContain('fragment');
    });

    it('should return this for chaining', () => {
      const notice = Notice.create__('msg');
      expect(notice.setMessage('new')).toBe(notice);
    });
  });

  describe('hide', () => {
    it('should not throw', () => {
      const notice = Notice.create__('msg');
      expect(() => {
        notice.hide();
      }).not.toThrow();
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const notice = Notice.create__('msg');
      const original: NoticeOriginal = notice.asOriginalType__();
      expect(original).toBe(notice);
    });
  });
});
