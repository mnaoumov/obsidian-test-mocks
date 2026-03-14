import {
  describe,
  expect,
  it
} from 'vitest';

import { arrayBufferToBase64 } from './arrayBufferToBase64.ts';
import { base64ToArrayBuffer } from './base64ToArrayBuffer.ts';

const HELLO_BASE64 = 'SGVsbG8=';

describe('arrayBufferToBase64', () => {
  it('should encode an ArrayBuffer to base64', () => {
    const buffer = base64ToArrayBuffer(HELLO_BASE64);
    expect(arrayBufferToBase64(buffer)).toBe(HELLO_BASE64);
  });

  it('should handle empty buffer', () => {
    expect(arrayBufferToBase64(new ArrayBuffer(0))).toBe('');
  });
});
