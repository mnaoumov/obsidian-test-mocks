---
title: Test Runner Setup
description: Wire the mocks into Vitest, Jest, or any other test framework that can alias a module.
sidebar:
    order: 2
---

Two things have to happen before a test can run plugin code: the prototype extensions and globals
Obsidian installs have to be applied, and `import ... from 'obsidian'` has to resolve to the mocks. The
runner-specific setup entry points do both.

## Vitest

Add the Vitest setup file — it patches prototypes/globals and mocks `obsidian` automatically:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    server: {
      deps: {
        inline: ['@obsidian-typings', 'obsidian-dev-utils']
      }
    },
    setupFiles: ['obsidian-test-mocks/vitest-setup']
  }
});
```

> [!NOTE]
> The `server.deps.inline` setting tells Vitest to bundle `@obsidian-typings` and `obsidian-dev-utils`
> into the test transform pipeline instead of treating them as external Node.js imports. Without this,
> Vitest may fail to resolve these transitive dependencies at runtime. Add any other packages that cause
> `Cannot find module` errors during test setup to this list.

The second setup file is optional — see
[Using with `obsidian-typings`](/obsidian-test-mocks/guides/obsidian-typings/).

## Jest

Add the Jest setup file and a `moduleNameMapper` entry aliasing the `obsidian` module:

```javascript
module.exports = {
  moduleNameMapper: {
    '^obsidian$': 'obsidian-test-mocks/obsidian'
  },
  setupFiles: ['obsidian-test-mocks/jest-setup']
};
```

> [!NOTE]
> Unlike Vitest, Jest requires `moduleNameMapper` because the `obsidian` npm package is types-only (no JS
> runtime) and `jest.mock` in setup files cannot resolve it.

## Other frameworks

The `vitest-setup` and `jest-setup` entry points already handle prototype/global patching and `obsidian`
module aliasing. With a different framework you do both yourself, using the generic `setup` entry point:

1. **Prototype/global patching** — call `setup()` / `teardown()` in your lifecycle hooks:

   ```typescript
   import {
     setup,
     teardown
   } from 'obsidian-test-mocks/setup';

   beforeAll(() => setup());
   afterAll(() => teardown());
   ```

2. **Module aliasing** — redirect `import ... from 'obsidian'` to the mocks so that your production code
   under test receives mock implementations. For reference, here is what `vitest-setup` does:

   ```typescript
   vi.mock('obsidian', async () => await import('obsidian-test-mocks/obsidian'));
   ```

   Write something similar using your framework's module mocking API, or configure module resolution at
   the config level (as the Jest example above does with `moduleNameMapper`).

> [!WARNING]
>
> If your test framework does not support module mocking or aliasing, it cannot be used with this library.
>
> Production code under test does `import { ... } from 'obsidian'`, and without module aliasing those
> imports will not resolve to the mocks.
