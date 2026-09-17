/**
 * @file
 *
 * Mock of Obsidian's `requestUrl`.
 */

import type { RequestUrlParam as RequestUrlParameterOriginal } from 'obsidian';

interface RequestUrlResponse {
  arrayBuffer: ArrayBuffer;
  headers: Record<string, string>;
  json: unknown;
  status: number;
  text: string;
}

type RequestUrlResponsePromise = Promise<RequestUrlResponse> & RequestUrlResponse;

/**
 * Requests a URL over HTTP or HTTPS without CORS restrictions. The result is a promise of the response that also
 * carries the response fields directly. The mock makes no request.
 *
 * @param _request - The URL, or the full request parameters.
 * @returns A promise resolving to a canned `200` response with no headers, an empty body, empty text and `null` JSON;
 * the same fields are set on the promise itself.
 */
export function requestUrl(_request: RequestUrlParameterOriginal | string): RequestUrlResponsePromise {
  const HTTP_OK = 200;
  const response: RequestUrlResponse = {
    arrayBuffer: new ArrayBuffer(0),
    headers: {},
    json: null,
    status: HTTP_OK,
    text: ''
  };
  const promise = Promise.resolve(response) as RequestUrlResponsePromise;
  promise.status = response.status;
  promise.headers = response.headers;
  promise.arrayBuffer = response.arrayBuffer;
  promise.json = response.json;
  promise.text = response.text;
  return promise;
}
