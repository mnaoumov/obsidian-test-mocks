import type { RequestUrlParam as RequestUrlParamOriginal } from 'obsidian';

import { noopAsync } from '../internal/noop.ts';

export async function request(_request: RequestUrlParamOriginal | string): Promise<string> {
  await noopAsync();
  return '';
}
