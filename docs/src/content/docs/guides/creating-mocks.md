---
title: Creating Mock Instances
description: The create__() factory pattern, spying on construction, and building a pre-configured App.
sidebar:
    order: 4
---

Every mock class exposes a static `create__()` factory, whether or not its constructor is public in
`obsidian.d.ts`:

```typescript
import { App } from 'obsidian-test-mocks/obsidian';

const app = App.create__();
```

The `__` suffix signals the member is not part of the real Obsidian API — it exists only in the mocks,
for testing. The same convention covers the type bridges (`asOriginalType__()`) and the test helpers
(`simulateClick__()`, `simulateChange__()`).

Where a subclass needs a factory signature incompatible with its base class, it uses a numbered variant
following inheritance depth — `create2__()`, `create3__()`, and so on. The inherited base factory stays
callable at every level.

## Spying on instance creation

Routing all construction through `create__()` is what makes it spyable:

```typescript
import { WorkspaceLeaf } from 'obsidian-test-mocks/obsidian';
import { vi } from 'vitest';

const spy = vi.spyOn(WorkspaceLeaf, 'create2__');

// ... code that creates leaves ...

expect(spy).toHaveBeenCalledTimes(2);
```

Construction itself is observable too: each class in an inheritance chain has a spyable
`constructor__()` / `constructor2__()` / … hook that the constructor calls, so
`vi.spyOn(Class.prototype, 'constructor2__')` sees every instantiation.

## Pre-configured App

`App.createConfigured__()` returns a fully wired `App`. Parent folders are created automatically from the
file paths you give it:

```typescript
import { App } from 'obsidian-test-mocks/obsidian';

const app = App.createConfigured__({
  files: {
    'notes/daily/2024-01-01.md': '# New Year'
  }
});
// folders "notes" and "notes/daily" are created automatically
```

Paths ending with `/` are treated as folders, and their content must be empty:

```typescript
const app = App.createConfigured__({
  files: {
    'archive/2023/': ''
  }
});
```
