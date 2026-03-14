import {
  describe,
  expect,
  it
} from 'vitest';

import { request } from './request.ts';

describe('request', () => {
  it('should resolve with empty string', async () => {
    const result = await request('http://example.com');
    expect(result).toBe('');
  });
});
