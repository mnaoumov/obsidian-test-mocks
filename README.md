# obsidian-test-mocks

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/mnaoumov)
[![GitHub release](https://img.shields.io/github/v/release/mnaoumov/obsidian-test-mocks)](https://github.com/mnaoumov/obsidian-test-mocks/releases)
[![GitHub downloads](https://img.shields.io/github/downloads/mnaoumov/obsidian-test-mocks/total)](https://github.com/mnaoumov/obsidian-test-mocks/releases)

Comprehensive test mocks for the [Obsidian](https://obsidian.md/) plugin API. Provides in-memory implementations of every class and function in `obsidian.d.ts`, plus prototype extensions Obsidian adds to DOM/JS builtins.

## Installation

```bash
npm install --save-dev obsidian-test-mocks
```

Peer dependencies: `obsidian`, `obsidian-typings`

## Entry Points

| Import path | Description |
|---|---|
| `obsidian-test-mocks/obsidian` | Mocks for every class/function in `obsidian.d.ts` |
| `obsidian-test-mocks/obsidian-typings/implementations` | Mocks for `obsidian-typings` implementation helpers |
| `obsidian-test-mocks/globals` | Prototype extensions (`HTMLElement`, `Document`, `Array`, `String`, etc.) |
| `obsidian-test-mocks/helpers` | Test helpers (`createMockApp`, etc.) — not part of the Obsidian API |

## Usage with Vitest

In your `vitest.config.ts`, alias the `obsidian` module to the mock entry point:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    alias: {
      obsidian: 'obsidian-test-mocks/obsidian',
    },
    setupFiles: ['obsidian-test-mocks/globals'],
  },
});
```

## Creating Mock Instances

Classes whose constructors are not public in `obsidian.d.ts` expose a static `__create()` factory method:

```typescript
import { App } from 'obsidian';

const app = App.__create();
```

The `__` prefix signals this method is not part of the real Obsidian API — it exists only in the mocks.

### Spying on Instance Creation

The `__create()` pattern makes all instance creation spyable:

```typescript
import { vi } from 'vitest';
import { WorkspaceLeaf } from 'obsidian';

const spy = vi.spyOn(WorkspaceLeaf, '__create');

// ... code that creates leaves ...

expect(spy).toHaveBeenCalledTimes(2);
```

### Pre-configured App

Use `createMockApp()` for a fully wired `App` instance. Parent folders are created automatically from file paths:

```typescript
import { createMockApp } from 'obsidian-test-mocks/helpers';

const app = await createMockApp({
  files: [
    { path: 'notes/daily/2024-01-01.md', content: '# New Year' },
  ],
});
// folders "notes" and "notes/daily" are created automatically
```

You can also create empty folders explicitly:

```typescript
const app = await createMockApp({
  folders: ['archive/2023'],
});
```

## Strict Mocks

Every mock instance is wrapped in a `Proxy` that throws a descriptive error when you access a property that isn't implemented, instead of silently returning `undefined`:

```
Property "internalPlugins" is not mocked in App. To override, assign a value first: mock.internalPlugins = ...
```

### Overriding Behavior

The strict proxy is fully override-friendly. Assign a value and subsequent reads just work:

```typescript
// Override a method
app.vault.read = vi.fn().mockResolvedValue('custom content');

// Spy on an existing method
vi.spyOn(app.vault, 'read').mockResolvedValue('spied content');

// Batch-extend with Object.assign
Object.assign(app, { commands: { addCommand: vi.fn() } });
```

### Accessing Unimplemented Properties

Properties not implemented in the mock (such as `app.internalPlugins`) will throw at runtime:

```
Property "internalPlugins" is not mocked in App. To override, assign a value first: mock.internalPlugins = ...
```

You can add them by assigning a value first:

```typescript
app.internalPlugins = { manifests: {} };
```

But since `internalPlugins` is not declared in `obsidian.d.ts`, TypeScript won't compile that assignment. Here are the options to make it work, from best to worst:

**1. Use `obsidian-typings`** (recommended) — install [`obsidian-typings`](https://www.npmjs.com/package/obsidian-typings) which declares the full internal API. The assignment compiles with no extra work.

**2. Manual module augmentation** (recommended) — declare only what you need:

```typescript
declare module 'obsidian' {
  interface App {
    internalPlugins: { manifests: Record<string, unknown> };
  }
}

app.internalPlugins = { manifests: {} };
```

**3. Cast to `Record<string, unknown>`** (less recommended) — quick one-off escape hatch, still catches typos in the value:

```typescript
(app as Record<string, unknown>).internalPlugins = { manifests: {} };
```

**4. `as any` / `@ts-expect-error` / `@ts-ignore`** (not recommended) — suppresses all type checking and hides real errors:

```typescript
(app as any).internalPlugins = { manifests: {} };

// @ts-expect-error -- accessing internal API
app.internalPlugins = { manifests: {} };
```

## Overriding Exported Variables

Some exports like `apiVersion` are plain strings, not functions. Since ES module bindings are read-only for consumers, use `vi.mock()` to override them:

```typescript
import { vi } from 'vitest';

vi.mock('obsidian', async (importOriginal) => ({
  ...(await importOriginal<typeof import('obsidian')>()),
  apiVersion: '1.8.0',
}));

import { apiVersion } from 'obsidian';

it('uses the overridden apiVersion', () => {
  expect(apiVersion).toBe('1.8.0');
});
```

## Design Principles

- **Only `obsidian.d.ts`** — mocks expose exactly the public API, nothing extra
- **Meaningful implementations** — real in-memory behavior (state tracking, callbacks, data storage), not empty stubs
- **Spyable** — all instance creation routes through `__create()` so `vi.spyOn()` works everywhere
- **No `obsidian-typings` augmentation in core mocks** — type shapes are inlined to avoid global module augmentation side effects

## Support

<!-- markdownlint-disable MD033 -->

<a href="https://www.buymeacoffee.com/mnaoumov" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="60" width="217"></a>

<!-- markdownlint-enable MD033 -->

## My other Obsidian resources

[See my other Obsidian resources](https://github.com/mnaoumov/obsidian-resources).

## License

© [Michael Naumov](https://github.com/mnaoumov/)
