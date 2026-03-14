import {
  describe,
  expect,
  it
} from 'vitest';

import { arrayBufferToHex } from './arrayBufferToHex.ts';
import { hexToArrayBuffer } from './hexToArrayBuffer.ts';

const HEX_STRING = 'ff00ab';

describe('arrayBufferToHex', () => {
  it('should encode an ArrayBuffer to hex', () => {
    const buffer = hexToArrayBuffer(HEX_STRING);
    expect(arrayBufferToHex(buffer)).toBe(HEX_STRING);
  });

  it('should handle empty buffer', () => {
    expect(arrayBufferToHex(new ArrayBuffer(0))).toBe('');
  });
});
