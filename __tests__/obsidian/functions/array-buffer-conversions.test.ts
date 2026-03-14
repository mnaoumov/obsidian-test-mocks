import {
  describe,
  expect,
  it
} from 'vitest';

import { arrayBufferToBase64 } from '../../../src/obsidian/functions/arrayBufferToBase64.ts';
import { arrayBufferToHex } from '../../../src/obsidian/functions/arrayBufferToHex.ts';
import { base64ToArrayBuffer } from '../../../src/obsidian/functions/base64ToArrayBuffer.ts';
import { hexToArrayBuffer } from '../../../src/obsidian/functions/hexToArrayBuffer.ts';

const HELLO_BASE64 = 'SGVsbG8=';
const HEX_STRING = 'ff00ab';

describe('arrayBufferToBase64', () => {
  it('should encode an ArrayBuffer to base64', () => {
    const buffer = base64ToArrayBuffer(HELLO_BASE64);
    expect(arrayBufferToBase64(buffer)).toBe(HELLO_BASE64);
  });

  it('should handle empty buffer', () => {
    expect(arrayBufferToBase64(new ArrayBuffer(0))).toBe('');
  });
});

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

describe('arrayBufferToHex', () => {
  it('should encode an ArrayBuffer to hex', () => {
    const buffer = hexToArrayBuffer(HEX_STRING);
    expect(arrayBufferToHex(buffer)).toBe(HEX_STRING);
  });

  it('should handle empty buffer', () => {
    expect(arrayBufferToHex(new ArrayBuffer(0))).toBe('');
  });
});

describe('hexToArrayBuffer', () => {
  it('should decode hex to ArrayBuffer', () => {
    const buffer = hexToArrayBuffer(HEX_STRING);
    expect(buffer.byteLength).toBeGreaterThan(0);
    // Round-trip: encode back and verify
    expect(arrayBufferToHex(buffer)).toBe(HEX_STRING);
  });

  it('should handle empty string', () => {
    const buffer = hexToArrayBuffer('');
    expect(buffer.byteLength).toBe(0);
  });
});
