import {
  describe,
  expect,
  it
} from 'vitest';

import { arrayBufferToBase64 } from './arrayBufferToBase64.ts';
import { base64ToArrayBuffer } from './base64ToArrayBuffer.ts';

const HELLO_BASE64 = 'SGVsbG8=';

describe('base64ToArrayBuffer', () => {
  it('should decode base64 to ArrayBuffer', () => {
    const buffer = base64ToArrayBuffer(HELLO_BASE64);
    expect(buffer.byteLength).toBeGreaterThan(0);
    // Round-trip: encode back and verify
    expect(arrayBufferToBase64(buffer)).toBe(HELLO_BASE64);
  });

  it('should handle empty string', () => {
    const buffer = base64ToArrayBuffer('');
    expect(buffer.byteLength).toBe(0);
  });
});
