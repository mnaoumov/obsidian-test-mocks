# obsidian-test-mocks

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

Use `createMockApp()` for a fully wired `App` instance with optional files and folders:

```typescript
import { createMockApp } from 'obsidian';

const app = await createMockApp({
  folders: ['notes', 'notes/daily'],
  files: [
    { path: 'notes/hello.md', content: '# Hello' },
  ],
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

## Design Principles

- **Only `obsidian.d.ts`** — mocks expose exactly the public API, nothing extra
- **Meaningful implementations** — real in-memory behavior (state tracking, callbacks, data storage), not empty stubs
- **Spyable** — all instance creation routes through `__create()` so `vi.spyOn()` works everywhere
- **No `obsidian-typings` augmentation in core mocks** — type shapes are inlined to avoid global module augmentation side effects

## License

MIT
