---
title: Using with obsidian-typings
description: Bridge obsidian-typings' internal property names onto the mocks' __-suffixed members.
sidebar:
    order: 7
---

This package has **no runtime dependency** on
[`obsidian-typings`](https://github.com/Fevol/obsidian-typings), but it works seamlessly alongside
it.

`obsidian-typings` uses `declare module 'obsidian'` to augment the obsidian types with dozens of internal
properties (`App.internalPlugins`, `App.commands`, and so on). That makes `import('obsidian').App` a
superset of what `obsidian.d.ts` declares on its own. The mocks implement only the public API, so the two
are structurally incompatible until something bridges them.

## Automatic bridging

The `obsidian-test-mocks/obsidian-typings/*` entry points install that bridge: they define the
`obsidian-typings` internal names on the mock prototypes, delegating to the mocks' own `__`-suffixed
members. Add the setup file for your runner **after** the main one.

**Vitest:**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    setupFiles: [
      'obsidian-test-mocks/vitest-setup',
      'obsidian-test-mocks/obsidian-typings/vitest-setup'
    ]
  }
});
```

**Jest:**

```javascript
module.exports = {
  moduleNameMapper: {
    '^obsidian$': 'obsidian-test-mocks/obsidian'
  },
  setupFiles: [
    'obsidian-test-mocks/jest-setup',
    'obsidian-test-mocks/obsidian-typings/jest-setup'
  ]
};
```

**Other frameworks** — use the generic `setup` entry point:

```typescript
import {
  setup,
  teardown
} from 'obsidian-test-mocks/obsidian-typings/setup';

beforeAll(() => setup());
afterAll(() => teardown());
```

## What gets bridged

| Class                 | `obsidian-typings` name            | Backing mock member                |
| --------------------- | ---------------------------------- | ---------------------------------- |
| `AbstractInputSuggest` | `textInputEl`                      | `textInputEl__`                    |
| `CapacitorAdapter`    | `insensitive`                      | `insensitive__`                    |
| `Component`           | `_children`                        | `children__`                       |
| `Component`           | `_loaded`                          | `loaded__`                         |
| `FileSystemAdapter`   | `insensitive`                      | `insensitive__`                    |
| `Menu`                | `items`                            | `items__`                          |
| `Menu`                | `setSectionSubmenu`                | `sectionSubmenus__`                |
| `MenuItem`            | `setSubmenu`                       | `setSubmenu__()`                   |
| `MenuItem`            | `submenu`                          | `submenu__`                        |
| `MetadataCache`       | `computeMetadataAsync`             | (parses the buffer as markdown)    |
| `MetadataCache`       | `fileCache`                        | `fileCache__`                      |
| `MetadataCache`       | `metadataCache`                    | `metadataByHash__`                 |
| `Modal`               | `bgEl`                             | `bgEl__`                           |
| `Modal`               | `headerEl`                         | `headerEl__`                       |
| `Setting`             | `setVisibility`                    | (toggles `settingEl`)              |
| `SuggestModal`        | `instructionsEl`                   | `instructionsEl__`                 |
| `TAbstractFile`       | `deleted`                          | `deleted__`                        |
| `TFolder`             | `getParentPrefix`                  | `getParentPrefix__()`              |
| `Vault`               | `exists`                           | `getAbstractFileByPathInsensitive__()` |
| `Vault`               | `getAbstractFileByPathInsensitive` | `getAbstractFileByPathInsensitive__()` |
| `Vault`               | `getAvailablePath`                 | `getAvailablePath__()`             |
| `Vault`               | `getAvailablePathForAttachments`   | `getAvailablePathForAttachments__()` |
| `Vault`               | `getConfig`                        | `getConfig__()`                    |
| `Vault`               | `setConfig`                        | `setConfig__()`                    |
| `WorkspaceLeaf`       | `onOpenTabHeaderMenu`              | (present but inert — a no-op)      |

After setup, code written against the `obsidian-typings` names works through the
[strict proxy](/obsidian-test-mocks/guides/strict-mocks/) instead of throwing:

```typescript
const component = Component.create__();
component.load();
// With obsidian-typings/vitest-setup, this works instead of throwing:
console.log(component._loaded); // true
```

The entry point also exports `teardown()`, which removes every bridge again.

## Manual property assignment

For anything the automatic bridging does not cover, use
[`asOriginalType__()`](/obsidian-test-mocks/guides/type-bridging/) to hand a mock to code that expects an
obsidian type:

```typescript
import type { App as AppOriginal } from 'obsidian';

import { App } from 'obsidian-test-mocks/obsidian';

function myPluginHelper(app: AppOriginal): void { /* ... */ }

const app = App.createConfigured__();
myPluginHelper(app.asOriginalType__());
```

With `obsidian-typings` installed the returned type includes the augmented properties, so internal
members can be assigned type-safely:

```typescript
const app = App.createConfigured__();
const original = app.asOriginalType__();

// Type-safe with obsidian-typings — no casts needed
original.internalPlugins = { manifests: {} };
```

Without `obsidian-typings`, assign them through a `Record` cast:

```typescript
const app = App.createConfigured__();
(app as unknown as Record<string, unknown>)['internalPlugins'] = { manifests: {} };
```

Either way, reading a property that was never assigned — and is not covered by the automatic bridging —
still throws a [strict mock](/obsidian-test-mocks/guides/strict-mocks/) error at runtime, whether or not
`obsidian-typings` makes it compile.
