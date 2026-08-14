---
title: Importing the Mocks
description: Why test files import from obsidian-test-mocks/obsidian, and how to override exported variables.
sidebar:
    order: 3
---

Module aliasing (via `vi.mock`, `moduleNameMapper`, and friends) redirects `import ... from 'obsidian'`
to the mocks **at runtime**, but TypeScript still resolves types from `obsidian.d.ts` at compile time.
That means mock-only members such as `create__()`, `asOriginalType__()` and `simulateClick__()` are
invisible when you import from `'obsidian'`.

To reach the mock-specific API, import directly from `'obsidian-test-mocks/obsidian'` in your test files:

```typescript
// Test file — gets mock types with create__(), asOriginalType__(), etc.
import { App } from 'obsidian-test-mocks/obsidian';

const app = App.createConfigured__();
```

Use `import type ... from 'obsidian'` when you need the original obsidian type, for example to annotate a
function parameter:

```typescript
import type { App as AppOriginal } from 'obsidian';

import { App } from 'obsidian-test-mocks/obsidian';

const app = App.createConfigured__();

function pluginInit(app: AppOriginal): void { /* ... */ }
pluginInit(app.asOriginalType__());
```

> [!IMPORTANT]
>
> The `vi.mock` / `moduleNameMapper` aliasing is still required — it is what makes your **production code
> under test** (which does `import { ... } from 'obsidian'`) receive mock implementations at runtime. The
> direct import is only for the test file itself, so TypeScript can see the `__` members you call there.

## Overriding exported variables

Some exports, such as `apiVersion`, are plain strings rather than functions. ES module bindings are
read-only for consumers, so override them through the module mock:

```typescript
import { vi } from 'vitest';

vi.mock('obsidian', async (importOriginal) => ({
  ...(await importOriginal<typeof import('obsidian')>()),
  apiVersion: '1.8.0'
}));

import { apiVersion } from 'obsidian';

it('uses the overridden apiVersion', () => {
  expect(apiVersion).toBe('1.8.0');
});
```
