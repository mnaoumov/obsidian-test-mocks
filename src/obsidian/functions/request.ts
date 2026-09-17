/**
 * @file
 *
 * Mock of Obsidian's `request`.
 */

import type { RequestUrlParam as RequestUrlParameterOriginal } from 'obsidian';

import { noopAsync } from '../../internal/noop.ts';

/**
 * Requests a URL over HTTP or HTTPS without CORS restrictions and resolves to the response text. The mock makes no
 * request.
 *
 * @param _request - The URL, or the full request parameters.
 * @returns A promise resolving to an empty string.
 */
export async function request(_request: RequestUrlParameterOriginal | string): Promise<string> {
  await noopAsync();
  return '';
}
