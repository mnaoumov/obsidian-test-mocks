---
title: Getting Started
description: Install obsidian-test-mocks, pick an entry point, and write your first test against the Obsidian API.
sidebar:
    order: 1
---

`obsidian-test-mocks` provides in-memory implementations of every class and function in `obsidian.d.ts`,
plus the prototype extensions Obsidian adds to DOM and JavaScript builtins. Point your test runner at it
and plugin code that does `import { ... } from 'obsidian'` runs in a plain Node/jsdom process — no vault,
no Electron, no real Obsidian.

## Installation

```bash
npm install --save-dev obsidian-test-mocks
```

Peer dependency: `obsidian`.

## Entry points

| Import path                                         | Description                                                              |
| --------------------------------------------------- | ------------------------------------------------------------------------ |
| `obsidian-test-mocks/obsidian`                      | Mocks for every class/function in `obsidian.d.ts`                        |
| `obsidian-test-mocks/setup`                         | Exports `setup()` / `teardown()` for prototype extensions and globals    |
| `obsidian-test-mocks/vitest-setup`                  | One-stop Vitest setup file: calls `setup()` + mocks the `obsidian` module |
| `obsidian-test-mocks/jest-setup`                    | Jest setup file: calls `setup()` for prototype extensions and globals    |
| `obsidian-test-mocks/obsidian-typings/setup`        | Exports `setup()` / `teardown()` for `obsidian-typings` bridges          |
| `obsidian-test-mocks/obsidian-typings/vitest-setup` | Vitest setup file: auto-calls `obsidian-typings` bridge `setup()`        |
| `obsidian-test-mocks/obsidian-typings/jest-setup`   | Jest setup file: auto-calls `obsidian-typings` bridge `setup()`          |

## Your first test

Wire up the setup file for your runner — see
[Test Runner Setup](/obsidian-test-mocks/guides/test-runner-setup/) — then build a vault in memory and
exercise the code under test:

```typescript
import { App } from 'obsidian-test-mocks/obsidian';
import {
  expect,
  it
} from 'vitest';

it('reads a note out of the vault', async () => {
  const app = App.createConfigured__({
    files: {
      'notes/daily/2024-01-01.md': '# New Year'
    }
  });

  const file = app.vault.getFileByPath('notes/daily/2024-01-01.md');
  expect(file).not.toBeNull();
  expect(await app.vault.read(file!)).toBe('# New Year');
});
```

`createConfigured__()` builds a fully wired `App`, creating the `notes` and `notes/daily` folders from
the file paths automatically.

## The `__` suffix

Any member ending in `__` is **mock-only** — it does not exist in the real Obsidian API. That covers the
factories (`create__()`), the type bridges (`asOriginalType__()` / `fromOriginalType__()`), and the test
helpers (`simulateClick__()`, `simulateChange__()`). Everything without the suffix is a faithful stand-in
for something `obsidian.d.ts` declares.

## Where to next

- [Test Runner Setup](/obsidian-test-mocks/guides/test-runner-setup/) — Vitest, Jest, and everything else.
- [Importing the Mocks](/obsidian-test-mocks/guides/importing-mocks/) — why test files import from
  `obsidian-test-mocks/obsidian` rather than `obsidian`.
- [Creating Mock Instances](/obsidian-test-mocks/guides/creating-mocks/) — factories, spying on
  construction, and the pre-configured `App`.
- [Strict Mocks](/obsidian-test-mocks/guides/strict-mocks/) — what happens when you touch something that
  is not mocked, and how to fill the gap.
- [Type Bridging](/obsidian-test-mocks/guides/type-bridging/) — moving between mock types and real
  obsidian types.
- [Using with `obsidian-typings`](/obsidian-test-mocks/guides/obsidian-typings/) — bridging the internal
  API surface.
- [API reference](/obsidian-test-mocks/api/) — the complete, searchable API generated from the library's
  TSDoc.
