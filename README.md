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

| Import path                                          | Description                                                               |
| ---------------------------------------------------- | ------------------------------------------------------------------------- |
| `obsidian-test-mocks/obsidian`                       | Mocks for every class/function in `obsidian.d.ts`                         |
| `obsidian-test-mocks/setup`                          | Exports `setup()` / `teardown()` for prototype extensions and globals     |
| `obsidian-test-mocks/vitest-setup`                   | One-stop Vitest setup file: calls `setup()` + mocks the `obsidian` module |
| `obsidian-test-mocks/jest-setup`                     | Jest setup file: calls `setup()` for prototype extensions and globals     |
| `obsidian-test-mocks/obsidian-typings/setup`         | Exports `setup()` / `teardown()` for `obsidian-typings` bridges           |
| `obsidian-test-mocks/obsidian-typings/vitest-setup`  | Vitest setup file: auto-calls `obsidian-typings` bridge `setup()`         |
| `obsidian-test-mocks/obsidian-typings/jest-setup`    | Jest setup file: auto-calls `obsidian-typings` bridge `setup()`           |

## Quick start

Add the Vitest setup files — they patch prototypes/globals and mock `obsidian` automatically:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: [
      'obsidian-test-mocks/vitest-setup',
      'obsidian-test-mocks/obsidian-typings/vitest-setup'
    ]
  }
});
```

Then build a vault in memory and exercise the code under test:

```typescript
import { App } from 'obsidian-test-mocks/obsidian';

const app = App.createConfigured__({
  files: {
    'notes/daily/2024-01-01.md': '# New Year'
  }
});
```

## Documentation

The full documentation — guides plus the complete, searchable **API reference** generated from the
library's TSDoc — is published at
[mnaoumov.dev/obsidian-test-mocks](https://mnaoumov.dev/obsidian-test-mocks/).

- [API reference](https://mnaoumov.dev/obsidian-test-mocks/api/)
- [Getting Started](https://mnaoumov.dev/obsidian-test-mocks/guides/getting-started/)
- [Test Runner Setup](https://mnaoumov.dev/obsidian-test-mocks/guides/test-runner-setup/)
- [Importing the Mocks](https://mnaoumov.dev/obsidian-test-mocks/guides/importing-mocks/)
- [Creating Mock Instances](https://mnaoumov.dev/obsidian-test-mocks/guides/creating-mocks/)
- [Strict Mocks](https://mnaoumov.dev/obsidian-test-mocks/guides/strict-mocks/)
- [Type Bridging](https://mnaoumov.dev/obsidian-test-mocks/guides/type-bridging/)
- [Using with `obsidian-typings`](https://mnaoumov.dev/obsidian-test-mocks/guides/obsidian-typings/)
- [Design Principles](https://mnaoumov.dev/obsidian-test-mocks/guides/design-principles/)

## Support

<!-- markdownlint-disable MD033 -->

<a href="https://www.buymeacoffee.com/mnaoumov" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="60" width="217"></a>

<!-- markdownlint-enable MD033 -->

## My other Obsidian resources

[See my other Obsidian resources](https://github.com/mnaoumov/obsidian-resources).

## License

© [Michael Naumov](https://github.com/mnaoumov/)
