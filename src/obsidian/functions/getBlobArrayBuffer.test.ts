import {
  describe,
  expect,
  it
} from 'vitest';

import { getBlobArrayBuffer } from './getBlobArrayBuffer.ts';

describe('getBlobArrayBuffer', () => {
  it('should convert a Blob to ArrayBuffer', async () => {
    const blob = new Blob(['hello']);
    const buffer = await getBlobArrayBuffer(blob);
    expect(buffer.byteLength).toBeGreaterThan(0);
  });

  it('should handle empty Blob', async () => {
    const blob = new Blob([]);
    const buffer = await getBlobArrayBuffer(blob);
    expect(buffer.byteLength).toBe(0);
  });
});
