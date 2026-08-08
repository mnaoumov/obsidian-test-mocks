import type { RequestUrlParam as RequestUrlParameterOriginal } from 'obsidian';

import { noopAsync } from '../../internal/noop.ts';

export async function request(_request: RequestUrlParameterOriginal | string): Promise<string> {
  await noopAsync();
  return '';
}
