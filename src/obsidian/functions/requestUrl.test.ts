import {
  describe,
  expect,
  it
} from 'vitest';

import { requestUrl } from './requestUrl.ts';

const HTTP_OK = 200;

describe('requestUrl', () => {
  it('should return a response with status 200', async () => {
    const response = await requestUrl('http://example.com');
    expect(response.status).toBe(HTTP_OK);
    expect(response.text).toBe('');
  });

  it('should have sync properties on the promise', () => {
    const promise = requestUrl('http://example.com');
    expect(promise.status).toBe(HTTP_OK);
    expect(promise.headers).toEqual({});
    expect(promise.text).toBe('');
  });
});
