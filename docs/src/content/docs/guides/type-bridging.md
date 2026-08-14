---
title: Type Bridging
description: Move between mock types and the real obsidian types with asOriginalType__() and fromOriginalType__().
sidebar:
    order: 6
---

Mock types and the original obsidian types are structurally different — you cannot assign a mock `App` to
a parameter typed as `import('obsidian').App`. Every mock class provides an `asOriginalType__()` method
returning the instance typed as its original obsidian counterpart:

```typescript
import type { App as AppOriginal } from 'obsidian';

import { App } from 'obsidian-test-mocks/obsidian';

const app = App.createConfigured__();

// Pass to code that expects the original obsidian type
function pluginInit(app: AppOriginal): void { /* ... */ }
pluginInit(app.asOriginalType__());
```

This is a zero-cost type cast at runtime — no wrapping, no cloning.

Subclasses use numbered variants following inheritance depth: `asOriginalType__()` on the root class,
`asOriginalType2__()` on its child, `asOriginalType3__()` on the grandchild, and so on. The inherited base
method stays callable at any level. `Vault`, for instance, extends `Events` and so uses
`asOriginalType2__()`.

## Reverse bridging with `fromOriginalType__()`

The inverse. Every mock class provides a static `fromOriginalType__()` that accepts a real-typed obsidian
object and returns it typed as the mock class:

```typescript
import type { App as AppOriginal } from 'obsidian';

import {
  App,
  Vault
} from 'obsidian-test-mocks/obsidian';

const app: AppOriginal = App.createConfigured__().asOriginalType__();

// Convert back to mock type when you need mock-specific APIs
const mockVault = Vault.fromOriginalType2__(app.vault);
mockVault.setVaultAbstractFile__('path', file);
```

This removes the need for dual variables (`mockApp` / `app`): keep the real `App` type throughout your
test and convert to the mock type only where you call a mock-specific API. The same inheritance-depth
numbering applies — `fromOriginalType__()` on the root, `fromOriginalType2__()` on its child.

## Bridging does not populate the mock

Because every mock is a [strict mock](/obsidian-test-mocks/guides/strict-mocks/), passing the bridged
object to code that reads a member outside `obsidian.d.ts` still throws unless you assign that member
first:

```typescript
const app = App.createConfigured__();
const original = app.asOriginalType__();

// If pluginInit() accesses app.internalPlugins internally, this throws:
//   Property "internalPlugins" is not mocked in App.
//   To override, assign a value first: mock.internalPlugins = ...
pluginInit(original);

// Fix: assign the missing member before calling
(app as Record<string, unknown>)['internalPlugins'] = { manifests: {} };
pluginInit(original); // works
```
