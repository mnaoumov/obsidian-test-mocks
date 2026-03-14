import {
  describe,
  expect,
  it
} from 'vitest';

import { arrayBufferToHex } from './arrayBufferToHex.ts';
import { hexToArrayBuffer } from './hexToArrayBuffer.ts';

const HEX_STRING = 'ff00ab';

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
