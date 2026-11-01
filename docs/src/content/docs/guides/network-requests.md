---
title: Network Requests
description: What the requestUrl and request mocks answer, and how to give a test its own responses.
sidebar:
    order: 9
---

The `requestUrl` and `request` mocks never touch the network. With nothing set up, `requestUrl` resolves to a
canned response: status `200`, no headers, an empty body, empty `text` and `null` `json`. As in Obsidian, the
same fields are also set on the returned promise itself, so both `await requestUrl(url)` and
`requestUrl(url).json` work. `request` resolves to the empty string.

That default keeps code which fires a request as a side effect from failing a test. A test about the request
itself wants its own response, and the way to get one is your runner's module mock.

## Vitest

Replace `requestUrl` in the `obsidian` module and keep every other mock:

```typescript
import type { RequestUrlResponse } from 'obsidian';

import { requestUrl } from 'obsidian';
import {
  expect,
  it,
  vi
} from 'vitest';

import { fetchLatestVersion } from './releases.ts';

vi.mock('obsidian', async (importOriginal) => ({
  ...await importOriginal<typeof import('obsidian')>(),
  requestUrl: vi.fn()
}));

it('reads the version from the response', async () => {
  vi.mocked(requestUrl).mockResolvedValue({
    arrayBuffer: new ArrayBuffer(0),
    headers: {},
    json: { version: '1.2.3' },
    status: 200,
    text: '{"version":"1.2.3"}'
  } as RequestUrlResponse as never);

  expect(await fetchLatestVersion()).toBe('1.2.3');
  expect(requestUrl).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://example.com/latest.json' }));
});
```

`importOriginal` hands back the mock module the [Vitest setup](/obsidian-test-mocks/guides/test-runner-setup/)
installed, so only `requestUrl` changes. A resolved value set this way is a plain promise: code that reads
`requestUrl(url).json` without `await` needs those fields set on the promise too.

## Jest

The same shape with `jest.mock`:

```typescript
jest.mock('obsidian', () => ({
  ...jest.requireActual('obsidian-test-mocks/obsidian'),
  requestUrl: jest.fn()
}));
```

## Error statuses

Obsidian's `requestUrl` rejects a response with a status of `400` or more unless the request passes
`throw: false`. A stub decides what it returns, so a test of that path rejects explicitly:

```typescript
vi.mocked(requestUrl).mockRejectedValue(new Error('Request failed, status 404'));
```
