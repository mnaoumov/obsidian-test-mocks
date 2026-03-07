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

const app = createMockApp({
  folders: ['notes', 'notes/daily'],
  files: [
    { path: 'notes/hello.md', content: '# Hello' },
  ],
});
```

## Design Principles

- **Only `obsidian.d.ts`** — mocks expose exactly the public API, nothing extra
- **Meaningful implementations** — real in-memory behavior (state tracking, callbacks, data storage), not empty stubs
- **Spyable** — all instance creation routes through `__create()` so `vi.spyOn()` works everywhere
- **No `obsidian-typings` augmentation in core mocks** — type shapes are inlined to avoid global module augmentation side effects

## License

MIT
