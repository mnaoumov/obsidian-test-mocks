# obsidian-test-mocks

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/mnaoumov)
[![npm version](https://img.shields.io/npm/v/obsidian-test-mocks)](https://www.npmjs.com/package/obsidian-test-mocks)
[![npm downloads](https://img.shields.io/npm/dm/obsidian-test-mocks)](https://www.npmjs.com/package/obsidian-test-mocks)
[![GitHub release](https://img.shields.io/github/v/release/mnaoumov/obsidian-test-mocks)](https://github.com/mnaoumov/obsidian-test-mocks/releases)
[![Coverage: 100%](https://img.shields.io/badge/coverage-100%25-brightgreen)](https://github.com/mnaoumov/obsidian-test-mocks)

Comprehensive test mocks for the [Obsidian](https://obsidian.md/) plugin API. Provides in-memory implementations of every class and function in `obsidian.d.ts`, plus prototype extensions Obsidian adds to DOM/JS builtins. The package is tested with **100% code coverage** (lines, branches, functions, and statements) enforced on every build.

## Installation

```bash
npm install --save-dev obsidian-test-mocks
```

Peer dependencies: `obsidian`

## Entry Points

| Import path                    | Description                                                               |
| ------------------------------ | ------------------------------------------------------------------------- |
| `obsidian-test-mocks/obsidian` | Mocks for every class/function in `obsidian.d.ts`                         |
| `obsidian-test-mocks/globals`  | Prototype extensions (`HTMLElement`, `Document`, `Array`, `String`, etc.) |

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

Classes whose constructors are not public in `obsidian.d.ts` expose a static `create__()` factory method:

```typescript
import { App } from 'obsidian';

const app = App.create__();
```

The `__` suffix signals this member is not part of the real Obsidian API — it exists only in the mocks for testing purposes. This convention applies to all mock-only public members: factory methods (`create__()`), type-bridge helpers (`asOriginalType__()`), and test helpers (`simulateClick__()`, `simulateChange__()`).

### Spying on Instance Creation

The `create__()` pattern makes all instance creation spyable:

```typescript
import { vi } from 'vitest';
import { WorkspaceLeaf } from 'obsidian';

const spy = vi.spyOn(WorkspaceLeaf, 'create2__');

// ... code that creates leaves ...

expect(spy).toHaveBeenCalledTimes(2);
```

### Pre-configured App

Use `App.createConfigured__()` for a fully wired `App` instance. Parent folders are created automatically from file paths:

```typescript
import { App } from 'obsidian';

const app = await App.createConfigured__({
  files: {
    'notes/daily/2024-01-01.md': '# New Year',
  },
});
// folders "notes" and "notes/daily" are created automatically
```

Paths ending with `/` are treated as folders (content must be empty):

```typescript
const app = await App.createConfigured__({
  files: {
    'archive/2023/': '',
  },
});
```

## Strict Mocks

Every mock instance is wrapped in a `Proxy` that throws a descriptive error when you access a property that isn't implemented, instead of silently returning `undefined`:

```text
Property "internalPlugins" is not mocked in App. To override, assign a value first: mock.internalPlugins = ...
```

### Overriding Behavior

The strict proxy is fully override-friendly. Assign a value and subsequent reads just work:

```typescript
// Spy on an existing method
vi.spyOn(app.vault, 'read').mockResolvedValue('custom content');

// Batch-extend with Object.assign
Object.assign(app, { commands: { addCommand: vi.fn() } });
```

### Accessing Unimplemented Properties

Properties not implemented in the mock (such as `app.internalPlugins`) will throw at runtime:

```text
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

## Type Bridging with `asOriginalType__()`

Mock types and original obsidian types are structurally different — you cannot assign a mock `App` to a parameter typed as `import('obsidian').App`. Every mock class provides an `asOriginalType__()` method that returns the instance typed as its original obsidian counterpart:

```typescript
import type { App as AppOriginal } from 'obsidian';
import { App } from 'obsidian';

const app = await App.createConfigured__();

// Pass to code that expects the original obsidian type
function pluginInit(app: AppOriginal): void { /* ... */ }
pluginInit(app.asOriginalType__());
```

This is a zero-cost type cast at runtime — no wrapping, no cloning. The `__` suffix signals it is not part of the real Obsidian API.

Subclasses use numbered variants following inheritance depth: `asOriginalType__()` on the root class, `asOriginalType2__()` on its child, `asOriginalType3__()` on the grandchild, etc. The inherited base method remains callable at any level. For example, `Vault` (which extends `Events`) uses `asOriginalType2__()`.

### Reverse Bridging with `fromOriginalType__()`

The inverse of `asOriginalType__()`. Every mock class provides a static `fromOriginalType__()` method that accepts a real-typed obsidian object and returns it typed as the mock class:

```typescript
import type { App as AppOriginal } from 'obsidian';
import { App, Vault } from 'obsidian';

const app: AppOriginal = (await App.createConfigured__()).asOriginalType__();

// Convert back to mock type when you need mock-specific APIs
const mockVault = Vault.fromOriginalType2__(app.vault);
mockVault.setVaultAbstractFile__('path', file);
```

This eliminates the need for maintaining dual variables (`mockApp` / `app`). Keep the real `App` type throughout your test and convert to the mock type only when calling mock-specific APIs.

Subclasses use numbered variants following the same inheritance-depth convention as `asOriginalType__()`: `fromOriginalType__()` on the root, `fromOriginalType2__()` on its child, etc.

Because every mock is a [strict mock](#strict-mocks), passing the result to code that accesses internal members (not part of `obsidian.d.ts`) will throw a descriptive error unless you assign those members first:

```typescript
const app = await App.createConfigured__();
const original = app.asOriginalType__();

// If pluginInit() accesses app.internalPlugins internally, this throws:
//   Property "internalPlugins" is not mocked in App.
//   To override, assign a value first: mock.internalPlugins = ...
pluginInit(original);

// Fix: assign the missing member before calling
(app as Record<string, unknown>)['internalPlugins'] = { manifests: {} };
pluginInit(original); // works
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

## Using with `obsidian-typings`

This package does **not** depend on [`obsidian-typings`](https://www.npmjs.com/package/obsidian-typings), but it works seamlessly if your project uses it.

`obsidian-typings` uses `declare module 'obsidian'` to augment obsidian types with dozens of internal properties (e.g., `App.internalPlugins`, `App.commands`). This makes `import('obsidian').App` a superset of what `obsidian.d.ts` alone declares. The mock types only implement the public API from `obsidian.d.ts`, so the two are structurally incompatible.

Use `asOriginalType__()` to bridge the gap when passing mocks to code that expects obsidian types:

```typescript
import type { App as AppOriginal } from 'obsidian';
import { App } from 'obsidian';

function myPluginHelper(app: AppOriginal): void { /* ... */ }

const app = await App.createConfigured__();
myPluginHelper(app.asOriginalType__());
```

With `obsidian-typings` installed, the returned type includes all augmented properties, so you can assign internal members in a type-safe way:

```typescript
const app = await App.createConfigured__();
const original = app.asOriginalType__();

// Type-safe with obsidian-typings — no casts needed
original.internalPlugins = { manifests: {} };
```

Without `obsidian-typings`, you can still assign them via a `Record` cast:

```typescript
const app = await App.createConfigured__();
(app as unknown as Record<string, unknown>)['internalPlugins'] = { manifests: {} };
```

Remember that accessing any property not assigned on the mock will throw a [strict mock](#strict-mocks) error at runtime, regardless of whether `obsidian-typings` makes it compile.

## Design Principles

- **Only `obsidian.d.ts`** — mocks expose exactly the public API, nothing extra
- **Meaningful implementations** — real in-memory behavior (state tracking, callbacks, data storage), not empty stubs
- **Spyable** — all instance creation routes through `create__()` so `vi.spyOn()` works everywhere
- **No `obsidian-typings` dependency** — type shapes are inlined to avoid global module augmentation side effects

## Support

<!-- markdownlint-disable MD033 -->

<a href="https://www.buymeacoffee.com/mnaoumov" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="60" width="217"></a>

<!-- markdownlint-enable MD033 -->

## My other Obsidian resources

[See my other Obsidian resources](https://github.com/mnaoumov/obsidian-resources).

## License

© [Michael Naumov](https://github.com/mnaoumov/)
