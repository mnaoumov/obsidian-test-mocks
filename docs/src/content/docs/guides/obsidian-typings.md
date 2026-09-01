---
title: Using with obsidian-typings
description: The mocks carry Obsidian's real internal names, so obsidian-typings code runs against them unchanged.
sidebar:
    order: 7
---

This package has **no runtime dependency** on
[`obsidian-typings`](https://github.com/Fevol/obsidian-typings), but it works seamlessly alongside
it.

`obsidian-typings` uses `declare module 'obsidian'` to augment the obsidian types with about a
thousand internal members (`App.commands`, `Menu.items`, and so on). That makes
`import('obsidian').App` a superset of what `obsidian.d.ts` declares on its own.

## Real names, no bridging

A mock member that implements one of those internals **carries the internal's real name**. `Menu.items`
is simply the mock's own member, so code written against `obsidian-typings` runs against the mocks with
no setup step, no configuration, and no property assignment:

```typescript
import { Menu } from 'obsidian-test-mocks/obsidian';

const menu = Menu.create2__();
menu.addItem((item) => item.setTitle('Rename'));

console.log(menu.items.length); // 1
```

The `__` suffix stays only on members that **do not exist in Obsidian at all** — factories
(`create__()`), type bridges (`asOriginalType__()`), and test helpers (`simulateClick__()`). A real
internal is not a fake member, so marking it as one would be a lie.

:::note[Previously]
Earlier versions shipped an `obsidian-typings/*-setup` bridge layer that defined the real names onto the
mock prototypes at test-setup time, delegating to `__`-suffixed members. Those entry points still exist
and now do nothing; they are deprecated and will be removed in the next major release. Remove them from
your Vitest or Jest `setupFiles` — the members work without them.
:::

## What the mocks implement

<!-- BEGIN GENERATED: implemented-internals -->
| Class | Members |
| --- | --- |
| `AbstractInputSuggest` | `textInputEl` |
| `App` | `appId`, `changeTheme`, `getTheme`, `isMobile`, `plugins`, `setTheme` |
| `BasesViewConfig` | `setOrder` |
| `ColorComponent` | `colorPickerEl` |
| `Component` | `_children`, `_events`, `_loaded` |
| `DateValue` | `date` |
| `DropdownComponent` | `changeCallback` |
| `DurationValue` | `days`, `hours`, `milliseconds`, `minutes`, `months`, `seconds`, `years` |
| `Events` | `_` |
| `FileManager` | `app` |
| `MarkdownEditView` | `view` |
| `MarkdownPreviewView` | `onload` |
| `MarkdownRenderer` | `onload` |
| `MarkdownView` | `getEphemeralState`, `onload` |
| `Menu` | `dom`, `items`, `setSectionSubmenu` |
| `MenuItem` | `checked`, `disabled`, `section`, `setSubmenu`, `submenu` |
| `MetadataCache` | `app`, `computeMetadataAsync`, `fileCache`, `metadataCache` |
| `Modal` | `bgEl`, `headerEl` |
| `ObjectValue` | `data` |
| `PopoverSuggest` | `isOpen` |
| `ProgressBarComponent` | `progressBar` |
| `Setting` | `setVisibility` |
| `SettingGroup` | `groupEl`, `headerEl`, `headerInnerEl` |
| `SettingTab` | `renderTab` |
| `SuggestModal` | `instructionsEl` |
| `TAbstractFile` | `deleted` |
| `TFile` | `name` |
| `TFolder` | `getParentPrefix` |
| `Vault` | `config`, `exists`, `fileMap`, `getAbstractFileByPathInsensitive`, `getAvailablePath`, `getAvailablePathForAttachments`, `getConfig`, `setConfig` |
| `Workspace` | `app` |
| `WorkspaceLeaf` | `group`, `pinned` |
<!-- END GENERATED: implemented-internals -->

## The plugin registry

`app.plugins` is modelled, and `getPlugin()` answers `null`. That is not a stub — a mock vault
genuinely has no community plugins installed, so `null` is the truth about it:

```typescript
const app = App.createConfigured__();

app.plugins.getPlugin('notebook-navigator'); // null
```

This matters because library code reads the registry on your behalf. `obsidian-dev-utils`, for
instance, looks for Notebook Navigator's optional menu API on layout ready, so a plugin whose own
code never mentions `app.plugins` still touches it through what it inherits.

To model a vault that *does* have the plugin, seed it:

```typescript
app.plugins.registerPlugin__('notebook-navigator', castTo<Plugin>({ api }));

app.plugins.getPlugin('notebook-navigator'); // the stand-in
app.plugins.enabledPlugins;                  // Set { 'notebook-navigator' }
```

The instance can be a full `Plugin` mock via `asOriginalType2__()`, or any stand-in carrying just the
members under test. `unregisterPlugin__(id)` reverses it. Only that core is modelled — the
enable/disable lifecycle, installing, updates and deprecation checks throw, as below.

`app.internalPlugins` and `app.commands` are still unmocked on purpose: neither has an honest empty
state. Real Obsidian always ships core plugins with several enabled, and this package's
`Plugin.addCommand` records into the plugin's own mock-only registry, so answering "none" for either
would be a wrong answer rather than an empty vault.

## What still throws

Everything else `obsidian-typings` declares is **deliberately not mocked**, and reading it throws
through the [strict proxy](/obsidian-test-mocks/guides/strict-mocks/):

```typescript
const app = App.createConfigured__();
app.commands; // Error: Property "commands" is not mocked in App
```

That is the guarantee working, not a gap. A mock that answered `undefined` for a member it cannot model
would turn a loud failure into a wrong test result — so a member is implemented only when there is real
behavior or real state behind it, never as an inert stub.

The full split is recorded in `scripts/obsidian-typings-unimplemented.json` and enforced by
`src/obsidian/obsidian-typings-conformance.test.ts`: every augmented member is either implemented above
or listed there, so an `obsidian-typings` upgrade that introduces new members fails the suite until
somebody decides about them.

## Working with an unmocked member

Assign it before the code under test reads it:

```typescript
import { App } from 'obsidian-test-mocks/obsidian';

const app = App.createConfigured__();
const original = app.asOriginalType__();

// Type-safe with obsidian-typings installed — no casts needed.
original.internalPlugins = { manifests: {} };
```

Without `obsidian-typings`, assign through a `Record` cast:

```typescript
(app as unknown as Record<string, unknown>)['internalPlugins'] = { manifests: {} };
```

If you find yourself assigning the same member in every test, that is a good sign it should be
implemented here instead — please open an issue.
