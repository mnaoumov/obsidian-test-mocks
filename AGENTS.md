# AGENTS.md

## Project Overview

`obsidian-test-mocks` is a standalone npm package providing comprehensive test mocks for the Obsidian plugin API. It publishes as a dual-format (ESM + CJS) package with seven entry points: `obsidian`, `setup`, `vitest-setup`, `jest-setup`, and the three deprecated no-ops `obsidian-typings/setup`, `obsidian-typings/vitest-setup`, and `obsidian-typings/jest-setup`.

## Commands

- `npm test` — run tests (Vitest)
- `npm run test:coverage` — run tests with v8 coverage
- `npm run test:watch` — watch mode
- `npm run lint` — run ESLint
- `npm run lint:fix` — auto-fix lint issues
- `npm run format` — format with dprint
- `npm run format:check` — check formatting
- `npm run lint:md` — lint markdown files
- `npm run lint:md:fix` — auto-fix markdown lint issues
- `npm run spellcheck` — spell check with cspell
- `npm run build` — full build pipeline
- `npm run build:compile` — TypeScript type-check only
- `npm run version` — run build (used as npm version hook)
- `npm run docs:build` — generate the API reference + OG images, build the Astro site, then link-check it
- `npm run docs:dev` — regenerate the API reference, then run the Astro dev server
- `npm run docs:preview` — serve the already-built `docs/dist`

## Architecture

### Directory Structure

- `src/obsidian/` — mocks for every class/function in `obsidian.d.ts`
- `src/obsidian-typings/` — deprecated no-op setup entry points, kept for one major so the ~30 consumer repos that name them in a Vitest/Jest config do not fail at runner startup. The bridge layer they used to install is gone: the mocks carry Obsidian's real internal names themselves (L4).
- `src/globals/` — prototype extensions Obsidian adds to DOM/JS builtins (HTMLElement, Document, Array, String, etc.)
- `src/internal/` — shared implementation details NOT exported from the package
- `docs/` — the Astro + Starlight documentation site (`docs/src` is its `srcDir`; `docs/dist` the build
  output; `docs/public` its static assets). See [Documentation site](#documentation-site).
- `scripts/docs-gen/` — the ts-morph API-reference generator and the satori OG-image generator that feed it

### Key Design Decisions

L1. **Only expose what Obsidian actually has.** The package must mock exactly the public API — no extra classes, no internal helpers in the public surface. Anything Obsidian does not have belongs in `src/internal/`. "What Obsidian has" is `obsidian.d.ts` PLUS the internals `obsidian-typings` declares: a member such as `Menu.items` is real, merely undeclared publicly, so a mock may implement it (see L4). Only the package's EXPORTED classes stay strictly `obsidian.d.ts`-bound — an `obsidian-typings` type with no `obsidian.d.ts` counterpart (`Plugins`, `Commands`) never becomes a `src/obsidian/` export. It may still be implemented in `src/internal/`, which is exactly what L7 already does for the `DataAdapter` interface: `Plugins` lives in `src/internal/plugins.ts` and `App.plugins` points at it. That placement is invisible to the public surface yet fully typed for consumers, because `src/internal/` is emitted into `dist` and referenced by relative path from the public declarations (`FileSystemAdapter.d.mts` already imports `InMemoryAdapter` that way).

L2. **Meaningful implementations first.** Mocks should have real in-memory behavior (state tracking, callback invocation, data storage). Only use `noop()` (sync) or `await noopAsync()` (async) from `src/internal/noop.ts` for methods whose bodies would otherwise be completely empty (pure UI operations with no meaningful implementation, e.g., rendering, focus). If a method already has any logic in its body, do not add `noop()` or `await noopAsync()` — they are only for otherwise-empty methods.

L3. **No `obsidian-typings` imports in `src/`.** The `obsidian-typings` package uses `declare module 'obsidian'` augmentation which activates globally on import. To avoid side effects, all needed type shapes are inlined in `src/internal/types.ts`. It is a **devDependency only**, so the no-runtime-dependency guarantee holds. The one place that reads it is `scripts/helpers/obsidian-typings-surface.ts`, which builds its **own** throwaway `Program` for the conformance tests — the augmentation is visible inside that program and nowhere else, which is precisely why it does not violate this rule.

A shape inlined in `src/internal/types.ts` is **not** retired by `obsidian-typings` declaring it. That is the case L3 exists for, not a workaround waiting on a typings release: `src/` type-checks against `obsidian.d.ts` alone, so a member living only in the `declare module 'obsidian'` augmentation is invisible there however it is published. Measured on 2026-09-18 — `obsidian-typings` gained `ViewStateResult.close`, `layout` and `done`, and swapping `ViewStateResultInternal` for the real `ViewStateResult` still fails `build:compile` with nine `TS2339` / `TS2353` errors across `FileView.ts`, `WorkspaceLeaf.ts` and `FileView.test.ts`. What a typings release *can* retire is a shape the mocks model with **no** declaration behind it at all; the inline itself stays.

L4. **`__` suffix for members that do not exist in Obsidian AT ALL.** Any public member (field, method, static) Obsidian itself does not have must end with `__` to signal it is mock-only: factory methods (`create__()`), type bridges (`asOriginalType__()`), test helpers (`simulateClick__()`), and mock-only tracking fields (`cache__`, `menuItems__`).

The test is **"does Obsidian have this?"**, not "is it in `obsidian.d.ts`?". A member `obsidian-typings` declares — `Menu.items`, `Modal.bgEl`, `Vault.getConfig`, `Component._loaded` — is a real Obsidian internal that the public typings merely omit, so it takes its **real name with no suffix**. Marking it `__` would assert something false, and it is what forced the old `src/obsidian-typings/` bridge layer to exist at all: the bridges did nothing but map `items__` back to `items`. Implement the member under its real name and there is nothing left to bridge.

A member is implemented only when the mock can back it with real behavior or real state (L2). Everything else `obsidian-typings` declares stays unmocked and throws through the strict proxy — see `src/obsidian/obsidian-typings-conformance.test.ts`, which requires every augmented member to be either implemented or listed in `scripts/obsidian-typings-unimplemented.json`. Regenerate that inventory (and the guide's table) with `npm run build:generate:typings-surface`; it is deliberately NOT part of `npm run build`, because auto-regenerating would silently absorb exactly the drift the test exists to catch.

L5. **`create__()` factory pattern.** All mock classes have a static `create__()` factory method, regardless of whether the constructor is public in `obsidian.d.ts`. For classes with non-public constructors, the actual constructor is `protected`. This ensures all instance creation is spyable via `vi.spyOn(ClassName, 'create__')`. Internal code must always use `create__()` instead of `new` (except inside `create__()` itself). `super()` calls in subclass constructors are the only acceptable direct constructor invocations. When a subclass `create__()` has an incompatible signature with the base class, use `create2__()`, `create3__()`, etc. to avoid TypeScript static-side conflicts. Do NOT use `override` on `create__()` — use numbered variants instead.

L6. **`castTo<T>()` for type bridging** (intentionally allows `as unknown as T` casts). When mock types need to satisfy obsidian's type system (e.g., `EventRef.e` expects `obsidian.Events`), use `castTo<ObsidianType>(this)` from `src/internal/castTo.ts`. Every mock class exposes `asOriginalType__()` (instance method, mock → real type) and `fromOriginalType__()` (static method, real → mock type). The import alias convention is `XxxOriginal` (e.g., `import type { App as AppOriginal } from 'obsidian'`). When a subclass `fromOriginalType__()` has an incompatible static signature with the base class (e.g., generic → non-generic), use numbered variants (`fromOriginalType2__()`, `fromOriginalType3__()`, etc.) following the same convention as L5.

L7. **`DataAdapter` is an interface.** In `obsidian.d.ts`, `DataAdapter` is an interface, not a class. `FileSystemAdapter` and `CapacitorAdapter` implement it. The shared in-memory filesystem lives in `src/internal/in-memory-adapter.ts`.

L8. **Fields that shadow obsidian-typings.** When `obsidian-typings` declares a field as public (e.g. `Events._`, `Component._loaded`) but `obsidian.d.ts` does not, the mock implements it **public, under that exact name** — leading underscore included — per L4, and uses `castTo` where needed for type compatibility. Keep such a field private only when nothing outside the class needs it and no consumer reads it through the `obsidian-typings` types; a private field is then an implementation detail rather than a mocked member, and does not count as implementing it.

L9. **`strictProxy` constructors with `constructor__()` hooks.** Every mock class (including abstract classes) must use `strictProxy(this)` in its constructor and provide a spyable `constructorN__()` method. The pattern is: `constructor(args) { /* init */ const self = strictProxy(this); self.constructorN__(args); return self; }` with a corresponding `public constructorN__(_args): void { noop(); }`. The `strictProxy()` call prevents access to unmocked properties. The `constructorN__()` method enables spying on construction via `vi.spyOn(Class.prototype, 'constructorN__')`. Numbering follows inheritance depth: a root class uses `constructor__()`, its child uses `constructor2__()`, grandchild `constructor3__()`, etc. — each class in the chain gets the next available number.

L10. **Never `override` a `__` method — always use numbered variants.** Any mock-only method ending with `__` must never use the `override` keyword. Instead, each subclass increments the numeric suffix: `methodName__()` → `methodName2__()` → `methodName3__()`, etc. This applies to all `__` methods: `create__`, `constructor__`, `asOriginalType__`, `fromOriginalType__`, and any future mock-only methods. The inherited base method remains callable at any level, returning the parent type.

L11. **Track every new `obsidian` release.** Whenever a new `obsidian` package is published, update this project so the mocks fully match the latest `obsidian.d.ts` public API — add mocks for newly introduced classes/functions/members, update changed signatures, and remove anything dropped from the public API. The mock surface must stay an exact, current reflection of `obsidian.d.ts` (consistent with L1 and L4): nothing in `obsidian.d.ts` may be left unmocked, and no mock-only addition may masquerade as public API (mock-only members keep the `__` suffix). Bump the `obsidian` devDependency/peerDependency range to cover the new version as part of the same change.

### Internal Modules

- `castTo.ts` — `castTo<T>()` utility for unsafe type bridging
- `delegated-event-registry.ts` — the delegated `on` / `off` shared by `Document.prototype` and `HTMLElement.prototype`: registrations live on the target's own `_EVENTS` record, under the name `obsidian-typings` declares, and events are filtered through `matchParent` as Obsidian does
- `empty-view.ts` — Obsidian's empty view, the "New tab" page every `WorkspaceLeaf` is born holding as `_empty`; an `obsidian-typings` interface with no `obsidian.d.ts` class, so it lives here rather than in `src/obsidian/` (L1)
- `file-value-registry.ts` — the `WeakSet` that lets `LinkValue.looseEquals` recognize a `FileValue` without importing it. Obsidian decides that branch with an `instanceof`; the mock cannot, because `FileValue` already imports `LinkValue` to build one per backlink, so the reverse import would close a cycle through `front-matter-object-value.ts` and `link-value-from-reference.ts` as well. Same reasoning, same shape as `workspace-layout.ts`
- `front-matter-object-value.ts` — the `ObjectValue` behind `FileValue.getProps`, with the evaluator that reads a frontmatter string as a wikilink, a URL or a date and reinstalls itself on every nested list and object. Obsidian spells it `ObjectValue.fromFrontMatter`, a static NEITHER `obsidian.d.ts` NOR `obsidian-typings` declares, so L1 keeps it off the exported class and L4 forbids the `__` suffix that would claim Obsidian lacks it — the same reasoning that puts `lazy-evaluator.ts` here
- `html-sanitizer.ts` — the sanitizer behind `sanitizeHTMLToDom`: a port of the DOMPurify 3.0.1 passes Obsidian runs, with Obsidian's config and its two load-time hooks. `html-sanitizer-allowlists.ts` holds DOMPurify's default allowlists, copied from Obsidian's `app.js` (and excluded from cspell)
- `icon-registry.ts` — shared `Map<string, string>` for icon storage (addIcon, removeIcon, getIcon, etc.). It starts empty: Obsidian's Lucide set and its own glyphs are deliberately not bundled, so their ids resolve to nothing
- `in-memory-adapter.ts` — in-memory filesystem base class for `FileSystemAdapter` and `CapacitorAdapter`
- `lazy-evaluator.ts` — the conversion behind `ListValue.lazyEvaluator` and `ObjectValue.lazyEvaluator`: a raw element or property wrapped into a `Value`. Obsidian has ONE such function and installs it on both classes, so it lives here rather than in either of them; it has to construct the classes that call it, which is the one import cycle it carries a waiver for
- `link-value-from-reference.ts` — a cached link, embed or frontmatter-link reference wrapped as a `LinkValue`, behind `FileValue.getLinks` and `getEmbeds`. Obsidian spells it `LinkValue.fromReference`, undeclared in the same way `front-matter-object-value.ts` describes
- `markdown-block-ids.ts` — the block ids of a note's sections and list items, and its `blocks` collection, assigned
  after parsing the way Obsidian's worker assigns them: an inline `^id` ending a paragraph's or a heading's text, and a
  standalone `^id` block given to the section before it and then dropped
- `markdown-container-definitions.ts` — the link reference and footnote definitions inside a note's blockquotes,
  callouts, list items and footnote definitions: each container's lines with its prefix stripped, run through the
  top-level block scan, so `collectReferences` sees a nested definition as Obsidian's worker does
- `markdown-inline-block-ids.ts` — which inline `^id`s a run of inline text holds: a port of `remark-parse` 8's inline
  tokenizer loop and the tokenizers Obsidian's worker runs in it, since the worker reads an id wherever a token
  boundary falls before its `^` and it runs to the end of the content being tokenized
- `markdown-gap-blocks.ts` — the top-level blocks between the sections the parser found first (lists, frontmatter):
  paragraphs, blockquotes and callouts, fenced and indented code, comments, math, HTML, tables, thematic breaks, every
  heading, link reference definitions, footnote definitions and standalone block ids. Each tokenizer is a port of the one
  Obsidian's metadata worker runs, which is `remark-parse` 8 (`commonmark` and `gfm` on) plus Obsidian's own comment,
  math, footnote and block-id tokenizers, so a quirk there is a quirk here on purpose
- `markdown-leaf-blocks.ts` — the container-aware pre-pass behind `parseMarkdownContent`'s list items: which lines start
  an item, and which a fenced code block, a `%%` comment, a `$$` math block, an HTML block, an indented code block, a
  table or a link reference definition hides. A regular expression cannot answer either, since an unclosed block runs to
  the end of the blockquote or list item around it
- `markdown-references.ts` — a note's `footnotes`, `footnoteRefs` and `referenceLinks`, read off the top-level
  definitions the gap scan found and a scan of the inline text for `[^label]` references and `^[…]` inline footnotes,
  the latter a port of `remark-footnotes` 2's tokenizer, which the worker runs
- `noop.ts` — `noop()` / `noopAsync()` helpers for otherwise-empty method bodies (see L2)
- `plugins.ts` — the community-plugin registry behind `App.plugins`; an `obsidian-typings` interface with no `obsidian.d.ts` class, so it lives here rather than in `src/obsidian/` (L1, L7)
- `setting-definition-renderer.ts` — renders declarative setting definitions the way Obsidian 1.13 does; drives `SettingTab.renderTab__()` / `refreshDomState()`
- `strict-proxy.ts` — `strictProxy()` mock wrapper that throws on unmocked property access (see L9)
- `tags-list-value.ts` — the `ListValue` subclass behind `FileValue.getTags` and a frontmatter `tags` property: the `lucide-tags` icon and an `includes` built on `TagValue.tagMatches`, so a list holding `#parent/child` contains `#parent`. Anonymous in the shipped bundle and declared in NEITHER `obsidian.d.ts` NOR `obsidian-typings`, which both type those accessors as a plain `ListValue` — the same pair of reasons that puts `front-matter-object-value.ts` here
- `types.ts` — inlined type shapes (from obsidian-typings) to avoid augmentation side effects
- `type-guards.ts` — `assert()`, `ensureNonNullable()`, and similar guards
- `unknown-view.ts` — Obsidian's unknown view, what a leaf shows for a view type nothing registered a creator for; it extends `EmptyView`, as in Obsidian, and lives here for the same reason
- `view-registry.ts` — the registry behind `App.viewRegistry`: which creator builds a view of a type, and which view type a file extension opens in. `WorkspaceLeaf.setViewState` and `openFile` read it, and it is an `obsidian-typings` interface with no `obsidian.d.ts` class (L1, L7)
- `workspace-layout.ts` — the registry the workspace layout tree walks with: the parent placeholder an unattached `WorkspaceItem` holds, and which items are `WorkspaceContainer`s. It exists because both checks are needed in `WorkspaceItem`, below which both classes sit, so an `instanceof` there would be an import cycle

## TypeScript

- Extends `@tsconfig/strictest`
- Target: es2022, Module: node16

### Type Validation (manual `skipLibCheck` wrapper)

`tsconfig.json` sets `skipLibCheck: true`. This is a deliberate exception to the usual "never weaken `@tsconfig/strictest`" stance: it lets `tsc` type-check our `.ts` files without failing on broken upstream `.d.ts` files we do not control (e.g. a given version's `@vitest/runner` declarations, which ship optional properties that violate `exactOptionalPropertyTypes`). This replaces the old `patch-package` workaround — there is no longer a `patches/` directory or a `postinstall` hook.

The declarations we author are still fully validated. `scripts/build-compile.ts` (run by `build:compile`) does two passes:

1. `tsc --build --force` — the normal compile, with `skipLibCheck: true`.
2. An in-memory re-check via `checkProjectTypes()` (from `@mnaoumov/typescript-dev-toolkit/check-project-types`) with `skipLibCheck: false`, reporting **only** diagnostics whose source file is under the project root and outside `node_modules`. It prints `Ignored N diagnostic(s) outside the validated set.` — when upstream is fixed and `N` reaches `0`, the workaround is no longer doing anything and `skipLibCheck` can go back to `false`.

## Testing

- The project aims for 100% test coverage.
- Test files are co-located with source files: `src/obsidian/App.test.ts` tests `src/obsidian/App.ts`.
- Vitest with explicit imports (globals: false) — always import `describe`, `it`, `expect`, etc. from `'vitest'`
- Coverage provider: v8

### The two Vitest projects — where a test file runs depends on where it lives

`scripts/vitest-config.ts` splits the suite in two, and the split is load-bearing:

- **`unit-tests`** — `src/**/*.test.ts` only. `environment: 'jsdom'` plus
  `src/globals/vitest-setup.ts`, which is what supplies the `obsidian` mock.
- **`unit-tests:scripts`** — `scripts/**/*.test.ts` and `docs/src/**/*.test.ts`.
  `environment: 'node'`, NO setup files (the docs generator reads this repo's own sources with ts-morph,
  so a global `obsidian` mock would only get in the way).

**Both projects spread `SHARED_TEST_DEFAULTS`, which is where the 30 s `testTimeout` comes from — and the
spread is the point, not the number.** Vitest 4 projects do NOT inherit the root-level `test` options, so
a project that omits `testTimeout` silently runs on the built-in 5000 ms default, with no warning and
nothing in the config to hint that one project is on a tighter budget than its sibling. That is how
`unit-tests` — whose `src/**` is the only tree `coverage.include` instruments, so it is the project that
actually pays for `npm run test:coverage`, the release gate `npm run version` runs — ended up with the
tightest budget in the repo while its uninstrumented sibling had 30 s. The
budget covers two costs a per-suite number cannot see: v8 coverage instrumentation (~2.2x, measured on
`obsidian-integration-testing`'s tree) and the CPU contention of a busy machine. Suites that are slow in
their own right — rendering an OG image with satori + resvg, building a ts-morph `Project` — sit
comfortably inside it. It is a ceiling, not a floor, so the fast suites sharing it cost nothing. Add a
project by spreading the defaults, not by remembering to write a timeout.

**Anything outside `src/` must stay in the `node` project — that is a correctness rule, not tidiness:
mocking a node builtin does not work under `jsdom`.** Measured on 2026-09-09 with a throwaway module
under `scripts/helpers/` importing `existsSync` from `node:fs`:

| | `jsdom` | `node` |
| --- | --- | --- |
| `vi.mock('node:fs')`, no factory | **silent no-op** — `vi.isMockFunction(existsSync)` is `false` even in the test file's own import, and every call reads the real disk | works — the spy reaches the test file AND the module under test |
| `vi.mock('node:fs', factory)` | works, but the factory must also return a `default`, or the module under test throws `No "default" export is defined on the "node:fs" mock` | works, with or without `default` |

The no-factory row is what makes this dangerous rather than merely annoying: nothing fails, so a suite
written against it silently asserts against the real filesystem and passes exactly where the real answer
happens to match what was expected. `scripts/helpers/package-manager.test.ts` was in that state while
`scripts/**` was collected by the jsdom project — 15 of its 31 tests green for the wrong reason, being
the ones whose expected value was the npm fallback the detection had fallen through to.

The per-file `@vitest-environment node` docblock tag is NOT a rescue: `src/globals/vitest-setup.ts` needs
a DOM, so pinning `node` per file inside the jsdom project trades the silent pass for
`document is not defined`. The project split is the fix.

Both projects' `include` globs are narrow on purpose, so a new test file cannot be collected by the
wrong one by accident. `npm test` is a bare `vitest run`, which runs every project.

## Code Conventions

- Mock files in `src/obsidian/` use PascalCase to match the original obsidian class/function names (e.g., `App.ts`, `Vault.ts`). All other files (`src/internal/`, `scripts/`) follow the global kebab-case convention. Exception: `src/internal/castTo.ts` is camelCase to mirror its exported `castTo()` function.
- `unicorn/filename-case` enforces the above, accepting all three cases (`camelCase`, `kebabCase`, `pascalCase`) because the name is dictated by the API being mocked. `sanitizeHTMLToDom.ts` is listed in the rule's `ignore` — no case can express its embedded acronym, and the file mirrors Obsidian's spelling exactly.

### Linting

The ESLint config (`scripts/eslint-config.ts`) tracks `obsidian-dev-utils`' strict config, minus what is specific to a plugin shipping into the Obsidian renderer (`eslint-plugin-n`'s Node-16 floor, `eslint-plugin-obsidianmd`). It runs `eslint-plugin-unicorn`'s `recommended` on top of the tseslint/stylistic/import-x/perfectionist stack.

**"Tracks" is now checked rather than intended, and every deliberate difference is recorded in `eslint-config-divergences.json`.** It is a hand copy, and a hand copy drifts: `obsidian-dev-utils` refined `@typescript-eslint/no-floating-promises`, `no-restricted-syntax` and `capitalized-comments` over eighteen months and one of those fixes reached one of the four copies. The dependency sweep (`update-npm-deps.ps1`) now resolves both configs with ESLint's own `calculateConfigForFile` at a matched role — `scripts/commit.ts` at both ends — and fails on any difference this file does not account for. The comparison is **directional**: only "`obsidian-dev-utils` enables or refines something this copy does not" is a finding. A rule enabled here and off there is printed as information and never fails, because this copy is then the stricter one and that package's reasons for its own relaxations are measurements about its own tree. Only rules one of the two configs **names in its source** are compared, because ESLint merges each rule's `meta.defaultOptions` into the resolved options and two different ESLint patch versions therefore disagree about rules neither config has ever mentioned. The correspondence runs both ways, so an entry describing a divergence that no longer exists fails too — which is what stops the file ageing the way the comments at the call sites did.

It loads `eslint-plugin-jsdoc` and `eslint-plugin-tsdoc` with the same rule set as `obsidian-dev-utils`, scoped to non-test `src/**`: every exported function, class, interface, type alias, enum, and every non-private method and property of an exported class needs a TSDoc description, and every source file an `@file` overview. Mirroring Obsidian's API name for name is NOT a reason to skip one — a consumer reads these declarations, and what a mock tracks, no-ops or adds (`__` helpers) is exactly what Obsidian's own docs cannot say. `jsdoc/no-blank-blocks` runs without its fixer, so an empty placeholder block is reported rather than accepted; write a real description.

Two rules are scoped off where they cannot be satisfied, both for the same reason — the mock surface answers to Obsidian's names, not ours:

- `unicorn/consistent-boolean-name` is off for non-test `src/obsidian/**` and `src/globals/**`. Every boolean there is Obsidian's (`requireApiVersion`, `Array.prototype.contains`, `Object.each`, `MarkdownRenderer.supportWorker`, the `_center` / `_system` / `resetTimer` parameters).
- `unicorn/name-replacements` stays on everywhere; sites naming an Obsidian member (`EventRef`'s `ctx` / `e` / `fn`, `Vault.configDir`, `Keymap.isModEvent`, `ViewState.eState`) carry an inline disable rather than being renamed.

Reserved-word expansions are spelled `$function` / `$arguments` / `$string` rather than the rule's default `function_` / `arguments_`, so a trailing underscore never reads as the `__` mock-member suffix.

`import-x/no-nodejs-modules` is off for `scripts/` and friends (build tooling reads from disk) and for `testFiles` — a test runs under vitest in Node and is never part of the published library, so the ban has nothing to protect there. The test exemption is ported from `obsidian-dev-utils`' `getNodeBuiltinsConfigs`, which scopes the same rule off for `context.testFiles`; only the `import-x` half comes across, because its twin `obsidianmd/no-nodejs-modules` arrives with the plugin-directory rules this package does not register. It is what lets the two conformance tests read `obsidian.d.ts` and the checked-in typings inventory without an inline waiver at each import.

`linterOptions.reportUnusedDisableDirectives` is set to `'error'` repo-wide. ESLint's default is `'warn'`, which would let a waiver that has stopped silencing anything sit in the tree — still naming a rule as the reason for the code beneath it, untruthfully. Every rule here is an error; the directives claiming to suppress them are held to the same bar. `npm run lint` also passes `--max-warnings 0` (the `lint` from `@mnaoumov/typescript-dev-toolkit/linters/eslint`), so a warning from any source fails the run rather than exiting 0; `'error'` here still matters, because it names the directive as the failure instead of a bare warning count.

**`npm run lint` no longer classifies ESLint's exit** (2026-10-15). The local `scripts/helpers/eslint.ts` it used to run told exit `1` (lint findings, evidence about the source) from exit `2` (a rule that threw, or a broken config) and from a Windows child that dies with `3221225477` (`0xC0000005`) printing nothing. The toolkit's `lint` lets `execFromRoot` throw on any non-zero exit, so a crash and a finding now read the same. Until the toolkit exports that classification, read the output before assuming a lint failure is a defect in the source.

**The in-house ESLint rules come from `@mnaoumov/typescript-dev-toolkit`** (2026-10-15), as its `inHouseEslintPlugin`, registered under `IN_HOUSE_ESLINT_PLUGIN_NAME` (still `obsidian-dev-utils`, so every rule id and disable comment keeps its name). The vendored copies under `scripts/helpers/eslint-rules/`, their tests, `tsconfig.eslint-test.json` and the `check:vendored-eslint-rules` gate that held them byte-identical to upstream are gone. So are the vendored helpers the scripts ran on: `scripts/` imports `execFromRoot`, `resolveToolCommand`, `wrapCliTask`, `checkProjectTypes` and the lint and format runners from `@mnaoumov/typescript-dev-toolkit`, and `assertNever`, `ensureNonNullable`, `castTo` and `toPosixPath` from `@mnaoumov/typescript-lib`. Both are devDependencies only: `src/` still imports neither, so the published package keeps no runtime dependency on them.

**Every entry script runs through `wrapCliTask`**, which honours the per-script off switch (`LINT_MD=0 npm run lint:md`) the way the old `exitIfScriptDisabled` did. A task that returns nothing exits with the `process.exitCode` it left (since `@mnaoumov/typescript-dev-toolkit` 1.3.0), so a plain `process.exitCode = 1; return;` fails the script, which is how `scripts/check-copy-sync.ts` reports its findings. Before 1.3.0 it called `process.exit(0)` and overrode that code.

What stays in `scripts/helpers/` is what no package exports: `copy-sync.ts` and `git-content.ts` (the copy-sync gate and its read of the git index), `npm-pack.ts` (the release script's tarball-name parse), `obsidian-typings-surface.ts` (the conformance tests' typings inventory), `markdown-lint-targets.ts`, and the `eslint-plugin-modules-newlines` type declaration. `markdown-lint-targets.ts` exists because the toolkit's markdown `lint` hands every tracked `*.md` file to `linkinator`, and the guides under `docs/` link to each other base-absolutely (`/obsidian-test-mocks/guides/...`), which resolves only against the built site: so `lint:md` and `lint:md:fix`, given no paths, pass every tracked markdown file outside `docs/` instead, and the guides are link-checked by `docs:build`.

## Releasing

`npm run version <major|minor|patch|premajor|preminor|prepatch|prerelease|x.y.z>` (`scripts/version.ts`)
runs the full check suite, bumps the version, rewrites `CHANGELOG.md`, commits, tags, pushes, and creates
the GitHub release with the `npm pack` tarball attached. It stops there.

The npm publish is a SEPARATE, CI-only step: `.github/workflows/publish-npm.yml` reacts to the published
release, downloads that same tarball, and publishes it with npm trusted publishing (OIDC) - there is no
`NPM_TOKEN` anywhere, locally or in repo secrets. Consequences worth knowing:

- The bytes on npm are the bytes attached to the release, which is what
  `.github/workflows/attest-release-assets.yml` attests. Do not "fix" this by rebuilding in CI: that would
  publish a second, unattested build of the same version.
- The workflow FILENAME is part of the trust configuration on npmjs.com (package Settings -> Trusted
  Publisher: user `mnaoumov`, repo `obsidian-test-mocks`, workflow `publish-npm.yml`). Renaming or moving
  the file breaks publishing until the npm side is updated to match.
- OIDC only works from a cloud-hosted runner, so a release can no longer be published from a laptop. A
  failed publish is re-run from the Actions tab, not re-done locally.
- The dist-tag comes from the release: `beta` when GitHub marks it a prerelease (which `version.ts` does
  for a `-beta.n` version), `latest` otherwise.

Two npm-12 facts about this path, both measured on npm 12.0.2 / Node 26.5.0 and worth not re-deriving:

- **The tarball's name is parsed, not asserted.** `npm pack --json` changed shape in npm 12 - npm <= 11
  emitted an array of results, npm 12 emits an object keyed by package name. Both are valid JSON, so the
  old `JSON.parse(output) as [NpmPackResult]` cast parsed happily and then read `undefined.filename`,
  crashing `publishGitHubRelease` AFTER the bump, commit, tag and push had already reached the remote.
  `scripts/helpers/npm-pack.ts` now reads both shapes and throws naming the raw output otherwise.
- **The unattended form works here.** `npm run version -- <type> --no-changelog-editing` forwards both
  arguments to `scripts/version.ts` intact; `obsidian-dev-utils` sees npm claim `--no-*` as its own config
  and fail with `EUNKNOWNCONFIG`, but that does not reproduce in this repo. Without the flag,
  `updateChangelog` opens `code -w CHANGELOG.md` and blocks until the editor closes.

## Documentation site

`docs/` is an Astro + Starlight site published to GitHub Pages at
<https://mnaoumov.dev/obsidian-test-mocks/> by `.github/workflows/build-pages.yml` (on a published
release, which re-dispatches itself on `main` because the `github-pages` environment refuses to deploy
from a tag). It has two halves:

- **Guides** — hand-written, in `docs/src/content/docs/guides/`. They are the README's overflow —
  the top-level `README.md` stays a concise overview + navigation, and everything longer lives here.
  This package is a library, not a plugin, so `docs/` is the correct destination (the demo-vault carve-out in
  the plugin README skeleton does not apply).
- **API reference** — GENERATED from this repo's own TSDoc by `scripts/docs-gen/generate-api-docs.ts`
  (ts-morph) into `docs/src/content/docs/api/`, plus `docs/src/generated-sidebar.json` which
  `astro.config.ts` reads. Both are gitignored; so are `docs/public/og` (per-page Open Graph cards
  rendered by satori + resvg) and `docs/dist`. Never hand-edit anything under `docs/src/content/docs/api`.

**GitHub alerts (`> [!NOTE]` and the other four types) become Starlight asides through the site's own Sätteri
mdast plugin**, `scripts/docs-gen/helpers/satteri-plugins/satteri-github-alerts.ts`, registered first in
`astro.config.ts`'s `mdastPlugins`, NOT through `starlight-github-alerts`, which left the dependencies on
2026-09-29. That plugin (`0.4.0`) splices itself in front of an mdast plugin NAMED `starlight-asides`, and Starlight
`0.42` registers its asides as an unnamed factory, so it returned in silence and every alert shipped as a plain
blockquote opening with a literal `[!NOTE]`. `scripts/docs-link-check.ts`, the last step of `docs:build`, now fails
on any page whose blockquote still opens with an alert marker (`scripts/docs-gen/helpers/unrendered-alerts.ts`).
Both helpers are copies of `obsidian-dev-utils`' and sit inside the copy-sync roster; the guard's call site in
`docs-link-check.ts` does not, since that script is this repo's own.

### The pipeline is a COPY of `obsidian-dev-utils`'

Five areas were copied from `obsidian-dev-utils` and should be kept in copy-sync with it:
`scripts/docs-gen/`, `docs/src/`, `astro.config.ts`, `docs/tsconfig.json` and
`.github/workflows/build-pages.yml`.
This package cannot simply depend on `obsidian-dev-utils`: that library lists `obsidian-test-mocks` in its own devDependencies, so the
edge would be a cycle. The helpers the copy needs come from the same `@mnaoumov/typescript-lib` and
`@mnaoumov/typescript-dev-toolkit` modules upstream imports them from, so those imports are not a divergence.

**Most of this copy cannot be asserted byte-identical to upstream after a few mechanical transforms**: the divergences below are semantic, a transform cannot express them, and — measured
2026-09-19 — taking an upstream file whole can now land lint-RED here. So a docs-gen sync is a
read-and-merge, and the list below is what it is merged against.

**But the merge is now gated, per file, by the SHAPE of its diff: `npm run check:copy-sync`**
(`scripts/check-copy-sync.ts` with its pure half in `scripts/helpers/copy-sync.ts`, added 2026-09-19 over
`scripts/docs-gen` and widened to the whole roster the same day). It records, in `copy-sync-baseline.json`,
each upstream file's hunk count and each hunk's added/removed line counts plus a digest of its changed
lines, and fails when a file's shape moves — which it does whether upstream edited the file or this repo
did. Line numbers are deliberately not part of a shape, so one real edit is not reported as a dozen.
**49 files, 37 of them identical** after the recorded transforms (the two TTFs by hash), measured 2026-10-15.

Six things to know before touching a copied file:

- **`COPY_SYNC_PATHS` is the roster, and the five-area list above is its prose half** — keep the two in
  step. A path there covers itself or anything under it, which is why three single files sit beside two trees
  with no separate notion of a file; both sides keep the same spelling.
- **Divergence 1 is two transforms, not baseline entries.** The name is the whole of it, so the gate applies
  `obsidian-dev-utils` → `obsidian-test-mocks` and `Obsidian Dev Utils` → `Obsidian Test Mocks` to
  upstream's text first. That is what leaves most of the roster byte-identical, and for those files this
  gate is exactly as strong as an identity check: the baseline says "no hunks", so any drift at all is
  reported. Resist adding a third arm to make a diff smaller — an arm that rewrites meaning hides the drift
  it was meant to expose.
- **Every differing file names its reason**, from the closed vocabulary in `DIVERGENCE_REASONS`, which is
  this list. A file whose divergence is recorded with no reason FAILS the gate; so does a reason that no
  longer applies. Re-record with `npm run check:copy-sync -- --update`, which keeps the reasons
  and rewrites only the shapes — it is not a way to make the gate green.
- **A file kept under a different name from upstream's is PAIRED in `UPSTREAM_TO_LOCAL_RENAMES`**, not
  treated as a file of ours. Unpaired, an upstream fix to it would be invisible here forever. The map is
  empty today: its one pair was the Sätteri port, which upstream took under this repo's name.
- **Two paths inside an area are never compared**, and are filtered out of BOTH listings so neither is
  reported as unpaired either (`NEVER_COMPARED_PATHS`): `docs/src/assets/favicon.svg`, divergence 5 below;
  and `docs/src/content/`, which is not a copy of anything — the guides and `index.mdx` are this package's
  own prose and `content/docs/api` is generated. The exclusion is drawn at the path boundary, so
  `docs/src/content.config.ts` beside it IS compared.
- **A binary file is compared by hash, with both sides recorded.** The two Inter TTFs under
  `scripts/docs-gen/assets/fonts` have no hunks to shape, and `git diff` answers a binary pair with
  "Binary files differ" and no `@@` at all — which a hunk parser reads as *identical*, the one wrong
  answer. A file whose bytes hold a NUL is therefore recorded as a digest PAIR, and a change to either side
  fails. The sniff is content, not an extension list, so a new binary cannot arrive unnoticed.

It reads upstream from `raw.githubusercontent.com` and lists it with one `git/trees?recursive=1` call — one
call for all five areas — because the published package ships `dist/` only and a sibling checkout would make
the gate pass only on a machine that has one, and because the unauthenticated rate limit is 60 calls an hour;
`GITHUB_TOKEN` is used when there is one. This repo's side is listed with
`git ls-files` rather than a directory walk, because `docs/src` holds gitignored build output
(`generated-sidebar.json`, `content/docs/api/`) that a walk reports as paired with nothing upstream.
`nano-staged` runs it on any commit that stages a file in an area — two keys, and the brace in
`{docs/src,scripts/docs-gen}/**` has to sit before the `/**` or nano-staged's matcher quietly stops treating
it as a globstar. `CHECK_COPY_SYNC=0` turns it off where there is no network.

**This repo's side is READ from the index too, not just listed from it** (`scripts/helpers/git-content.ts`,
2026-09-19). It would ideally run AFTER `lint:fix` — ESLint covers `scripts/docs-gen`, so `lint:fix` is the
one step here that can rewrite a staged file in it, and a shape measured before it ran is a shape nobody
commits — and it cannot be made to: **nano-staged runs one task group per pattern with `Promise.all`**,
measured against 1.0.2 on 2026-09-19, so a separate key races `lint:fix` instead of following it. Sequencing
exists within one key's command list and nowhere else; key order carries no meaning and is only what
perfectionist sorts it to. So the ordering is made irrelevant rather than enforced: the gate measures the
staged blob, which is the same bytes whether the fixer has run or not, and which is also what a developer
running the gate by hand mid-edit is asking about. The diff is therefore taken between two scratch files
rather than between a scratch file and the working tree, and the failure message names both.

**`docs/tsconfig.json` joined the roster on 2026-09-19, once the hunk that kept it out was settled.** It
included `".astro/types.d.ts"` where upstream includes `"../.astro/types.d.ts"`, and upstream is right:
`astro sync` in this checkout writes `.astro/types.d.ts` at the REPO ROOT and creates no `docs/.astro` at
all, because `astro.config.ts` sits at the root and `srcDir: './docs/src'` moves the sources, not the
project root. So this copy included a file that has never existed — and a `tsconfig` `include` entry
matching nothing is not an error, which is why nothing reported it for as long as it stood. Taking
upstream's path makes the file byte-identical, so it sits in the gate's identical half and carries no
divergence reason. `docs/public/favicon.svg` is the one copied file still outside the roster, as the second
copy of a file that must never be synced.

Keep new divergence to the eight places this package genuinely differs (the list runs to eleven; 6, 8 and 10
are retired and keep their numbers):

1. **`BASE_PATH` / site title / repo URLs** — mechanical renames, all of them the name, and all of them
   applied by the gate's two transform arms rather than recorded as divergence: the package name, and the
   display title (`Obsidian Dev Utils` → `Obsidian Test Mocks`) that `astro.config.ts` names the site with.
   The second arm appears in no file under `scripts/docs-gen`, so it moves no shape there.
2. **`getImportStatement()` (`api-doc-text-utils.ts`)** — this package publishes BARREL entry points, so a
   namespace does not map to a subpath the way `obsidian-dev-utils`' does. `obsidian/**` becomes a named import from
   `obsidian-test-mocks/obsidian`; `globals/**` is a side-effect import of the setup entry point, because
   nothing there is imported by name. `src/obsidian-typings/` holds only the deprecated no-op setup entry
   points, which the generator's file filter skips, so it has no mapping.
   Baseline reason: `barrel-entry-points`, which also covers the `API_INDEX_INTRO` prose in
   `api-doc-page-generation.ts` that explains the arrangement to a reader.
3. **Member slugs (`splitMockOnlySuffix` in the same file)** — slug generation strips `_`, so `create__`
   and `create` (and `onClick__` / `onClick`) collapsed onto ONE route and one page silently overwrote
   the other. Mock-only members therefore get a `-mock` route suffix. `obsidian-dev-utils` has no `__` convention and so
   has no equivalent.
   Baseline reason: `mock-only-suffix`, which also covers the `api-doc-type-merging.ts` header naming the
   `__` convention where upstream names its official-vs-unofficial one.
4. **`EXCLUDED_DIR_SEGMENTS` (`api-doc-source-processing.ts`)** — `internal`, `jest`, `test-helpers`.
   Baseline reason: `excluded-dir-segments`.
5. **The favicon** (`docs/public/favicon.svg`, byte-identical copy in `docs/src/assets/favicon.svg`) —
   this package's own mark, NOT `obsidian-dev-utils`' laptop-and-Matrix-rain one: the Obsidian gem with a dashed copy of itself
   behind it (the mock) and a green check (the passing test). It is the only file under
   `docs/src/assets/` that must never be re-synced from `obsidian-dev-utils`. It feeds three places at once — Starlight's
   `favicon` option, the hero image in `docs/src/content/docs/index.mdx`, and every OG card (rasterized
   by `loadLogoDataUri()` from the `docs/public` copy) — so the two copies must stay identical.
   No baseline entry: `docs/src/assets/favicon.svg` is in `NEVER_COMPARED_PATHS` and `docs/public/` is
   outside the roster. Its CONSEQUENCE is recorded, though — `own-favicon-mark` on
   `docs/src/components/SiteTitle.astro`, whose prose says the site's only mark is the favicon beside the
   title where upstream's says it has no logo at all.
6. **Retired 2026-09-24: the Sätteri processor.** This repo moved the absolute→relative link rewrite
   from remark onto Sätteri first, and upstream then took that port whole — the same processor in
   `astro.config.ts` and the same `scripts/docs-gen/helpers/satteri-plugins/satteri-relative-links.*`
   files, with `remark-plugins/remark-relative-links.*` deleted. Nothing diverges there now, so the
   `satteri-processor` reason and the `UPSTREAM_TO_LOCAL_RENAMES` pair it needed are both gone. The number
   stays so the reasons that cite 5 and 7 keep pointing at the right item.
7. **Rules this repo enables that `obsidian-dev-utils` turns off force local rewrites.** The config
   comparison behind `eslint-config-divergences.json` prints twelve such rules as information, because
   this copy is the stricter one there and needs no entry to be stricter. For the *copy-sync* trees that
   is not free: a file byte-identical to upstream is lint-red here. Two measured instances, 2026-09-19 —
   `unicorn/no-declarations-before-early-exit` (error here, off upstream) is why `generate-og-images.ts`
   declares `fontsDirectory` / `outputDirectory` / `manifestPath` / `faviconPath` at their use sites where
   upstream hoists all four above the first early return; and `import-x/no-default-export` (likewise) is
   why `astro.config.ts` carries an inline waiver upstream does not need. Expect more of these as the two
   configs move: when a sync makes lint red, check this class before assuming drift.
   Baseline reason: `local-strictness-rewrites`.
8. **Retired 2026-10-15: the re-pointed helper imports.** `link-check.ts` took `assertNever` from this
   repo's vendored `scripts/helpers/type-guards.ts`, and the two Sätteri plugin tests took `castTo` from
   `src/internal/castTo.ts`. All three now import from `@mnaoumov/typescript-lib`, as upstream's do, so they
   are byte-identical and the `helpers-re-pointed` reason is gone.
9. **The `api-doc-constants.ts` data tables** — `GENERIC_TYPE_PARAMS` and `TS_GLOBAL_TYPES` enumerate the
   identifiers and external types *this* package's API surface actually uses, so they differ by
   construction: the CodeMirror and Turndown entries are ours, and upstream's hook/owner/suspect
   identifiers are not. Eleven of the gate's hunks are this one file.
   Baseline reason: `api-surface-tables`.
10. **Retired 2026-09-24: the vendored OG assets.** `og-image.ts` differed in two prose-only hunks, about
    the Inter TTFs both repos vendor under `scripts/docs-gen/assets/fonts` and the favicon this repo
    draws onto a card. Upstream has since taken this repo's wording, so the file is byte-identical and
    the `vendored-og-assets` reason is gone. The two TTFs are still gated as a digest pair.
11. **The single `src` walk (`generate-api-docs.ts`, `build-pages.yml`)** — added 2026-10-15, when
    `obsidian-dev-utils` became a multi-package workspace: its generator now walks every `packages/*/src` and
    prefixes each namespace with the package folder, and its Pages cache key hashes `packages/*/src/**/*.ts`.
    This package has one `src`, so the generator keeps the single-root walk (and the `jiti` run line in its
    header), and the cache key hashes `src/**/*.ts`. Upstream's docs site may be split per package
    (`obsidian-dev-utils`' own plan), which would put its generator back on a single `src`; re-check this one
    at that sync.
    Baseline reason: `single-package-source`.

### Type-checking and linting gaps (the same ones `obsidian-dev-utils` has)

`scripts/docs-gen/**` is EXCLUDED from the root `tsconfig.json` (it needs `moduleResolution: bundler`
for the Astro/Starlight ESM packages, so it carries its own `scripts/docs-gen/tsconfig.json`), and
`astro.config.ts` is carved out into `tsconfig.astro.json` for the same reason. Neither is part of
`build:compile`, exactly as in `obsidian-dev-utils` — so `tsc -p scripts/docs-gen/tsconfig.json` currently
reports pre-existing `exactOptionalPropertyTypes` violations in the copied code. ESLint DOES cover both
(`projectService` resolves each file's nearest tsconfig; `astro.config.ts` is pinned to
`tsconfig.astro.json` by an override that must come AFTER `getTseslintConfigs()`).

`docs/src/**/*.ts` is ignored by ESLint: those modules resolve `astro:content` and `import.meta.env`
through types Astro generates into the gitignored `.astro/` at the REPO ROOT (the Astro project root is
the root, whatever `srcDir` says), so linting them before a build reports
every Astro import as an unresolved `any`. `docs/tsconfig.json` and the Astro build validate them
instead. `docs/**` is likewise out of markdownlint's scope (Starlight's frontmatter-driven conventions,
plus the generated API markdown), and `scripts/docs-gen` is out of dprint's and cspell's — keeping the
copy byte-comparable to the `obsidian-dev-utils` one.

### `js-yaml` must stay on 4.x

The `js-yaml` override is pinned to `4.3.2` (recorded in `pinned-versions.json`). Astro and Starlight do
`import yaml from 'js-yaml'`, and js-yaml 5 is ESM-only with NO default export, so hoisting 5.x into
their subtree makes `astro build` die before it reads a single page. The update sweep will try to raise
it again — do not let it. Do not lower it either: `4.3.1` and every release below it sits inside
GHSA-2883-xcg3-v3hh (`maxTotalMergeKeys` does not limit CPU use for empty merge sources, `>=4.0.0
<4.3.2`), so `4.3.2` is the floor as well as the ceiling. That is why `pinned-versions.json` now checks
the `v4-legacy` dist-tag rather than the range astro declares: an exact pin is invisible to the caret
sweep, so a backport landing on that tag is the only signal that this one has fallen behind.

### Testing

The docs generator and the docs site are tested by the `unit-tests:scripts` project, alongside the rest
of `scripts/**` — see [The two Vitest projects](#the-two-vitest-projects--where-a-test-file-runs-depends-on-where-it-lives).

## Consuming notes

The modeling gaps surfaced on 2026-07-02 (while converting `obsidian-advanced-note-composer` to the
real-bridge pattern) are now closed. A few affordances worth knowing:

- **`Vault.reconcile__()` syncs the in-memory tree from the adapter.** Direct `app.vault.adapter.*`
  moves/deletes/writes do NOT update `getAbstractFileByPath`/`getFileByPath` (as in real Obsidian, whose
  watcher is async). After such an op, call `app.vault.reconcile__()` to re-scan the adapter and
  reconcile the tree (firing `create`/`delete` events). Dot-prefixed paths (e.g. `.obsidian`) are
  excluded, mirroring real Obsidian.
- **`MetadataCache` indexes synchronously** on `create`/`modify` via `Vault.readSync__`, populating
  `cache__`, `resolvedLinks`/`unresolvedLinks`, and `frontmatterLinks`, plus the obsidian-typings
  internals `fileCache`/`metadataCache`/`computeMetadataAsync` — so `getFileCache`, the link graph, and
  `getCacheSafe` work with no tick needed. **`MetadataCache.setCache__(path, cache)` runs that SAME
  index** with a caller-supplied cache instead of a parsed one — both paths go through one private
  `applyCache`, so an override refreshes the link graph and the hash lookup too, and fires `changed`
  as `(file, content, cache)`, the shape real Obsidian emits. It therefore needs a file to already
  exist at `path` and throws a `TypeError` if none does; to seed a cache with no event at all, write
  into `cache__` directly.
- **`Vault.getAvailablePath` de-duplicates**, folder renames cascade to descendants, and
  `createFolder('a/b')` creates/links intermediate ancestors.
- **The vault refuses what Obsidian refuses** (2026-09-17, measured on a real Obsidian 1.14.2): `create` /
  `createBinary` throw `File already exists.` and `createFolder` throws `Folder already exists.` when the adapter
  reports anything at the path; the adapter's `copy` never overwrites a file, and `rename` onto an existing path throws
  `Destination file already exists!`. Seed a test vault with `createSync__` / `createFolderSync__`, which stay lenient
  on purpose. Deleting or trashing a folder stops tracking every descendant, firing `delete` for each before the
  folder, and every removed entry's `parent` is `null` by the time its `delete` fires; deleting or trashing the root
  does nothing; `copy` accepts folders; `getAllFolders()` leaves the root out unless passed `true`.
- **`Vault.recurseChildren(folder, callback)` is Obsidian's own walk, root included** (2026-09-24, read in Obsidian
  1.14.x's `app.js`). It is a stack seeded with `folder`, so **the folder itself is visited FIRST**, and each folder's
  children are concatenated onto the stack and popped, so **siblings are visited last-first**. `children` is read
  only after the callback ran on the folder, and the callback's return value stops nothing. The mock used to visit
  descendants only, first-to-last, which hid a consumer bug whose folder merge collected the source folder from the
  walk and moved it inside its own destination — every unit test green, the real app broken. A consumer that wants
  descendants only skips `entry === folder` itself, as it must against the real app. The mock's own folder `copy`,
  `rename` and delete/trash cascade do NOT use it: they walk a private descendants-only pre-order, so their event order
  is unchanged.
- **The two adapters differ where Obsidian's do** (2026-09-17, read in Obsidian 1.14.2's `app.js`). `rmdir` of a
  missing path throws `ENOENT … lstat` on both. The desktop `FileSystemAdapter` (the one `App` uses) runs
  `fs.rm(path, { recursive })`, so `rmdir(path, false)` refuses ANY folder, an empty one included, with `EISDIR` —
  which means `vault.delete(folder)` throws unless passed `force: true`, exactly as in the app. A FILE handed
  to `rmdir` is deleted, `recursive` or not, because `fs.rm` removes one; only a folder answers `EISDIR` (measured
  2026-09-24 on Node 26.10.0). The mobile
  `CapacitorAdapter` ignores `recursive` and always removes the whole folder. The desktop adapter also refuses to copy
  a FILE into a missing folder (`ENOENT … copyfile`), while a copied folder still gets its parents created; the mobile
  copy is native and is left creating parents.
- **Neither `create` nor `createBinary` invents a missing folder on the desktop adapter** (2026-09-24, read in
  Obsidian 1.14.2's `app.js`). The vault checks nothing about the parent: both call `adapter.write` /
  `adapter.writeBinary` straight after the exists check, and the desktop adapter's `fs.writeFile` is what rejects. So the
  desktop mock's `write`, `writeBinary`, `append` and `appendBinary` refuse a path whose folder does not exist with
  `ENOENT: no such file or directory, open '<full path>'`, and with `ENOTDIR: not a directory, open …` when a file
  sits where that folder would be, before anything is written, tracked or fired. `mkdir` stays recursive, as the app's
  is. Until then the mock created the parents silently, so a writer that never called `createFolder` passed every unit
  suite and failed on a real device. **A suite that writes into a folder it never created now goes red on purpose**:
  create the folder first (`vault.createFolder`, `adapter.mkdir`), or seed with `createSync__`, whose adapter write
  stays lenient. The mobile `CapacitorAdapter` also rejects in the app, through its native plugin, but that message has
  never been measured, so the mobile mock still creates parents rather than invent a message.

- **Trashing routes through the adapter, and the local trash is a real `.trash` folder** (2026-09-17, read in
  Obsidian 1.14.2's `app.js`). `Vault.trash(file, true)` calls `adapter.trashSystem` and falls back to
  `adapter.trashLocal` only when it answers `false`; `Vault.trash(file, false)` goes straight to `trashLocal`. The
  mock used to call `adapter.remove` / `adapter.rmdir` itself, so neither member was ever reached and a spy on
  either saw nothing. `InMemoryAdapter.trashLocal` now MOVES the entry into the vault's `.trash` folder, creating
  it first as both real adapters do — `note.md` becomes `.trash/note.md`, the next one `.trash/note 2.md`
  (numbered from 2, extension last), and a folder moves with everything under it — so a trashed file is still
  readable through the adapter, while `.trash` stays a dot path the vault never tracks. `trashSystem` removes the
  entry outright, recursively for a folder, and answers `true`; it answers `false`, changing nothing, for a path
  that does not exist or when the mock-only `InMemoryAdapter.isSystemTrashAvailable__` is turned off, which is how
  a test reaches the fallback.
  - **`FileManager.trashFile` routes on the vault's `trashOption` setting**, as Obsidian's does: `system` (the
    modeled default) calls `vault.trash(file, true)`, `local` calls `vault.trash(file, false)`, and `none` calls
    `vault.delete(file, true)`. **Any other value does nothing at all** — Obsidian's three branches have no `else`,
    so a key set to a typo leaves the file where it is, and the mock reproduces that rather than falling back to the
    system trash. It used to ask for the system trash unconditionally, which was invisible until the two trash
    routes started to differ observably. `promptDelete` and `deleteUnlinkedAttachments`, the other two keys the real
    `promptForDeletion` reads, are deliberately NOT modeled: the mock has no dialogue, so it can only ever behave as
    `promptDelete: false`, which is exactly what it already does.

- **Two settings-row departures are fixed, and four members are new** (2026-09-17, read in Obsidian 1.14.2's
  `app.js`). `Setting.setTooltip` writes its `aria-label` on `nameEl`, not on `settingEl` — Obsidian tooltips the
  name element (`JM(this.nameEl, …)`) — so a consumer reading the row's tooltip was looking at the wrong element.
  `ButtonComponent.setWarning` no longer adds `mod-warning`, a class the app never adds anywhere: Obsidian
  implements it as `setDestructive().setCta()`, so the button ends up with `mod-destructive` and `mod-cta`. Both
  are public API, so a test that pinned the old answer was pinning something Obsidian does not do.
  - Four members `obsidian-typings` declares now have real behavior instead of throwing.
    `ButtonComponent.setLoading(loading)` toggles `mod-loading`, the same class a pending click handler carries.
    `Setting.setNoInfo()` hides `infoEl`. `Setting.setAction(callback)` and `Setting.setNavigable(callback)` make
    the whole row clickable — `mod-action` / `mod-navigable` plus `tappable`, with `setNavigable` also appending a
    `setting-item-chevron` div whose `data-icon` records `lucide-chevron-right`, the icon convention the component
    mocks already use.
  - **Drive such a row with a real `settingEl.click()`.** The listener is attached once, so a second `setAction` /
    `setNavigable` replaces the handler rather than adding another; a disabled row is ignored, and so is a click an
    inner control has already handled by calling `preventDefault` on it.
  - `Setting.setIcon(icon)` creates `iconEl` on its FIRST call only — a `setting-item-icon` div prepended to
    `settingEl` — and then records the icon id in that element's `data-icon`, the convention the chevron above and
    the component mocks already use. A `null` or empty id empties the element and drops the attribute rather than
    removing the element, so `iconEl` stays set once a first call has made it.
  - `Setting.setRowClick(callback)` is the row-click primitive `setAction` and `setNavigable` are both built on,
    and it carries Obsidian's own name on the public surface rather than hiding as an implementation detail. It
    returns nothing, so unlike those two it does not chain; `Setting.rowClick` holds the handler it stores, `null`
    until the first call. The replace-not-append behavior the bullet above describes lives here, in one place.

- **Two more settings-row departures, from the same read of `Zx`** (2026-09-17, Obsidian 1.14.2's `app.js`).
  `Setting.setClass` **splits on spaces first** — Obsidian is `settingEl.addClass(...cls.split(' ').filter(Boolean))`
  — so `setClass('mod-a mod-b')` adds both classes, as it does in the app. The mock used to call
  `classList.add(cls)` with the whole string, which throws `InvalidCharacterError` on the space, so a consumer
  passing what Obsidian accepts got a crash. An empty or whitespace-only string splits to nothing and changes no
  class, which is what the app's `apply` over an empty array does. `Setting.addToggle` now adds **`mod-toggle`** to
  `settingEl`, as Obsidian does — and, as in the app, only **after** the callback has run, so a callback reading the
  row's classes sees them unmarked. A test asserting the row's classes, or a stylesheet keyed off them, was seeing a
  row Obsidian would have marked.
  - **`Setting.addText` blurs its input on `Enter` when there is no physical keyboard** (2026-09-18, the decision
    this sub-bullet used to be parked on). Obsidian guards the listener on `Platform.hasPhysicalKeyboard`, so with
    the flag set to `false` an `Enter` keydown on the input blurs it, dismissing a soft keyboard rather than letting
    the key reach a single-line field. A composing event (`isComposing`) or one a capturing ancestor has already
    default-prevented is left alone, and any other key always is. **`addText` is the only `add*` method Obsidian
    guards this way** — `addSearch`, `addTextArea` and `addMomentFormat` sit in the same block of the app with no
    such listener, so do not go looking for it there. The listener is attached when the input is created, before the
    `addText` callback runs, which is why a listener a consumer adds to the input itself cannot get in ahead of it.

- **`Platform` carries nineteen members beyond the thirteen `obsidian.d.ts` declares** (2026-09-18, read in Obsidian
  1.14.2's `app.js` — the literal at `:48126-48170`, the desktop bootstrap that fills it at `:229307-229316`). All
  nineteen are real Obsidian internals `obsidian-typings` declares as `PlatformEx`, so per L4 each takes its real name
  with no `__` suffix.
  - **`hasPhysicalKeyboard` is `true`**, the honest default beside `isDesktopApp: true`: the desktop bootstrap sets
    it, the emulate-mobile path resets it to `false`, and mobile detects it asynchronously — the `false` the app's
    own literal starts from is a pre-bootstrap placeholder no running app is observed in. **Set it to `false` to
    drive the affordances Obsidian gates on a soft keyboard**, of which `Setting.addText`'s `Enter`-blur is the one
    modeled so far; restore it afterwards, as `Keymap`'s suite does for `isMacOS`.
  - **All seven `can*` members are getters**, each re-evaluating Obsidian's own derivation on every read, which is how
    Obsidian writes them too — so flipping a flag in a test moves them, instead of freezing an answer at import time.
    Restore the flag afterwards, as `Keymap`'s suite does for `isMacOS`:

    | member | derivation | flip this to move it |
    | --- | --- | --- |
    | `canPinSidebar` | `isMobile && !isPhone` | `isMobile`, `isPhone` |
    | `canExportPdf` | `isDesktopApp` | `isDesktopApp` |
    | `canOpenExternalFiles` | `isDesktopApp && isDesktop` | `isDesktopApp`, `isDesktop` |
    | `canPopoutWindow` | `isDesktopApp && isDesktop` | `isDesktopApp`, `isDesktop` |
    | `canDisplayRibbon` | `!isPhone` | `isPhone` |
    | `canSplit` | `!isPhone` | `isPhone` |
    | `canStackTabs` | `!isPhone` | `isPhone` |

    **`supportsIndexedDb` is a getter** for a different reason: it reports whatever `window.indexedDB` the test
    environment actually has. That one IS a departure — Obsidian evaluates it once at startup — taken so that a
    suite which stubs or removes `indexedDB` is believed.
  - **`version` is a getter returning `apiVersion`**, not a copy of it, so the two cannot drift and there is exactly
    one place to bump.
  - **`build` is `''`, deliberately, and it is the one member that asserts something a running app would not.**
    Obsidian fills it with the INSTALLER version, which moves independently of `version`; the mock has no honest
    answer for that, so it keeps the empty string the app's own literal starts from. Read it expecting `''`.
  - **`deviceName`, `osName` and `osVersion` are the host machine's**, from `node:os`'s `hostname()`, `version()`
    and `release()` — the same three calls, in the same order, the desktop bootstrap makes. `osName` is the
    DESCRIPTIVE version string (`Windows 11 Pro`) and `osVersion` the kernel release (`10.0.26200`), so the pairing
    looks transposed and is not. They are machine-dependent by construction: assert them against `node:os`, never
    against a literal. This is **the only `node:os` import in the published library** and carries a written waiver
    for `import-x/no-nodejs-modules` — that ban exists so `dist` stays runnable anywhere, and a browser-based test
    runner would now need `node:os` shimmed.
  - **`mobileSoftKeyboardVisible` is `false`, `manufacturer` and `model` are `''`** — the values the desktop bundle
    leaves them at, since nothing outside the mobile app ever assigns them.
  - **`mobileDeviceHeight` is a getter over `window.innerHeight`, and `mobileKeyboardHeight` is `0`** (decided
    2026-09-18). Both are mobile-only and — unlike `manufacturer`, `model` and `build` — appear **nowhere** in the
    desktop bundle, neither in the literal nor in the bootstrap, so a running desktop Obsidian answers `undefined`
    for both where `PlatformEx` types them `number`. They are carried anyway, each over the only source that is not
    an invention: `mobileDeviceHeight` reads real environment state, so a suite that resizes the window is believed
    rather than answered from a frozen constant, and `mobileKeyboardHeight` is DERIVED from
    `mobileSoftKeyboardVisible: false` — a keyboard that is not visible has height `0` — rather than asserted.
    Assign a real height to either to simulate mobile, and restore it afterwards, as `Keymap`'s suite does for
    `isMacOS`. **Two costs were accepted here rather than missed:**
    1. `window.innerHeight` is a browser VIEWPORT, not a device screen; on a real phone the two differ by the status
       and navigation bars. `window.screen.height` is the closer analogue to a *device* height and is `0` in jsdom,
       which is why it is not the source. Assert `mobileDeviceHeight` against `window.innerHeight`, never against
       jsdom's `768`.
    2. This is the SECOND getter-over-the-environment of the `supportsIndexedDb` kind, and two is where it stops
       being one exception. **Treat it as the rule from here: a member whose honest value is a live environment fact
       is a getter over that fact**, so a suite that changes the environment is believed. The reverse now needs the
       reason: a member answered from a frozen constant is one where the environment has no answer (`build`,
       `manufacturer`, `model`) or where the mock is deliberately asserting a platform (`isWin`, `isDesktopApp`).
  - **`canOpenExternalFiles` arrived last** (2026-10-05). The app's literal carried it all along, but until
    `obsidian-typings` 6.39.0 — the first release whose public chain reaches a 1.14.x build — only the catalyst
    typings declared it, so L1 / L4 kept it off the surface. It took the route `Setting.setIcon` took: declared
    upstream first, implemented here only once a consumer-visible release carried the declaration.
  - Neither conformance test covers any of this: `Platform` is a `const`, so `conformance.test.ts` checks only that
    the export exists, and `obsidian-typings-conformance.test.ts` walks classes, which is why nothing was ever going
    to surface the gap.

- **Attachment-path resolution is modeled end to end** (added 2026-07-28) — anything calling
  `obsidian-dev-utils`' `getAttachmentFilePath` / `getAttachmentFolderPath` / `isAtProperAttachmentPath`
  against the mocks used to die on a strict-proxy read, forcing every consumer to hand-seed the surface.
  All four are obsidian-typings internals rather than `obsidian.d.ts` members, so per L4 they live on the
  mocks under their real, un-suffixed names:
  - **`Vault.getConfig(key)` / `Vault.setConfig(key, value)`**, backed by the `config` bag. Exactly three keys
    carry a modeled default, each Obsidian's own: `attachmentFolderPath` (`/`), `focusNewTab` (`true`) and
    `trashOption` (`system`). Every other `ConfigItem` reads as `undefined` until a test sets it — do NOT assume
    the bag mirrors Obsidian's full defaults. A key earns a default here when some mock READS it; the three above
    are read by attachment-path resolution, `Workspace.createLeafInTabGroup` and `FileManager.trashFile`.
  - **`Vault.getAvailablePath(basePath, extension)`** — Obsidian's de-duplicator (plain name, then a
    `" 1"` / `" 2"` suffix, …). Note `obsidian-dev-utils`' own `getAvailablePath(app, path)` helper DELEGATES to this
    member, so a consumer cannot seed it by calling that helper — it would recurse until the stack blows.
  - **`Vault.getAvailablePathForAttachments(fileName, extension, file)`** — the real resolution, not a
    throwing placeholder. `/` → vault root, `./` (and `.`) → the note's own folder, `./sub` → a
    sub-folder of the note's folder, anything else → that fixed folder; the target folder is **created
    when missing** (real Obsidian does this), a `null` file resolves as a root-level note does, and the
    result runs through `getAvailablePath`. That library only ever reads this function's `extended` member (an
    attachment-location plugin installs it) and falls back to its own resolution when absent — so the
    plain function is what a test exercises, and it now answers faithfully.
  - **`TFolder.getParentPrefix()`** — `''` for the root, `` `${path}/` `` otherwise. On the prototype,
    because folders are created by the vault as fixtures are built, never handed to the test to seed.

- **`app.plugins.getPlugin(id)` answers `null`** (added 2026-09-01) — a mock vault genuinely has no
  community plugins installed, so that is the truth about it rather than a placeholder. This matters
  beyond tidiness: `obsidian-dev-utils` reads the registry from INHERITED code (its Notebook Navigator
  menu registrar on layout ready, plus `canvas.ts`, `folder-note.ts` and
  `rename-delete-handler-component.ts`), so while `App.plugins` was unmocked a single `obsidian-dev-utils` bump broke the
  same `plugin.test.ts` in roughly 28 repos at once. Every one of them hand-assigned
  `app.plugins = strictProxy({ getPlugin: () => null })`; they no longer need to.
  - **`app.plugins.registerPlugin__(id, plugin)`** seeds one, and `unregisterPlugin__(id)` removes it.
    The instance can be a full `Plugin` mock via `asOriginalType2__()` or any stand-in carrying the
    members under test (`{ api }`, `{ settings }`) — which is what its call sites actually read.
    `enabledPlugins` is kept in step; this mock has no notion of installed-but-switched-off.
  - **`app.plugins.manifests` is kept in step too** (2026-09-23): `registerPlugin__` files the instance's own
    `manifest` when it carries one (read past the strict proxy, so a `strictProxy` stand-in without one does not
    throw), and `unregisterPlugin__` drops it. A stand-in with no manifest files nothing; assign the entry directly.
    `obsidian-dev-utils`' resource lock reads `manifests[id]?.name`, which is what made 6.0.0's real leaf views
    reach it.
- **`Editor.cm` is a real, lazily built CodeMirror 6 `EditorView`, synced both ways** (2026-09-23). Every mutation
  of the mock's buffer or selection (`dispatchChanges`, undo/redo, `setCursor` / `setSelection(s)`,
  `resetState__`) is written into the view, and an `updateListener` reads a transaction dispatched INTO the view
  back through `dispatchChanges`, so it is one undo step and takes CodeMirror's selection. `isSyncingCodeMirror`
  stops either direction echoing. An effect-only transaction (the `Compartment` + `EditorState.readOnly` shape
  `obsidian-dev-utils`' `toggleEditorReadOnly` dispatches) leaves the buffer alone. The view is detached and
  unpainted: only its `state` is honest.
  - Only that honest core is modeled. The enable/disable lifecycle, installing, updates and deprecation
    stay unmocked and throw, per L2.
  - **`App.internalPlugins` and `App.commands` are deliberately still unmocked**, because neither has an
    equally honest empty state. Real Obsidian always ships core plugins with several enabled, so an
    empty `internalPlugins` would be a lie rather than an empty vault; and `Plugin.addCommand` records
    into the mock's own `commands__`, so an empty `app.commands` would go stale the moment a plugin
    registered one. Modeling that means an app-wide command registry (and `App.registerCommands`), which
    is its own piece of work — not a symmetry to fill in.

  Every path above was confirmed against a real Obsidian 1.13.4 over CDP; `Vault.test.ts` asserts that
  table verbatim.

- **Reference `position.end.offset` is exclusive.** `src/internal/markdown-parser.ts` reports every
  cache position (links, embeds, headings, tags, list items, sections, frontmatter) with an
  **exclusive** end offset (`start + length`), matching Obsidian, so
  `content.slice(start.offset, end.offset)` reconstructs a reference's `original` exactly. This is what
  lets `obsidian-dev-utils`'s `editLinks` write path (`applyFileChanges` → `validateChanges`) match the
  sliced source against `reference.original`.

- **A note with CRLF or lone-CR line breaks parses as its LF form does** (2026-10-12, measured with Obsidian 1.14.4's
  own metadata worker). Obsidian takes `\r\n`, `\n` and a lone `\r` as one line break each, and reports every position
  in the ORIGINAL text, a line ending before its `\r`. `parseMarkdownContent` parses a copy with each break turned into
  `\n`, which keeps every line and column, and moves each position back to the same line and column of the original.
  Before that, a CRLF note had no list items or list sections at all, since `.*$` stops at the `\r`, and its code fences
  went unrecognized, so a tag inside one was reported. A lone-`\r` note collapsed onto line 0. A link whose text spans a
  line break keeps the `\r\n` in `original` and shows `\n` in `displayText`, as Obsidian does.

- **A list item starts where its CONTAINER's content starts, and nests by content column** (2026-10-12, measured on a
  real Obsidian 1.14.4 over CDP). The mock used to start every item at its line start, so `position.start.col` was
  `0` for every item, and the parent lookup compared indents, which made `- A\n  - B\n  - C` report `B` as `C`'s
  parent. Each of the following changes what a consumer observes:
  - **A nested item's `position.start` is its parent's content column**, which is where the item's marker sits when it
    is indented exactly that far. `- B` indented two spaces under `- A` starts at column 2, and `* B` indented four
    spaces under `* A` also starts at column 2, with the extra two spaces inside the item. A top-level item keeps its
    indent and starts at the line start. A tab is never split, so under tabs the item starts at the first character at
    or past that column (`\t- B` under `- A` starts at column 1).
  - **The parent is the nearest open item whose content column the marker reaches**, CommonMark's containment rule.
    The content column is the marker's end plus the whitespace after it, up to four columns of it. So `-   A` takes a
    `- B` indented three spaces as a SIBLING, and an item opened as a sibling closes the one before it. Obsidian counts that whitespace even
    for an item with nothing after its marker, where strict CommonMark would not.
  - **An item is its nested list's parent only when it has more than one child** and no other block follows that list
    inside it (2026-10-12, the worker's own rule). So an item holding nothing but one nested list is no parent, and the
    list is rooted at its own first line, as if it stood alone: `- \n  - C` gives `C` the parent `-1`. An empty item
    gains a child from any later block it holds, a lazy line, a quote or a one-line comment among them
    (`- \ntext\n  1. G` gives `G` the parent `0`), and from a second nested list of another kind (`- \n  1. G\n  - C`
    parents both to `0`). A task item with no text after its checkbox is not empty.
  - **Obsidian strips an item's later lines before it reads them, and a nested item starts where that leaves it**
    (2026-10-12, `remark-parse` 8's list tokenizer, read in the worker). It strips each later line to the least indent
    among them, counting only lines indented past the item's container, and to at most the marker's width with the
    spaces after it. That width is one column wider for `1.` to `9.` followed by a single space, so `1. A\n    - D`
    starts `D` at column 4 where its content column is 3, while `1. A\n    - D\n   - E` starts it at 3. The same column
    decides an indented code block: `1. A\n       - D` is an item, and `1. A\n       - D\n   - K` makes `D` a paragraph
    line of `A`, because the later `- K`, indented three spaces, lowers it. A nested item's lines are measured from
    where its PARENT's strip leaves them, not from the parent's content column, which differs for a widened marker:
    in `9. C\n    1. R\n    text\n       - M`, `text` sits at the start of `C`'s stripped text, so it lowers nothing and
    `M` starts at column 7. Inside a blockquote the later lines are read past their quote prefixes the same way
    (2026-10-12), so `> 9. C\n>        - M\n>    - K` makes `M` a paragraph line of `C`.
  - **A list that starts on line 0 is rooted at `-1`, not `-0`.** Everywhere else the root parent is still the
    negative of the list's first line.

- **Blank lines alone never end a list; only content the list cannot hold does** (2026-10-12, measured on a real
  Obsidian 1.14.4 over CDP). The mock used to start a new list, with its own `list` section and root parent, at every
  line gap, so `- A\n\n- B` gave `B` the parent `-2` and two sections where Obsidian gives `-1` and one. Now:
  - **After a blank line, a line indented less than the list's root item's content ends the list**, and one indented
    at least that far stays inside it (`- A\n\n  text\n\n- B` is one list, `- A\n\n text\n\n- B` is two).
  - **With no blank line before it, only a heading, a code fence, a thematic break or a `%%` comment the line does not
    close ends a list.** Any other line is a lazy continuation of the item above, including a blockquote, a `$$` block,
    a one-line `%% … %%` comment, HTML and a table, so `- A\n> q\n- B` is one list.
  - **A top-level item of another kind starts a new list**, gap or no gap: another bullet character (`-` then `*`), or
    another ordered delimiter (`1.` then `2)`). A nested item may differ from its siblings without effect.
  - **A block after a nested list inside the same item re-roots that nested list at its own first line**, the way a
    list nested in an empty item is rooted. In `- A\n  - B\n\n  text`, `B`'s parent is `-1`, not `0`. A nested list
    that only further lists follow keeps its item as the parent.
  - **A list section ends at the end of the last line the list holds**, which is content after the last item when the
    list holds some, rather than at the last item (2026-10-12, 2,600 of 20,000 fuzzed notes differed here before). The
    end is that line's whole length, trailing whitespace included (`- A` then `x` and two spaces ends at 7), and a
    whitespace-only line indented to the root item's content is a line the list holds (`- A\n  - B` then a line of two
    spaces ends at 12, past `B`'s end).
  - **A nested item of another kind is no sibling**, so an item followed by one after a blank line keeps its last line
    as its end: in `1. A\n   - K\n\n    1. R`, `K` ends at 11, not at the blank line's start.

- **Lists inside a blockquote or callout are list items too** (2026-10-12, 60 shapes measured on a real Obsidian 1.14.4
  over CDP). The mock used to report no `listItems` for them at all. Now:
  - **An item starts just past the quote prefix**, which is each `>` plus the one optional space after it. In
    `> - A` the item starts at column 2, in `>- A` at column 1, and in `>  - A` at column 2, with the extra space inside
    the item. Nesting is decided by columns counted from that point, so `>   - B` under `> - A` is nested.
  - **A list belongs to one blockquote depth.** A list in a quote is its own list, rooted at its own first line, even
    when the quote sits inside an item of an outer list. So `- A\n> - B\n- C` gives `B` the parent `-1` and `C` stays
    `A`'s sibling. An item at a shallower depth ends every deeper list.
  - **A line outside the quote ends a quoted list** when it is blank, follows a blank line, or can interrupt a paragraph.
    Any other such line is a lazy continuation, so `> - A\ntext\n> - B` is one list.
  - **A quoted list has no `list` section.** The blockquote's own section is the only one Obsidian reports.
  - **A tab right after a `>`, or after its optional space, starts no item**, as measured: `>\t- A` and `> \t- A` give
    none, while `>  \t- A` gives one. A fenced block inside a quote is a code zone, so it holds no items, tags or links.

- **The blocks around the lists are read by Obsidian's own block grammar** (2026-10-12, read in Obsidian
  1.14.4's `worker.js` and fuzzed against it: 15,000 notes with no list item and no frontmatter agree). That worker is
  `remark-parse` 8 with `commonmark` and `gfm` on and two block tokenizers of Obsidian's own, and
  `src/internal/markdown-gap-blocks.ts` ports each tokenizer it runs. The mock used to split a gap at blank lines and
  trim each part, which lost the indent, missed every block that interrupts a paragraph, and typed only four kinds. Now:
  - **A section starts at its line start, indent included, and ends at its last line's end, trailing whitespace
    included.** a quote indented three spaces starts at column 0, and a paragraph line with two trailing spaces ends after them.
  - **A line opening with a tab, or with four spaces, is indented code**, outside a paragraph, which takes it as a
    continuation. A tab after a space indents nothing, so a line opening with a space and a tab is a paragraph. A
    block's last line holding only its indent belongs to it only when a line break follows (2026-10-12): a `code` line
    indented four spaces, then a lone tab, ends the block at the end of `code`, and with a line break after the tab at
    the end of the tab.
  - **A paragraph is interrupted** by a thematic break, an ATX heading, a fence, a comment, a math block, a blockquote and
    an HTML block of the first six CommonMark kinds, so `para\n> q` is two sections. A table and an inline tag such as
    `<span>` are not interruptions.
  - **A blockquote takes lazy lines** until a blank line, or a line that opens indented code, a fence, a comment, a math
    block, an ATX or setext heading, a thematic break or one of those HTML blocks.
  - **New section types**: `html`, `table`, `comment` and `math`, besides `paragraph`, `blockquote`, `callout`, `code`,
    `thematicBreak` and `heading`. An unclosed fence, comment, math block or HTML block of the first five kinds runs to
    the end of the gap, its final line break included. A comment ends just past its closing `%%`, and the rest of that
    line starts a paragraph. A math opener needs a line break after it, so a note ending in `$$` is a paragraph.
  - **A table row needs a `|` past its first character, and keeps the header's choice of a leading `|`**, so a table
    whose header is `a|b` ends at a row `|x|y|`.
  - **Setext headings and ATX headings the heading regex misses are headings**: `a\n===`, an empty `#`, and `# x` indented two spaces each
    get a `heading` section and a `HeadingCache`. A setext heading needs exactly one line of text, so `a\nb\n---` is a
    paragraph and a thematic break, and an underline with trailing spaces is no underline. Every ATX heading's text drops
    its closing `#` run, as Obsidian's does (`# A #` is `A`), and `#\nText` is an empty heading and a paragraph, where
    the heading regex used to carry `\s+` across the line break and read a heading `Text`.
  - **Every heading comes from the same scan** (2026-10-12), so a heading line inside an unclosed fence, comment, math
    block or HTML block is a line of that block and no heading at all: `<!-- c\n# H` is one `html` section, as in
    Obsidian. A regular expression over the whole note used to find headings first, which split such a block in two.
  - **`definition` and `footnoteDefinition` sections** (2026-10-12, ports of the worker's tokenizers). Neither interrupts a
    paragraph, so `para\n[a]: /u` stays one paragraph. A definition's destination and title may each follow a line
    break, even an empty one before the destination, and a title that opens and never closes spoils the whole definition
    rather than being left out (`[a]: /u\n"title` is a paragraph). A footnote definition takes lazy lines and lines
    indented four columns, and ends at an empty line followed by a line indented less, or at a line that starts another
    block, a bullet or an item numbered 1 among them but no comment and no block id: the worker installed its footnote
    tokenizer before those two existed. An empty first line (`[^1]:`) ends it at once.

- **`referenceLinks`, `footnotes` and `footnoteRefs` are filled** (2026-10-12, read in Obsidian 1.14.4's `worker.js`, which
  runs `remark-footnotes` 2 with inline notes on, and fuzzed against it). Four habits catch a consumer out:
  - **A reference counts only when a definition carries its label.** `a[^x]` with no `[^x]:` anywhere is plain text and
    no `footnoteRefs` entry. Labels match ignoring case, and both entries are keyed by the label lower-cased; a
    `referenceLinks` entry keeps its label as written, escapes and spaces included, and its `link` is the destination
    unescaped with its character references decoded (`/u\_x&amp;` reads `/u_x&`). A named reference is decoded through
    the document, so with no `document` it stays as written.
  - **An inline footnote `^[text]` is a `footnotes` entry at its TEXT, keyed `[inline<n>`**, where `n` counts the inline
    footnotes and the definitions first referenced before it in the note, so `a[^1] ^[x]` keys the second `[inline1`. An
    empty `^[]` is a `footnoteRefs` entry keyed `''` instead. A reference or an inline footnote inside an inline
    footnote counts for nothing.
  - **A note that references any footnote gets two more sections, `text` and `element`, both empty**, on the line after
    its last block, at column 0, and at the offset that block ends at, which is not that line's start. The last block
    counts even when it is a standalone block id, which is dropped only afterwards. The `element` section is the list of
    footnotes the worker renders, and it takes the last block id in the footnotes it copies there, an id ending an
    inline footnote's text included, which the paragraph holding that footnote does not take. So
    `[^n]: x ^id\n\nt[^n]` gives `blocks.id` the `element` section's position, not the definition's.
  - **A definition inside a blockquote, a callout, a list item or a footnote definition counts** (2026-10-13), at any
    depth, as it does in the worker, which walks the whole tree: `- [a]: /u\n> [^1]: z\n\nq[^1]` has a reference link at
    2, a footnote at 12, just past the quote prefix, and a resolved reference. Each container's lines are read with its prefix stripped,
    a callout's header line left out, and run through the same block scan as the top level, so a definition still
    cannot interrupt a paragraph there (`> q\n> [a]: /u` has none). An item's later lines lose the least indent among
    them up to its marker's width, which is one column wider for a widened ordered marker (`1. x\n\n    [a]: /u` puts it
    at 10), and an item's checkbox is no part of its text (`- [ ] [a]: /u`).
  - Approximated: a list inside a footnote definition is not one the parser finds, so a definition in its items is
    missed, and the inline scan knows escapes, code spans and fenced code but no other inline construct.

- **Block ids are assigned, and `blocks` is filled** (2026-10-12, read in Obsidian 1.14.4's `worker.js` and fuzzed
  against it). An id is `^` and a run of letters, digits and `-`, and `blocks` keys each one lower-cased, sections first
  and list items after them, each entry sharing its section's or item's `position`. Five habits catch a consumer out:
  - **Inline, the id must END the text** of a paragraph or a heading, with the `^` at a token boundary: starting the
    text, following whitespace, or right after any other inline token (2026-10-13). So `para ^abc` and `para\n^abc` take
    `abc`, and so do `a\*^abc` (an escape), ``a`c`^abc`` (a code span), `a*b*^abc`, `a[[w]]^abc`, `a #t^abc` and
    `x@y.z^abc`, while `a ^x\nb`, `para^abc`, `a*^abc`, `a\q^abc` (no escape) and `para ^abc` followed by trailing spaces
    take nothing. A heading keeps the id in its `heading` text (`# H ^id` reads `H ^id`).
  - **An id can also end the CONTENT of an inline token**, since emphasis, strong, a `~~` deletion, a highlight, a `%%`
    comment and a link's text are each tokenized on their own: `*a ^x* b` gives the paragraph `x`. A `comment` section
    takes the id ending what it holds, as does a comment block inside a quote, an item or a footnote definition, which
    interrupts the paragraph before it. An inline footnote's text is still the footnote list's, not the paragraph's.
    `src/internal/markdown-inline-block-ids.ts` ports the worker's inline tokenizer loop to decide all of this; a link's
    destination, an HTML tag, an autolink and a bare URL are approximated there, since only where they end matters.
  - **A standalone id goes to the top-level section before it, whatever that is** - a code block, a definition, a list,
    even the frontmatter's `yaml` section - and leaves no section of its own. It needs the end of the note or an empty
    line after it, so `^abc\n- a` is a paragraph `^abc`, which takes `abc` inline. A note that opens with one keeps no
    trace of it, and one after an inline id overrides it.
  - **A section takes the LAST id inside it**, so `> a ^x\n>\n> b ^y` gives the blockquote `y`, and a table takes the id
    ending a cell. **A list item takes the FIRST** among its own blocks, the lists nested in it left out, while the list
    section takes none but a standalone id after it. An item in a quoted list takes none at all: only the blockquote
    does.
  - Approximated: the mock reads ids off the text rather than off a parsed tree, so a `^id` ending an unclosed fence,
    or an HTML block, inside a blockquote or an item counts here and not in Obsidian.

- **A callout gets a `callout` section, not a `blockquote` one** (2026-10-12, measured on a real Obsidian 1.14.4 over
  CDP and read in its `worker.js`). Obsidian's blockquote tokenizer tests the block's FIRST line only: past the `>` and
  the one optional space after it, the line must open with `[!`, a non-empty type, `]`, an optional `+` / `-`, then
  whitespace or the end of the line. So `> [!NOTE]`, `>[!note]` and `> [!tip]- Fold` are callouts, while `>  [!note]`,
  `>\t[!note]`, `> [!]`, `> [!note]x`, a header on a later line, and `> > [!note]` (the outer block stays a blockquote)
  are not.

- **A list item's `position.end` covers what the item holds, not just its marker line** (2026-10-12, 100 shapes
  measured on a real Obsidian 1.14.4 over CDP, and checked against its own metadata worker, the `worker.js` shipped in the
  app's archive, which runs offline in Node and gives the same answers). The worker takes the end of the item's parsed node and
  then, for an item with more than one child, moves it back to the end of its last child that is NOT a list. So:
  - **A nested list never extends its parent's end.** In `- A\n  - B`, `A` ends at the end of `- A`. An item with
    nothing after its marker is the exception, because its only child is the nested list: `- \n  - B` ends where `B`
    does.
  - **Content after the marker line extends it**: a continuation line (`- A\n  more`), a lazy line (`- A\ntext`), and a
    block after a blank line (`- A\n\n  text`) all do, and a block after a nested list does too (`- A\n  - B\n\n  text`
    ends `A` at the end of `text`).
  - **A blank line indented at least as far as the item's content belongs to it**, so `- A\n  \n- B` ends `A` at the end
    of the `  ` line, while `- A\n \n- B` does not.
  - **An item that holds only its first paragraph and is followed, after blank lines, by its own SIBLING ends at the
    start of the first blank line**, past the containers' prefix: `- A\n\n- B` ends `A` at line 1, column 0, however
    many blank lines there are, and `> - A\n>\n> - B` ends it just past that line's `>`. A following item that is not
    its sibling, a paragraph, or the end of the note leaves the end at the last line, and an item with more than one
    child never takes it.
  - **A line indented four or more columns after a quoted list, outside the quote, ends the quote**, unless an item of
    an outer list holds that quote: `> - A\n    text` ends `A` at the end of `> - A`, and the line is an indented code
    block. An outer item continues on such a line, so `- A\n> - G\n    text` keeps it a lazy continuation of `G`.

- **No list item is found inside a block that hides it** (2026-10-12, measured on a real Obsidian 1.14.4 over CDP,
  fuzzed against its own metadata worker). Those blocks are a fenced code block, a `%%` comment, a `$$` math block,
  an HTML block and an indented code block, and `src/internal/markdown-leaf-blocks.ts` finds them, container by
  container, before the list parser runs. Several of their habits are not CommonMark's:
  - **An HTML block hides items like a fence** (2026-10-12): one of the first five kinds up to the line holding its end
    marker (`<!-- c\n- a\n-->\n- b` has the one item `b`), and one of the last two up to the next empty line. A lazy
    line continuing an item opens one inside the item when it is one of the first six kinds, which interrupt the
    paragraph there, so `- a\n<div>\n  - n` has the one item `a`; a lazy `<span>` does not.
  - **Some list-shaped lines are something else** (2026-10-12). `remark-parse` tries a thematic break before a list
    item, so `* * *` and `- - -` are breaks, inside an item and a blockquote too. A table read where a block starts
    takes its rows, so `a | b\n- | -\n- c | d` is one table; a table cannot interrupt a paragraph, so the same rows inside
    an item after its first line are items. A link reference definition hides the lines its destination and title run
    onto, so `[c]:\n```\n- a` has the item `a` and no fence.
  - **An unclosed block runs to the end of its container**: the end of the note at the top level, the end of the list
    item or blockquote it sits in otherwise. So `%%\n- A` and `` ```\n- A `` have no items, and in
    `- A\n  ```\n  - B\n- C` the fence hides `B` and ends with `A`.
  - **A comment or a math block closed on the line that opens it is a paragraph**: `%% x %%` and `$$ x $$` hide
    nothing, and a `%% x %%` line after a list item is a lazy continuation of the item, not an interruption. A comment
    ends on the first later line that holds `%%`. A math block ends on the first later line whose only `$` run is the
    one it ends with, at least as long as the opening run, so `$$ x` and `$$ x $$` close nothing while `x $$` does. The
    note's last line opens no math block, since Obsidian wants a line break after the opener: `> - K\n$$` is a lazy
    continuation of `K`.
  - **Laziness reaches every open block, not just a paragraph**: in `- A\n  ```\nx\n  - B` the unindented `x` is a line
    of the fence, so `B` is hidden. Only a line that interrupts a paragraph, a blank line, or a line after one ends
    the block early.
  - **A lazy `$$` line opens a math block inside the item it continues**, so `- A\n$$\n  1. G` has the one item `A`;
    after a blockquote it ends the quote and opens one at the top level instead, unless that quote sits in an item, which
    then holds the math block. A lazy `>` line likewise opens a blockquote inside the item, which its later `>` lines
    continue, and a line that ends such a quote without an empty line before it stays in the item. An item that quote
    opens with nothing after its marker holds a lazy line after it (`+\n> - \na` ends the quoted item at 8), and a line
    that closes the outer item closes the quote and its item with it, so in `1. G` indented two spaces, then `> - a`,
    then `-` indented four spaces, the quoted item ends at 12, before the indented code (2026-10-13).
  - **A `$$` inside a list item opens a math block only when a line break follows it in the text the item gathers**
    (2026-10-12). Obsidian gathers an item's lines before it reads any block in them and drops trailing empty lines,
    so `1. G` indented two spaces, then `$$`, then a line of two spaces reads `$$` as a lazy paragraph line and ends
    `G` at 9. A line the item's strip leaves empty
    counts as empty (a tab under a two-column strip goes whole, so `+ L\n  - C\n$$\n\t` ends `C` at the `$$`), and a
    sibling after empty lines leaves one behind, so `- A\n$$\n\n- B` does open one. The same test decides whether a `$$`
    leaving a blockquote nested in an item ends the quote.
  - **A tab-led whitespace-only line continues a paragraph** outside a list item, because `remark-parse` 8 reads a tab
    as four columns of indent and takes the line without looking further: `text` indented one space, then a lone
    tab, then `9. C` is one paragraph.
  - **An item that ends inside an unclosed block before a sibling ends at the first empty line**, where an item with
    more than one child otherwise ends at its last child: `- A\n  ```\n\n- B` ends `A` at line 2, column 0. A line of
    whitespace inside a fence is a line of the code and extends the item.
  - **A marker indented four or more columns is an indented code block**, not an item, at the top level, and four or
    more columns past the content of the item above (`- A\n      - D`, a continuation of `A`), with one
    exception Obsidian makes: on a line that closes a list item, a marker of the item's kind at any indent is the next
    item (`-   A\n   - B\n    - C` has three items). A marker of another kind ends the list there and starts an
    indented code block (a `- K` indented three spaces, then a `1. R` indented four, has the one item `K`).
  - **Only a bullet or an ordered marker numbered exactly 1 interrupts a paragraph**, so `text\n2. B` and
    `- A\n  2. B` have no item `B`, while `text\n1. B` does.
  - Not modeled, and still found by the fuzz (13 of 20,000 list-shaped notes, from 52; 84 of 20,000 ordered and
    tab-indented ones, from 209): **a tab that a container takes only part of on a line that holds text.**
    `remark-parse` 8 strips a whole tab even when it takes only part of the tab's columns and then measures the rest
    afresh, so a later column shifts by a different amount on each line: `- A\n\t- D\n\t\n    text` nests `D` and lets
    it hold `text`. Only a whitespace-only line is measured that way here. Doing it for every line means comparing each
    line's columns level by level after each strip rather than as absolute visual columns, across both the pre-pass and
    the list parser, which a tab-indented item followed by space-indented content does not justify (decided 2026-10-12).
  - **A line after a blockquote that starts an ordered item not numbered 1 stays in the quote** (2026-10-12). Such an
    item cannot interrupt a blockquote, so Obsidian takes the line into the quote lazily and reads it there with the
    quote's prefix as if it had no width: as a quoted item after an item, a heading or an empty `>` line
    (`>\n9. C` is one blockquote holding the item, `> - q\n2. y` one holding two lists), as paragraph text after a
    paragraph (`> text\n9. C` has no item), as a line of an open fence, and as paragraph text of a quoted item it is
    indented to the content of (`> - q\n  2. y` is one item). A bullet, an item numbered 1, a thematic break and a line
    indented four or more columns still end the quote. The pre-pass records such lines in `lazyQuoteLines`.
  - **A line holding several markers starts an item at each, nested in the one before it** (2026-10-12): `- - x` is an
    item holding a nested item (`[0, 5, -1]` and `[2, 5, -1]`, the outer item holding nothing but the nested list), and
    `- - - x` three. `* * *` and `- - -` alone are still thematic breaks. The pre-pass records every marker's index in
    `itemMarkerIndexes`, and the parser reads each later marker's item off a copy of the line whose characters before
    the marker are spaces, so every column stays where it was.

- **A list marker that ends its line opens an empty list item** (2026-10-12, measured on a real Obsidian 1.14.4 over CDP
  and fuzzed against its own metadata worker). `remark-parse` 8 wants whitespace, a line break or the end of the note
  after a marker, so `-\ntext`, `1.\ntext` and a lone `-` are each one item and a `list` section, where the mock used to
  read a paragraph. That also fixes `---\na: 1\n----\ntext`, whose fourth `-` is such an item. Four habits come with it:
  - **It interrupts a paragraph as an item with text does**, a bullet or an ordered marker numbered 1 (`a\n*\nb`).
  - **Its content starts right past the marker**, with no column for the space it lacks, so `-\n - b` nests `b` and
    `2.\n  - C` nests `C`.
  - **A lone `-` under one line of text, at no indent, is a setext underline**, because `remark-parse` 8 tries a setext
    heading before a list: `a\n-` is the heading `a`, and so is a lone `-` under a line that opens a block inside an
    item or a blockquote, under a lazy line an item holds after a block that is no paragraph, under `[x]: /u` and under
    `<div>`. A line followed by such an underline also ends a blockquote it would otherwise continue lazily
    (`> a\nb\n-`). Under two lines of text, or under a lazy line of a paragraph, it is still an item.
  - **A marker-like run that starts no item counts as indent** when the list decides whether a line stays in its item:
    `remark-parse` 8 adds the run's width before it finds no whitespace after it. So `-\n\n-x`, `- a\n\n1.x` and
    `-\n---` are each one item, while `10.\n\n9.x` is an item and a paragraph. It matters only next to an item whose
    content starts that close, which is mostly an empty one.

- **A tab after a list marker starts an item, and the marker's whitespace is `remark-parse` 8's, not CommonMark's**
  (2026-10-13, measured on a real Obsidian 1.14.4 over CDP and fuzzed against its own metadata worker). `-\tx`,
  `1.\tx` and `-\t` are each an item, and `- a\n-\tb` is two. Before that the mock read a paragraph, or folded the line
  into the item above. `getItemContentColumn` (`markdown-leaf-blocks.ts`) is the one place both the pre-pass and the
  list parser take the content column from:
  - **A tab right after the marker is the whole of its whitespace**, and the content starts at that tab's stop, so
    `-\tx` has its content at column 4: `-\tx\n  - y` is two siblings, and `-\tx\n\t- y` nests `y`.
  - **Only SPACES count after the marker**: one to four of them, and one column when there are more. A tab after them
    is content, so `- \tx` has its content at column 2 and nests a `- y` indented two spaces, where the mock used to skip the tab too and
    put the content at column 4. Likewise `-    \tv` stops at column 5, after its four spaces.
  - The item's lines are stripped to that tab's stop as well (`getBulletWidth`), past the indent and a widened marker.

- **A backtick fence whose info string holds a backtick does not end a list** (2026-10-13). It is no fence, so
  `- a\n``` a`b\nx` is one item holding all three lines. The list parser's own interrupting-line check used to read it as
  a fence, although the pre-pass already did not.

- **A kind-6 or kind-7 HTML block ends only before a line its containers strip to nothing** (2026-10-13, read in
  `remark-parse` 8's HTML tokenizer, whose end test for those kinds is `/^$/`). A line of spaces or a tab is one of its
  lines, so `<div>\n  \n- a` is one `html` section and no item. Inside a list item the line is first stripped as the item
  strips every later line, whole whitespace characters up to its removal width, so `- <div>\n \n  - b` still ends the
  block and nests `b`, while `- <div>\n   \n  - b` does not. A blockquote strips its `>` and one space, so after
  `> <div>` a `>` line with one space after it ends the block, and one with two spaces does not.

- **A line leaving a blockquote that a list item holds is measured after the item strips it** (2026-10-13). The rule
  that a line indented four or more columns ends a quoted list applies to the indent left once the outer item, which
  gathers the line lazily, has stripped it. So `-    v\n> > - K\n    text` keeps `text` in `K`: the item's content
  starts at column 5, its later lines are stripped by 4, and nothing is left of the indent.

- **`MetadataCache.getFirstLinkpathDest` ignores case, as Obsidian's link index does** (2026-10-09, `getLinkpathDest`
  in Obsidian 1.14.x's `app.js`, which looks names up lower-cased and compares lower-cased paths). So `[[homepage]]`
  reaches `HomePage.md`, and the link graph records it as resolved. One deliberate departure: an EXACT-case match still
  wins over a case-folded one, where Obsidian has no case preference at all — the mock already ignores `sourcePath`, so
  it never reproduced Obsidian's candidate order, and exact-first keeps every earlier answer unchanged.

- **`getFrontMatterInfo` is a port of Obsidian's own, and its `frontmatter` ends WITH the newline** (2026-09-24, `hg`
  in Obsidian 1.14.x's `app.js`). `to` is the index of the closing `---` itself, so `[from, to)` is exactly the region
  to replace, and splicing in `stringifyYaml()` output leaves no blank line before the delimiter. The mock used to stop
  one character short, excluding that newline, which is what put a spurious blank line into every mocked
  `setFrontmatter`. An EMPTY block (`---\n---\n`) exists too, with `frontmatter` `''`; the mock used to report none.

- **`frontmatterPosition` and the `yaml` section end at the end of the closing `---`** (2026-10-12, measured on a real
  Obsidian 1.14.4 over CDP and with its own metadata worker). So `---\na: 1\n---\ntext` ends both at line 2, column 3,
  offset 12, and a CRLF note ends them before the `\r`. The mock used to end them at the start of the next line, which is
  `getFrontMatterInfo(...).contentStart`.

- **The parser finds the frontmatter block with the worker's own tokenizer, not with `getFrontMatterInfo`** (2026-10-12,
  read in Obsidian 1.14.4's `worker.js` and `app.js`). The worker wants `---` and a line break to open the note, then
  takes the first later `---` that starts a line as the closing delimiter, whatever follows it on that line, and goes on
  tokenizing right after it. So `---` followed by spaces or a tab, `----` and `---x` all close the block there, where the
  public `getFrontMatterInfo`, a port of `app.js`'s own, still wants the line to end after the `---` and is left as it
  is. What follows the delimiter on its line is body: `---x` leaves a paragraph `x` starting at column 3. The opening
  `---` takes no trailing whitespace, and a closing `---` indented by a space closes nothing, in both.

- **Frontmatter links are an EXACT port of Obsidian's own reader, not the approximation the rest of this
  parser is** (2026-09-17, read in Obsidian 1.14.2's `app.js`). Four of its properties look like defects
  and are not, so do not "fix" them back:
  - **The WHOLE value is the link, or there is none.** A wikilink is recognized only when the value starts
    with `[[` and ends with `]]`, so `related: see [[Target]] later` links to nothing. Obsidian never scans
    inside a frontmatter value the way it scans a note's body.
  - **`displayText` is ALWAYS set**, even with no `|`: it is the target, with each `#` shown as ` > `, so
    `[[Note#Section]]` displays as `Note > Section`. This is why a frontmatter `[[Target]]` round-trips
    through `FileValue.getLinks` as `[[Target|Target]]` rather than bare.
  - **A markdown link counts too**, when its target is internal — explicitly relative, or free of a `:`.
    An `<...>` target is unwrapped and the target is `decodeURI`-d, so `[Shown](<A%20B.md>)` links to
    `A B.md`.
  - **The walk reaches ANY depth**, arrays and objects alike, keying each find by its dotted path
    (`meta.related.0`).

  One deliberate divergence, commented at the site: Obsidian reads the target's capture group unguarded,
  so a value of `[Shown]()` throws a `TypeError` out of its metadata parse; the mock reads it as no link
  instead, rather than losing a whole note's metadata in a consumer's test.

- **A frontmatter block that is not well-formed YAML does NOT throw** (2026-09-18, read in Obsidian
  1.14.2's `app.js`). Obsidian's frontmatter parse wraps its `parseYaml` in a `try` and answers `null`,
  so invalid YAML lands in exactly the branch a non-object block takes and the note still gets a cache —
  body, headings, links and the `yaml` section included. `src/internal/markdown-parser.ts` mirrors that in
  `parseFrontmatterYaml`, and the branch it falls into is the no-frontmatter one described below.
  Before the guard it called `parseYaml` unguarded, which broke both entry points at once:
  `MetadataCache.computeMetadataAsync` — public API that never rejects there — rejected with the
  `YAMLParseError`, and indexing such a note through the vault's `create` event left it with NO cache at
  all, because `Events.tryTrigger` swallowed the throw and threw it again from a timer as an uncaught
  exception.

  `FileManager.processFrontMatter` is deliberately NOT guarded the same way: Obsidian's own
  implementation parses with no `try`, so a broken block throws out of it there exactly as it does here.

- **A frontmatter block that is not a plain object leaves NEITHER `frontmatter` NOR `frontmatterPosition`
  behind** (2026-09-18, read in Obsidian 1.14.2's `app.js`). Obsidian's frontmatter parse answers falsy for
  every such block — a scalar, `null`, an empty or whitespace-only block, invalid YAML, and a YAML
  SEQUENCE — and its cache builder writes `frontmatter`, `frontmatterPosition` and `frontmatterLinks`
  behind that one guard. So all of those shapes give a cache that reads exactly like a note with no
  frontmatter at all, while the `yaml` SECTION is still pushed: the sections loop walks every child of the
  parsed document regardless of what the frontmatter parse made of the first one.

  **A SEQUENCE is in that list by name, not by implication** (2026-09-18). An array passes a
  `typeof x === 'object'` test, so it takes a deliberate `!Array.isArray()` to exclude — which is exactly
  what Obsidian's parse spells out: `if (n && "object" == typeof n && !Array.isArray(n)) return n || void 0`.
  A note whose whole block is `- a`/`- b` therefore has NO frontmatter in the cache, not a `frontmatter`
  holding `['a', 'b']`. The mock stored the array until this was measured, and nothing would have reported
  it: `FrontMatterCache` is `{ [key: string]: any }`, which an array satisfies structurally, and every
  `frontmatter['key']` read on one answers `undefined` without complaint.

  This matters because a consumer branches on `cache.frontmatter` being PRESENT, and slices the block off
  with `frontmatterPosition`. The mock used to store an empty record and a position here, which reads as a
  note that has frontmatter holding nothing — a different answer from Obsidian's, and the reason
  `getFileCache(file).frontmatter` was truthy for a note whose block is `just a string`. Nothing on the
  consuming side needed changing when it was dropped: `parseFrontMatterTags`, `parseFrontMatterEntry` (so
  `parseFrontMatterStringArray` and `parseFrontMatterAliases` through it), `getAllTags`,
  `FileValue.getTags` and `FileValue.getProps` were all written for the no-frontmatter case already, and
  that is the same shape.

  The empty record it replaced was NOT a mistake at the time — it was itself a fix for a `strictProxy`
  stored there, whose `get` trap threw on every absent-key read. Both a plain `{}` and an absent record
  cure that; the measurement against `app.js` is what chose between them.

- **The workspace is a real layout tree** (2026-09-17, checked against Obsidian 1.14.2's bundle). Leaves sit in
  tab groups under `rootSplit`, `leftSplit`, `rightSplit`, or a popout `WorkspaceWindow` under `floatingSplit`, and
  `WorkspaceParent.children` / `insertChild` / `removeChild` / `replaceChild` maintain it as Obsidian does, emptied
  parents included. So `iterateRootLeaves` skips sidebar and popout leaves, `getMostRecentLeaf` picks the highest
  `activeTime` (which `setActiveLeaf` stamps), and `getRoot()` / `getContainer()` walk up through `parent`. Two
  deliberate departures: `setActiveLeaf` adopts a leaf outside the layout into the root tab group (Obsidian ignores
  it), so `WorkspaceLeaf.create2__(app)` followed by `setActiveLeaf` still works; and `activeTime` is kept strictly
  increasing, so two activations in one millisecond still order.

- **The leaf lifecycle follows Obsidian's, and four of its habits are NOT what the mock used to do**
  (2026-09-17, read in Obsidian 1.14.2's `app.js`). Each of these changes what an existing consumer test observes.
  - **Creating a leaf ACTIVATES it.** `createLeafInParent`, `createLeafBySplit` and `getUnpinnedLeaf` all call
    `setActiveLeaf`, and `createLeafInTabGroup` does too when the vault's `focusNewTab` setting is on — which is now
    a modelled default (`true`, from the same default-config object `attachmentFolderPath: '/'` comes from). So
    `getLeaf(true)` leaves the workspace with an active leaf where it used to leave `activeLeaf` as `null`.
  - **`active-leaf-change`, `file-open` and `layout-change` are DEFERRED and gated on `layoutReady`.** As in
    Obsidian, `setActiveLeaf` asks for the first two through `requestActiveLeafEvents` (a 0 ms debouncer) and
    `updateLayout` asks for the third through `requestLayoutChangeEvents` (10 ms), and `activeLeafEvents` /
    `layoutChangeEvents` do nothing at all until the layout is ready. A test that wants them therefore needs
    `app.workspace.setLayoutReady__()` and then either a timer tick or `requestActiveLeafEvents.run()` /
    `requestLayoutChangeEvents.run()`, which fire a pending event at once. `setActiveLeaf` on the leaf that is
    already active does nothing and fires nothing.
  - **Detaching the active leaf no longer clears `activeLeaf`** — Obsidian does not clear it either. The re-pick
    happens in `updateLayout`, which every child mutation asks for through `onLayoutChange` →
    `requestUpdateLayout`, coalesced onto a **microtask**. So `await Promise.resolve()` after a detach, or call
    `workspace.updateLayout()` directly. `updateLayout` also re-creates a tab group and a leaf in an emptied root
    split, and clears a link group that is down to one leaf.
  - **`iterateLeaves` / `iterateAllLeaves` / `iterateRootLeaves` STOP on a truthy callback.** The mock used to visit
    every leaf regardless, which quietly forgave the common `(leaf) => leaves.push(leaf)` shape — `push` returns the
    new length, so that callback now collects exactly one leaf. Give such a callback a block body. As in Obsidian,
    `iterateAllLeaves` starts one walk per part and discards all four answers, so stopping inside the root split
    does not stop the sidebars.

  Three more members went from stand-in to Obsidian's own: `getUnpinnedLeaf` picks the most recently active
  navigable leaf that is its tab group's current tab (`WorkspaceTabs.currentTab` / `isStacked` are modelled now, and
  `WorkspaceLeaf.canNavigate()` reads `view.navigation` — the empty view navigates, so a leaf showing nothing is
  reusable); `getLeavesOfType` / `detachLeavesOfType` match on `leaf.view.getViewType()` rather than on
  `getViewState().type`, so a fresh leaf answers `getLeavesOfType('empty')`; and
  `WorkspaceItem.dimension` / `setDimension` model the flex-grow share Obsidian divides on `createLeafInParent`,
  `splitLeaf` and the single-child promotion in `removeChild`, and clears in `moveLeafToPopout`.

  **One departure kept on purpose.** `createLeafInTabGroup` falls back to the root tab group where Obsidian throws
  `No tab group found.`, so `getLeaf('tab')` works on a workspace no test has populated. Otherwise it is Obsidian's
  own: it hands back the group's most recently active tab, without activating it, when that tab is still showing the
  empty view — so two `getLeaf('tab')` calls with nothing done in between answer with the same leaf.

- **A leaf's view is REAL, built through `App.viewRegistry`** (2026-09-17, read in Obsidian 1.14.2's `app.js`). This
  is the largest of the leaf-lifecycle changes and the one most likely to move an existing consumer test.
  - **`WorkspaceLeaf.view` is never `null`.** Every leaf is born holding `_empty`, Obsidian's "New tab" page, and
    goes back to it whenever `open(null)` is called. So `getDisplayText()` answers `New tab` and `getIcon()` answers
    `lucide-file` for an untouched leaf, where both used to answer `''`; `getActiveViewOfType` and any consumer
    branch written as `if (leaf.view)` now always takes the view arm.
  - **`setViewState` BUILDS the view its type names**, exactly as the app does: a registered type through its
    creator (a creator that throws is logged and falls back to the unknown-type view), `'empty'` back to `_empty`,
    and anything else to the unknown-type view, which keeps the type it could not build and carries `lucide-ghost`.
    The view is rebuilt **only when the type changes** — a state naming the type the leaf already shows keeps the
    view and only calls `setState` on it — and a call reached from inside another one is dropped, through Obsidian's
    own `working` guard. `active`, `group` and the ephemeral state are applied as in the app.
  - **`setViewState({ type: 'markdown' })` with no `state.file` sends the leaf BACK to the empty view.** That is
    Obsidian: a file view left with no file answers `close` on the state result, and the leaf reopens `_empty`. Pass
    `state: { file: '<a path the vault really has>' }`, or use `leaf.openFile(file)`. A test that used a bare view
    state as "fill this tab" has to give it a real file now.
  - **`getViewState()` is DERIVED from the view**, not stored: `{ state: view.getState(), type:
    view.getViewType() }`, plus `pinned` when the leaf is pinned. So it always carries a `state` object, and a type
    the leaf could not build reads back as that type rather than as `'empty'`. Obsidian also writes the view's icon
    and display text there for its deferred-view placeholder; neither `obsidian.d.ts` nor `obsidian-typings`
    declares those two members of `ViewState`, and the mock never defers, so it leaves them out.
  - **`WorkspaceLeaf.openFile` really opens a view.** It asks the registry for the extension's view type — or keeps
    the current view's type when it already accepts that extension — and goes through `setViewState` with the file's
    path in the state, which `FileView.setState` resolves and loads through a real `FileView.loadFile`. So
    `leaf.view` is a `MarkdownView` holding the file, and `leaf.file__` reads it off that view rather than off a
    field of its own. A file whose extension no view type is registered for changes nothing, which is Obsidian's own
    branch for one.
  - **`view-state-change` is GONE.** No such event exists in `obsidian.d.ts`, in `obsidian-typings` or anywhere in
    Obsidian 1.14.2's bundle — the mock invented it, and `setViewState` was the only thing that fired it.
  - **`WorkspaceLeaf.getViewType__()` and `isShowingEmptyView__()` are gone too**, along with the reason they
    existed: ask `leaf.view.getViewType()` and `leaf.view instanceof EmptyView`. As in Obsidian, `UnknownView`
    EXTENDS `EmptyView`, so a leaf showing a type it could not build counts as empty for tab reuse.
  - **What the registry holds.** `App.viewRegistry` starts with Obsidian's Markdown view and the `md` extension, and
    nothing else: the app's image, audio, video, PDF and release-notes views have no class here, and registering an
    extension whose type has no creator would open such a file as the unknown-type view where Obsidian opens a real
    one. `Plugin.registerView` / `Plugin.registerExtensions` add to it and remove their entries on unload, as they
    do in the app. `EmptyView`, `UnknownView` and `ViewRegistry` are `obsidian-typings` interfaces with no
    `obsidian.d.ts` counterpart, so per L1 they live in `src/internal/` beside `Plugins`.
  - **Not modelled, deliberately:** the deferred view (its branch needs `getHistoryState()` and
    `containerEl.isShown()`, neither of which the mock has, so `isDeferred` stays `false`); navigation history, so
    `setViewState` records none; `FileView.syncState`, the linked-pane follow Obsidian schedules on the state
    result's `done`; and the two user-facing notices Obsidian shows when a view fails to close or a file fails to
    load — both paths are logged, as they also are there.
  - `WorkspaceItem.containerEl` is real now, because `View.open` / `View.close` need somewhere to put the view's
    element. The mock does NOT build the layout's DOM tree: each item gets a detached element of its own, so a
    child's element is not inside its parent's. The one containment it maintains is the leaf's view, so
    `leaf.containerEl.contains(leaf.view.containerEl)` holds, and closing a view detaches and unloads it.

- **Every leaf carries Obsidian's tab header** (2026-09-24, `GO` in Obsidian 1.14.x's `app.js`). The constructor builds
  `tabHeaderEl` (`workspace-tab-header tappable`, draggable) holding one `workspace-tab-header-inner` div whose
  children are, in order, `tabHeaderInnerIconEl`, `tabHeaderInnerTitleEl`, `tabHeaderStatusContainerEl` and
  `tabHeaderCloseEl` (`lucide-x`, tooltip `Close`, recorded as `data-icon` / `aria-label`). `obsidian-dev-utils`' lock
  indicators append to `tabHeaderStatusContainerEl` on every open Markdown leaf, which is what made the strict proxy
  throw there. Not modelled: `updateHeader` (so the icon and title stay empty, and `tabHeaderStatusPinEl` /
  `tabHeaderStatusLinkEl`, which it creates lazily, stay unmocked), the header's listeners (close click, drag, context
  menu, middle click), and placing the header in its tab group's `tabHeaderContainerEl`.

- **The `View` base does NOT navigate, and carries `lucide-file`** (2026-09-17, read in Obsidian 1.14.2's
  `app.js`). Obsidian's base constructor sets `icon = 'lucide-file'` and `navigation = false`; the mock had both
  inverted. It matters because `WorkspaceLeaf.canNavigate()` reads `view.navigation`, so a bare mock view used to
  claim the active leaf for reuse where a real one would not. `getIcon()` answers `lucide-file` when the icon has
  been emptied, as the app does, rather than returning the empty string. Of the mocked subclasses only `FileView`
  touches either field (`navigation = true`) — `ItemView`, `EditableFileView` and `TextFileView` set neither, and
  `MarkdownView` sets `lucide-file`, the value the base now carries anyway.

- **`MarkdownView` owns no text: its MODES do, and `currentMode` is the edit view** (2026-09-17, read in Obsidian
  1.14.2's `app.js`). The mock used to keep four disconnected buffers — `MarkdownView.data`, its own `editor`, a
  `currentMode` nothing else wrote, and a `MarkdownEditView` built from a view but holding a separate editor of its
  own. It now mirrors Obsidian: `modes` holds `{ source: editMode, preview: previewMode }`, `currentMode` IS
  `editMode`, and that mode owns the editor. So `view.editor` is `view.editMode.editor` (a GETTER, as in the app),
  `getViewData()` is `currentMode.get()`, and `setViewData(data, true)` reaches EVERY mode while
  `setViewData(data, false)` reaches only the current one — `clear()` clears them all. What changes for a consumer:
  - **An edit through any one surface is visible through the others.** `view.editor.replaceRange(…)`,
    `view.editMode.set(…)` and `view.setViewData(…)` all write the same buffer, and `view.getViewData()`,
    `view.currentMode.get()` and `view.data` all read it. The class doc's old admission that "edits made through
    the editor alone are not copied back to `data`" is gone with the second buffer.
  - **`data` is a read-through accessor**, which is a deliberate departure. Obsidian keeps it as a plain field and
    refreshes it from `currentMode.get()` on every CodeMirror update, through `onInternalDataChange`; the mock has
    no update listener to fire that, so a stored copy would go stale exactly where the app's never does. Writing
    `view.data = x` sets the current mode, the way `TextFileView.setData` does in the app. `TextFileView.data` is
    therefore an accessor pair too — a base-class FIELD cannot be overridden by a subclass accessor, since its own
    property on the instance shadows the prototype.
  - **`MarkdownEditView.editor__` is now `MarkdownEditView.editor`.** `obsidian-typings` declares that member on
    `MarkdownBaseView`, so Obsidian really has it and the `__` suffix was asserting the opposite (L4). Both edit
    and preview views also carry their real `type` (`'source'` / `'preview'`), which is what `modes` is keyed by
    and what `getMode()` reports.
  - **`MarkdownSubViewImpl` is gone.** It was the stand-in current mode; with both real modes carrying
    `get`/`set`/`clear` there is nothing left for it to stand in for. `registerMode`, `sourceMode`, `setData` and
    `onInternalDataChange` stay unmocked: the mock registers exactly the two modes, and with `data` reading
    through the mode the last two would be self-assignments.

- **The Markdown edit view dispatches a minimal line diff, not a whole-document replace** (2026-09-17, read in
  Obsidian 1.14.2's `app.js`). `MarkdownView.setViewData(data, false)` and `MarkdownEditView.set(data, false)` compare
  the old and new text line by line: the common leading lines are trimmed, then the common trailing ones, and when
  exactly one line differs the change is narrowed to the characters that differ within it. The one resulting change
  goes through `Editor.transaction`, so it is a single undo step and the selection is MAPPED through it — a cursor
  outside the changed lines does not move, where a whole-document replace would have collapsed it to the start.
  Setting text identical to what is already there dispatches nothing at all and records no undo step. Both also
  mirror Obsidian's `cmInit`: an editor that has never been given a state of its own is RESET by the first call
  whatever `clear` says, so the `false` path only diffs after a `setViewData(_, true)` / `set(_, true)` / `clear()`.
  The shared implementation is `src/internal/markdown-editor-set.ts`; `Editor.setValue` is untouched and still
  replaces the whole document, because that is what Obsidian's own `setValue` does.

- **`Editor.exec` answers to CodeMirror, and its two line commands now say so** (2026-09-17, read in Obsidian
  1.14.2's `app.js`, which bundles `@codemirror/commands` whole). `Editor.exec(name)` is
  `commands[name](activeCM)` there, so `deleteLine` is CodeMirror's `deleteLine` and `swapLineUp` /
  `swapLineDown` are its `moveLineUp` / `moveLineDown`. The documents the handlers produce are unchanged for a
  plain cursor; three things a consumer test can observe are not.
  - **`deleteLine` keeps the column.** CodeMirror moves the cursor one line DOWN first and maps that through
    the deletion, so deleting the middle line of `line1\nline2\nline3` from column 3 leaves the cursor at
    column 3 of `line3`, where the mock used to leave it at column 0. Deleting the last line still leaves it
    at the end of the line before. Line wrapping is not modelled, so "one line below" is the same column on
    the next line clamped to its length, and the end of the document when there is no next line.
  - **A swap is ONE undo step.** It was two `setLine` calls, so an undo used to put back one of the two lines
    and leave the other where the swap had moved it. Both
    changes and the selection now travel in a single transaction, and the selection is the one CodeMirror
    dispatches — every end shifted by the length of the line that moved across it.
  - **Both act on every line the selection covers**, CodeMirror's `selectedLineBlocks`, rather than on the
    head's line alone; a non-empty selection ending at column 0 stops at the line before it. A swap keeps the
    selection's extent, while `deleteLine` collapses to a cursor, as `moveVertically` does.

- **An omitted `Notice` duration records Obsidian's default, `4000`, not `0`** (2026-09-24, read in Obsidian
  1.14.2's `app.js`, whose constructor opens `void 0 === t && (t = 4e3)`). `0` is the never-hide value, so recording
  it for an omitted duration made `Notice.duration__` answer the same for "hide after the default" and "stay until
  dismissed" — a consumer that dropped the duration of a notice meant to stay could not catch it. Only `undefined`
  takes the default; an explicit `0` is still recorded as `0`.

- **`Keymap.isModifier` / `Keymap.isModEvent` read the event.** They were unconditional `false` stubs
  until 2026-07-27, which made every modifier-branching behavior untestable without a spy — and let a
  test that forgot the spy silently exercise only the no-modifier path while looking green. Both now
  mirror the real implementation: `Mod` resolves to `metaKey` when `Platform.isMacOS` (flip that mock
  to exercise macOS) and `ctrlKey` otherwise; `isModEvent` returns `'tab'` for a middle click, `false`
  without `Mod`, `'tab'` for `Mod`, `'split'` for `Mod`+`Alt`, and `'window'` for `Mod`+`Alt`+`Shift`.

- **Value-typed global augmentations are properties, not methods** — `el.doc`, `el.win`,
  `el.constructorWin`, `el.innerWidth` and `el.innerHeight` are read as values (`el.doc.body`),
  matching how `obsidian.d.ts` declares them. `Object.assign` cannot define accessors, so these live in
  dedicated `src/globals/*-setup.ts` modules (alongside the pre-existing `ui-event-setup.ts`) wired
  through `post-setup.ts`, not in the `*.prototype.ts` modules. `conformance.test.ts` now enforces the
  kind, so a value-typed member re-implemented as a method fails the gate.

- **A `Document`'s `.doc` / `.win` resolve to the MAIN document / window — deliberately** (verified
  2026-07-29). `src/globals/node-setup.ts` falls back to the **global** `document`, not to `this`, because
  that is Obsidian 1.13.4 verbatim — the shipped bundle defines each extension exactly once:
  `n(Node.prototype, "doc", function () { return this.ownerDocument || document })` and
  `n(Node.prototype, "win", function () { return this.doc.defaultView || window })`. A `Document` is the one
  node whose `ownerDocument` is `null`, so `someDocument.doc` is the main document and `someDocument.win` the
  main window **even for a pop-out** — in real Obsidian as much as here. This looks like a mock bug and is
  not one: `obsidian-dev-utils`' `getDocumentWindow(doc)` exists precisely to work around it, so
  pop-out-aware consumers must use that rather than reading `doc.win`. "Correcting" the fallback to
  `?? this` would make the mock *more* correct than Obsidian and therefore lie — a pop-out unit test would
  pass here while the real code resolved the main window. `node-setup.test.ts` pins both halves with a
  second document in play, so the two candidate fallbacks are distinguishable and the wrong one fails.

- **`MenuItem`'s submenu is modeled** (added 2026-07-28), so a plugin's real menu handler —
  `menu.addItem((item) => { const subMenu = item.setSubmenu(); … })`, the shape every plugin with a
  context submenu uses — runs against the mocks. Both names are obsidian-typings internals (neither
  `setSubmenu` nor `submenu` is in `obsidian.d.ts`), so per L4 they live on the mock under those exact
  names. `setSubmenu()` **memoizes** — it creates the `Menu` on first call and
  returns that same instance afterwards, mirroring real Obsidian's `this.submenu || (…)` — and
  records it in `submenu`, so a test can read back the items the plugin added to the submenu
  (`item.submenu?.items`). Previously it built a fresh `Menu` and threw it away. The real
  implementation's DOM side effects (the `has-submenu` class and the `menu-item-icon mod-submenu`
  chevron) are NOT modeled — `MenuItem` has no `dom`.

- **Declarative settings tabs render for real** (added 2026-07-31). Obsidian 1.13 builds a tab from
  `getSettingDefinitions()`, and nothing rendered those definitions in a unit test — so every plugin that
  migrated hand-rolled its own mini-renderer, in four divergent shapes, most of which silently ignored the
  `visible` / `disabled` predicates. `SettingTab.renderTab()` (an obsidian-typings internal, so un-suffixed
  per L4) now does it, backed by `src/internal/setting-definition-renderer.ts`, which mirrors the
  shipped Obsidian 1.13.x renderer function for function (`V2`/`Q2`/`$2`/`Z2`/`n6`/`U2`/`_2`/`z2`/`Y2`).
  - **Usage:** `tab.update()` (the real API that stores the definitions in `settingItems`) then
    `tab.renderTab()`. From a consumer whose tab is typed against the real `PluginSettingTab`, convert with
    `SettingTab.fromOriginalType__(tab)` (L6). Read the result back with `getRenderedRows__()` — one entry per
    rendered row: `{ cleanup, definition, isVisible, setting, settingEl }`. `refreshDomState()` re-evaluates
    the predicates over the already-rendered tree, and `hide()` clears it.
  - **A hidden row is RENDERED, then hidden** — `settingEl.toggle(visible)` — exactly as Obsidian does; it
    never skips a row's `render` callback. A helper that skips invisible rows (the shape most plugins copied)
    diverges from the app and leaves those callbacks uncovered. `disabled` is applied only when the definition
    declares it, and a predicate that throws logs and falls back to its default, both verbatim from `app.js`.
    Note `disabled` is honored on every definition kind at runtime even though `obsidian.d.ts` declares it
    only on the action and control variants.
  - **A group is hidden when its own predicate is false OR every row it owns is hidden**; a group that owns no
    rows stays visible. Loose top-level rows are wrapped in an implicit headless group, so every row is
    rendered inside a `SettingGroup` — which is what reaches a `render` callback's second argument (the
    hand-rolled copies all passed `null` there).
  - **Not modeled, deliberately:** `control` rows **throw** rather than render an empty row (no consumer uses
    them; a declarative tab uses `settingEx` instead); there is no keyed reconciliation, so each `renderTab__()`
    rebuilds; group search inputs and the `list` add/delete/reorder affordances are absent (a `list` renders as
    a group); and a `page` renders as its own name/desc row without navigation — render its `items` by passing
    them in explicitly.
  - `Setting.setDisabled` propagates to the components on the row, as in real Obsidian (since 2026-09-17), so
    `component.disabled` — and, for the components that own an element, that element's own `disabled` — answers for a
    row the renderer disabled.

- **Setting components follow Obsidian's change-callback rules** (2026-09-17, read from Obsidian 1.14.2's
  `app.js`). A text, text area, search or moment-format component's `setValue` never calls `onChange`; its
  value lives in `inputEl`, and an `input` event on the element is what calls the callback. A dropdown's
  `setValue` does not call it either; its `change` event (or `simulateChange__`) does. `ToggleComponent`,
  `SliderComponent` and `ColorComponent` DO call `onChange` from `setValue`, but only when the value actually
  changes. `SecretComponent.setValue` calls nothing. A test that relied on `setValue` to drive a
  plugin's `onChange` handler should dispatch the element's event instead (`input` for text, `change` for a
  dropdown, slider or color picker) or call `onClick` / `simulateClick__`. The slider applies a browser's range rules
  itself (jsdom does not): the value is clamped, stepped from `min`, and starts at the middle of the range.

- **A disabled component is disabled in the DOM, not only in its flag** (2026-09-17, read in Obsidian 1.14.2's
  `app.js`). `setDisabled` writes `buttonEl.disabled`, `inputEl.disabled` (so text, text area, search and moment
  format) and `selectEl.disabled`, alongside the `is-disabled` class the toggle and extra button already carried and
  the `disabled` flag `BaseComponent` keeps. Since `Setting.setDisabled` propagates to the row's components, a row the
  declarative renderer disables now reads as disabled from the elements too. `ButtonComponent` also carries the click
  listener Obsidian attaches: a real click on `buttonEl` runs the handler unless the button is disabled, with
  `mod-loading` on the element until the handler settles — one microtask even for a handler that is not async, exactly
  as Obsidian's `await` does. `simulateClick__(event?)` is that same path without an event and stays `void`-returning,
  so a consumer's `no-floating-promises` does not fire on its existing call sites; a handler that rejects is
  `console.error`ed rather than left as an unhandled rejection, which would fail an unrelated test.

- **A `Setting` row is built exactly as Obsidian builds it** (2026-09-17, `Zx` in Obsidian 1.14.2's `app.js`):
  `settingEl` (`setting-item`, `tabindex="-1"`) holds `infoEl` (`setting-item-info`) with `nameEl`
  (`setting-item-name`) and `descEl` (`setting-item-description`), followed by `controlEl` (`setting-item-control`) —
  so those selectors resolve in jsdom, and `infoEl` comes BEFORE `controlEl`, which the mock used to build the other
  way round with no class on any element. `setName` / `setDesc` REPLACE the element's content (`setText`) instead of
  appending a fragment to whatever was there. `setErrorMessage` creates `errorEl` once, as a `setting-item-error` div
  in `controlEl`, and an empty string or `null` HIDES it and keeps it — `errorEl` stays set, and only `clear()` drops
  it, as in Obsidian.

- **`Modal`'s DOM mirrors Obsidian** (added 2026-08-09). The mock used to build
  `containerEl > modalEl > [contentEl, titleEl]` with no classes and no backdrop; it now builds Obsidian
  1.13.6's tree verbatim:

  ```text
  containerEl ('modal-container')
  ├── bgEl ('modal-bg')
  └── modalEl ('modal')
      ├── headerEl ('modal-header') > titleEl ('modal-title')
      └── contentEl ('modal-content')
  ```

  So `.modal-bg` / `.modal-header` / `.modal-content` selectors resolve in jsdom exactly as in the app.
  `bgEl` and `headerEl` are obsidian-typings-only internals (neither is in `obsidian.d.ts`), so per L4 they
  live on the mock under those real names.
  `bgEl` matters because it is the element Obsidian registers modal dismissal on — every "the user clicked
  outside the dialog" behavior is about it, and a strict-proxy read of it used to throw, which is what
  forced `obsidian-dev-utils`' modal-wrapper tests to hand-build the missing sibling.
  **`titleEl` MOVED** from a direct `modalEl` child into `headerEl`: `modalEl.contains(titleEl)` still
  holds, `titleEl.parentElement === modalEl` no longer does.
  **Not modeled, deliberately:** the close button (`modal-header-button mod-raised clickable-icon`) and the
  real `bgEl` click listener that dismisses the modal — `open()` / `close()` remain simplified stand-ins,
  and adding a listener would change what existing consumer tests observe.

- **`SuggestModal`'s instruction bar is modeled**, so consumers can drive the real
  `SuggestModalCommandBuilder` (`obsidian-dev-utils` `obsidian/modals/suggest-modal-command-builder`)
  instead of hand-rolling a fake. `instructionsEl` is an obsidian-typings-only internal (not in
  `obsidian.d.ts`), so per L4 the mock declares it under that real name: a real
  `createDiv('prompt-instructions')` container created in the constructor. `setInstructions(instructions)` renders faithfully to real Obsidian:
  when non-empty it clears the container and appends one `.prompt-instruction` div per `Instruction`
  whose **first** span (`.prompt-instruction-command`) holds `command` and **second** span holds
  `purpose`, then attaches the container to `modalEl`; when empty it detaches the container. The
  builder queries `.prompt-instruction > span:nth-child(2)` (the purpose span) to inject
  checkbox/dropdown inputs and registers option-toggle shortcuts on the (already-modeled) `modal.scope`.

- **Every Bases `Value` carries an icon, a key list and property access** (2026-09-17, read in Obsidian 1.14.2's
  `app.js`). `Value.icon` is the lucide name for the value's type, assigned per class in the constructor as
  Obsidian assigns it, so a subclass that declares none inherits the one above it: `lucide-file-question` on the
  base and on `NullValue`, `lucide-text` on `StringValue` and on `TagValue`, `lucide-binary`,
  `lucide-check-square`, `lucide-regex`, `lucide-calendar-range`, `lucide-file`, `lucide-code-2`,
  `lucide-image` on `IconValue` and `ImageValue`, `lucide-link` on `UrlValue` and `LinkValue`, and
  `lucide-list` on `ListValue` AND on `ObjectValue` — the app really does give an object the list icon.
  `DateValue` picks by its own `time`: `lucide-clock` with it, `lucide-calendar` without, which
  `RelativeDateValue` inherits. The one icon no EXPORTED class carries is `lucide-tags`, which belongs to
  the internal tag-list subclass below.
  - **`keys()` lists what a formula's `.` access can reach and `objectAccess(key)` reads it**, matched without
    regard to case. `StringValue` and `ListValue` add `length`; `DateValue` adds `year` / `month` (from `1`) /
    `day` / `hour` / `minute` / `second` / `millisecond` / `timestamp`, all local; `DurationValue` adds the
    eight units, each measured Obsidian's way by shifting *now* and taking moment's fractional difference, so a
    calendar unit depends on the current date; `ObjectValue` REPLACES the list with its own keys and routes
    access to `getInsensitive`, so an unknown key gives `NullValue.value` rather than `null`. Everything else
    inherits the base, which lists nothing and answers `null`.
  - **`FileValue.objectAccess` answers all fifteen keys Obsidian's does.** Ten come off the `TFile` itself;
    `folder` throws when the file has no parent folder, where Obsidian reads it unguarded. The other five —
    `links`, `embeds`, `backlinks`, `tags` and `properties` — go through `FileValue.getLinks` / `getEmbeds` /
    `getBacklinks` / `getTags` / `getProps`, and four of their habits are worth knowing:
    - **Each accessor MEMOIZES on first call and is never invalidated**, exactly as Obsidian's `_cachedLinks`
      and its four siblings do. A value built before the vault changed goes on answering what it answered
      then; build a fresh `FileValue` to see the new state.
    - **`links` reads the file's OWN cache, `backlinks` reads the link GRAPH.** So `links` lists frontmatter
      links, then body links, then embeds (`iterateRefsForFile`'s order — an embed is an outgoing link too),
      including links that resolve to nothing; `backlinks` walks `resolvedLinks` and therefore lists only
      resolved ones, once per source note, each shown by that note's short name.
    - **`tags` and `properties.tags` both print `#alpha` for a frontmatter `tags: [alpha]`**, by two
      different routes, as they do in Obsidian. `tags` goes through `parseFrontMatterTags`, which
      `#`-prefixes the text before a value is built; `properties` wraps the RAW frontmatter, and the
      `#`-prefix arrives later, from the `TagValue` constructor — it overwrites the wrapped text with its
      `#`-prefixed form, so `new TagValue('alpha').data` is `#alpha` and only the construction hooks still
      see the text as passed. The two routes therefore agree on display AND on `equals`, and matching was
      never in question: `tagMatches` normalizes on its own.
    - **`properties` carries the frontmatter evaluator**, which reads a string property as a wikilink, a URL
      or a date before falling back to the ordinary conversion, and reinstalls itself on every nested list
      and object so those readings reach the whole tree.

- **Every Bases value class carries Obsidian's own type NAME, and two members hang off it** (2026-09-18,
  `XG` and its subclasses in Obsidian 1.14.2's `app.js`). `Value.type` is the static Obsidian assigns per
  class; `obsidian.d.ts` declares it on `Value` and on four subclasses, and the mock used to assign it
  nowhere, so all seventeen read as `undefined`. The names are `Any` on the base and then `Null`, `String`,
  `Number`, `Boolean`, `List`, `Object`, `RegExp`, `Date`, `Duration`, `File`, `URL`, `Link`, `Image` and
  `HTML` - fourteen classes that own one.
  - **Five value classes deliberately have NONE of their own**, and inherit the nearest name above them
    exactly as they do in Obsidian: `NotNullValue` and `PrimitiveValue` answer `Any`, `RelativeDateValue`
    answers `Date`, and `IconValue` and `TagValue` answer `String`. So does the internal `TagsListValue`,
    which answers `List`. Adding a name to any of them would be inventing one.
  - **Two names in Obsidian's own list have no class here, and that is L1 rather than a gap**: `Markdown`
    and `Error`. `obsidian.d.ts` declares neither `MarkdownValue` nor `ErrorValue`, so neither becomes a
    `src/obsidian/` export, and their type names go with them.
  - **`Value.toString` is a STATIC on the class**, `return this.type`, so `String(StringValue)` is `'String'`
    and a subclass that declares no name of its own answers the inherited one. Neither `obsidian.d.ts` nor
    `obsidian-typings` declares it, and it is still a real Obsidian member rather than a mock-only one, so L4
    gives it its real name with no `__` suffix. It cannot move to `src/internal/` the way
    `ObjectValue.fromFrontMatter` did - a static whose whole effect is what `String(TheClass)` answers has to
    live on the class.
  - **`Value.prototype.type` is a separate accessor, and it answers the CONSTRUCTOR, not the string.** That
    is Obsidian's own oddity: `Object.defineProperty(e.prototype,"type",{get(){return this.constructor}})`,
    so the static `type` is a name and the instance `type` is a class object. The mock models both as they
    are; reconciling them would be inventing a third behavior. It reaches consumers through the strict proxy
    unchanged, because `constructor` is on the prototype chain and the trap passes it through.

- **Value comparison is Obsidian's own throughout, statics AND instances** (2026-09-17, `XG` and its
  subclasses in Obsidian 1.14.2's `app.js`). The statics answer identity first, then treat a missing value as
  equal only to another missing one - by truthiness, so an `undefined` the declared signature does not admit
  is answered rather than dereferenced - and then compare the two CLASSES before their contents.
  `looseEquals` tries strict equality first and then BOTH directions, `a.looseEquals(b) || b.looseEquals(a)`.
  - **The base instance pair answers `false`**, which is what makes the class test above load-bearing: each
    subclass's `equals` reads the other side's own fields (`other.data`, `other.time`, `other.file`) and
    never has to guard, because a value of another class cannot reach it through the static.
  - **Nine classes override, and they are Obsidian's implementations rather than approximations of them.**
    `PrimitiveValue` compares the wrapped data with `===` and loosely with `==`, so `BooleanValue(true)`
    loosely equals `NumberValue(1)` and `StringValue('1')`. `NullValue` equals every other null.
    `ObjectValue` compares key by key, `ListValue` element by element. `DateValue` compares the instant and
    whether the time is shown, and loosely drops to the day when either side hides it. `DurationValue`
    compares its seven components, and loosely compares LENGTH, so `1 month` loosely equals the 28 days it
    lasts in February. `FileValue` compares the `TFile` by IDENTITY, not by path. `UrlValue` and `LinkValue`
    weigh their display text, and a link its `sourcePath` too - so the same target written in two notes is
    two unequal links, which `looseEquals` then joins by resolving both. `DateValue`, `DurationValue`,
    `FileValue` and `LinkValue` each read a `StringValue` on the loose side, parsing it into their own type
    first.
  - **`RegExpValue` answers `false` to every comparison, its base's answer** - Obsidian gives it no override,
    so two values wrapping one pattern are unequal there and here.
  - **What this replaced was a string-form comparison on the base**, which stood in for all ten (2026-09-17,
    same read). It was wrong in ways the mock could observe: a date compared by how it PRINTS, a file by path
    rather than identity, a link with its `sourcePath` ignored, and `BooleanValue(true)` not loosely equal to
    `NumberValue(1)` because `'true'` is not `'1'`.

- **`NullValue` is a REAL singleton, and it prints `null`** (2026-09-18, `$G` in Obsidian 1.14.2's `app.js`).
  `NullValue.value` is the only way in: the constructor calls `super()` and then throws
  `Use NullValue.value instead of creating a new NullValue.` whenever `NullValue.value` is already set, which
  is Obsidian's message and Obsidian's ordering — a refused construction still fires `constructor__` and still
  assigns `icon` before it throws. The one call that gets through is the L5 `create__()` behind the
  `NullValue.value` initializer, which runs while the field is still unassigned, exactly as Obsidian's
  `NullValue.value = new NullValue()` does. The `@typescript-eslint/no-unnecessary-condition` waiver on that
  guard is the price: the field is declared non-nullable because it always is by the time a consumer can read
  it, and widening it would push an `undefined` onto every consumer that can never see one.
  - **Two things follow, and both are Obsidian's shape rather than gaps here.** `Value.equals` and
    `Value.looseEquals` answer from their identity check and never reach `NullValue.equals`, because both
    sides are necessarily the one object — `NullValue.test.ts` calls the override directly and says so, so the
    coverage is not quietly lost. And a mock that wants a null uses `NullValue.value`; `new NullValue()` in a
    consumer's test now throws.
  - **`toString()` answers `'null'`, not the empty string it used to.** The old doc asserted the empty string
    as intended behavior, so the claim was wrong as well as the answer. It is read further than it looks:
    `ListValue.join` — and through it `ListValue.toString` — writes it into the joined text, and
    `ListValue.unique` buckets by it, so `[null, 'a', undefined]` joins as `null|a|null` and uniques to one
    null rather than to an empty-string bucket.
  - **`BasesViewConfig.getEvaluatedFormula` was a third site of the same defect**: it built a fresh
    `NullValue` where Obsidian returns `$G.value` on each of its four non-evaluating paths (a missing key, a
    non-string value, a formula that parses to an error, a formula that throws). It now returns the singleton,
    which the guard would have forced anyway.
  - `NullValue.renderTo` DOES override, and has to: the base renders `setText(this.toString())`, so without
    the override every empty cell would show the word `null`. This bullet used to say the opposite, back when
    the mock's base rendered nothing; see the `renderTo` note below.

- **Every Bases value RENDERS now, and the render context builds the links** (2026-09-18, `XG` and the value
  region of Obsidian 1.14.2's `app.js`). `Value.renderTo` used to be a no-op on the base and on all sixteen
  subclasses, and the base's doc asserted that as intended. Obsidian has seventeen bodies: the base writes
  `el.setText(this.toString())`, and sixteen subclasses override it. Fourteen of those sixteen have a mock
  class, and all fourteen now carry Obsidian's own body.
  - **The base is the load-bearing change.** Giving it a real body changes what every subclass WITHOUT an
    override renders at once — `NotNullValue`, `PrimitiveValue`, `ObjectValue`, `DurationValue` and
    `RegExpValue` now render their string form, which is exactly what they do in the app, and none of them
    gets an override here because none gets one there. `NullValue` is the single subclass whose override
    renders LESS than the base, and dropping it would put the word `null` in every empty cell.
  - **Two of Obsidian's sixteen have no mock class, and that is L1 rather than a gap**: `ErrorValue` (a
    `.bases-formula-error` div with a warning icon, a message, a tooltip and click-to-copy) and
    `MarkdownValue`. `obsidian.d.ts` declares neither class, the same reason AGENTS.md already gives for
    their two type NAMES being absent.
  - **What each of the fourteen renders.** `StringValue` writes `data` rather than `toString()` — the same
    text, Obsidian's own shape. `NumberValue` writes `∞` for an infinity and the ordinary string form for
    everything else, `NaN` included. `BooleanValue` builds a DISABLED checkbox whose `checked` is set as a
    PROPERTY, so the attribute stays absent and only `inputEl.checked` answers. `DateValue` builds a disabled
    `date` / `datetime-local` input, classed `mod-date` / `mod-datetime` by its own `time` flag;
    `RelativeDateValue` replaces it with a span carrying the same class and the relative text. `ListValue`
    builds a `.value-list-container` with one `.value-list-element` span per item and a `.value-list-gap`
    newline between each pair, rendering each item through its OWN `renderTo`, so a nested list nests a
    container. `IconValue` appends the icon its id resolves to, falling back to `question-mark-glyph`.
    `ImageValue` and `HTMLValue` are below. `TagValue`, `FileValue`, `UrlValue` and `LinkValue` do nothing but
    call the render context.
  - **`RenderContext` gained the `app` field and the three render helpers Obsidian's has** —
    `renderFileLink`, `renderExternalLink`, `renderTag` — all four real internals `obsidian-typings` declares
    and `obsidian.d.ts` omits, so per L4 they take their real names with no `__` suffix. `renderFileLink`
    builds the `span.internal-link` inside a `markdown-rendered` container, sets `data-href`, marks
    `is-unresolved`, suppresses a middle click's press default and opens the link through
    `Workspace.openLinkText` on a left or middle click. Note it resolves from the VAULT ROOT: Obsidian passes
    an empty source path, so a rendered `LinkValue` and `LinkValue.resolve` can disagree about a relative
    target.
  - **An embed size is not a label.** `renderFileLink` renders its display value into the link UNLESS the
    link resolves to an IMAGE and the display text parses as `200` or `200x100` — Obsidian's own guard, which
    is why `[[pic.png|200]]` shows the file name and `[[Note|200]]` shows `200`.
  - **Four pieces of Obsidian's wiring are deliberately NOT modeled**, each commented at its site: the
    context menus on a file link and an external link, `app.dragManager.handleDrag`, the `hover-link` trigger,
    the `window.open` click on an external link, and the global-search click on a tag. They need
    `App.dragManager`, `Workspace.handleExternalLinkContextMenu`, a translated menu label, a `window.open`
    jsdom does not have, and `App.internalPlugins` — which is unmocked ON PURPOSE (see the plugins note
    above). A rendered external link and a rendered tag are therefore inert; everything about their markup is
    Obsidian's.
  - **`App.fixFileLinks` is implemented**, because `HTMLValue.renderTo` calls it. It walks
    `img, audio, video, source, iframe`, re-prefixes a desktop `file:///` src with
    `Platform.resourcePathPrefix`, and resolves an INTERNAL src through `MetadataCache.getFirstLinkpathDest` +
    `Vault.getResourcePath` — for the first four tags only, never for an `iframe`, which Obsidian walks and
    leaves alone.
  - **`ImageValue.renderTo`'s two branches are not symmetric, and the asymmetry is Obsidian's.** An internal
    path renders an `img` only when it resolves to a file whose extension is an image one, so a path that
    resolves to nothing — or to a note — renders NO element at all; an external source always gets its `img`.
    The mock's `Vault.getResourcePath` answers `''`, so an in-vault image renders an `img` with an empty
    `src`; spy on it for a test that needs a real path.
  - **The icon registry decides what an `IconValue` renders**, not the method. `src/internal/icon-registry.ts`
    starts EMPTY by design, so both the id and the `question-mark-glyph` fallback answer `null` and nothing is
    appended unless a test called `addIcon` first. Register the fallback and every unknown icon renders it,
    exactly as in the app.
  - Three helpers moved out of `src/internal/markdown-parser.ts` into `src/internal/link-target.ts` on the way
    (`isInternalLinkTarget`, `normalizeLinkTarget`, `decodeUriSafely`), because `App.fixFileLinks` and
    `ImageValue.renderTo` became their second and third callers; `src/internal/resource-path.ts` holds the
    image-extension list and the desktop `file:///` rewrite for the same reason.

- **`RegExpValue` KEEPS its pattern, and prints it** (2026-09-18, `lK` in Obsidian 1.14.2's `app.js`).
  Obsidian's constructor is `n.icon = "lucide-regex", n.regexp = t` and its `toString()` is
  `this.regexp.toString()`. The mock used to hand the `RegExp` to `constructor3__` and drop it, answering
  `''` — and said so in its class doc, so the omission read as intended rather than as the gap it was.
  `regexp` is declared by `obsidian-typings` as `@unofficial`, which makes it a real Obsidian member: per L4
  it takes its own name with no `__` suffix, and it left
  `scripts/obsidian-typings-unimplemented.json` in the same edit.
  - **The empty string was read further than the class.** `ListValue.unique` buckets by string form, so every
    regular expression in a list shared the `''` bucket — with any `StringValue('')` beside them — and
    `ListValue.join` / `toString` wrote nothing where a pattern belonged. Each pattern now keys its own
    bucket and prints as `/abc/gi`, flags included.
  - **Comparison is untouched, deliberately.** Obsidian gives `RegExpValue` no `equals` or `looseEquals`, so
    the base's `false` stands and two values wrapping one pattern stay unequal. Storing the pattern is not a
    reason to add an override Obsidian does not have.

- **`ListValue` does its own aggregating, quirks included** (2026-09-17, `iK` in Obsidian 1.14.2's `app.js`).
  `compare`, `slice`, `reverse`, `flatten`, `sort`, `unique`, `getNumbers`, `getDates`, `earliest`, `latest`,
  `sum`, `mean`, `median`, `min`, `max` and `stddev` are all Obsidian's own, and four of their habits surprise:
  - **`getNumbers` and `getDates` read the RAW elements**, never through `get`, so nothing is converted or
    cached by asking. Only a raw number or a `NumberValue` counts as a number — a numeric string does not —
    and only a raw string, a `StringValue` (parsed with `DateValue.parseFromString`) or a `DateValue` counts as
    a date.
  - **`mean` divides by the whole list's length**, not by the count of numbers, so `[1, 2, 3, 'x']` averages
    `1.5`. **`stddev` is the POPULATION deviation.**
  - **`unique` buckets by string form in a plain object** and reads the buckets back in key order, so elements
    whose string form is an integer come first, in numeric order: `['b', 2, 'a', 1]` uniques to `1, 2, b, a`.
    It answers CONVERTED elements, where `slice` / `reverse` / `flatten` / `sort` move the elements as they are.
  - **`sort` compares two numbers numerically and anything else through Obsidian's collator** (no locale,
    base sensitivity, numeric), so case and accents do not separate two elements and `item 9` sorts before
    `item 10`.
  - **`equals` and `looseEquals` are element-wise**, built on `compare`, so `['1, 2']` does not equal
    `[1, 2]`, and `looseEquals` unwraps a ONE-element list against a non-list value: `[1]` loosely equals
    `1`, `[1, 2]` equals nothing but a list. It is also the only override whose two DIRECTIONS disagree,
    which is what the static's `b.looseEquals(a)` second try exists for.

- **A tag list is a `ListValue` SUBCLASS, and that is what makes `contains` answer for a parent tag**
  (2026-09-17, `rK` / `oK` / `aK` in Obsidian 1.14.2's `app.js`). `FileValue.getTags` and a frontmatter
  `tags` property both answer `src/internal/tags-list-value.ts`'s `TagsListValue`, not a plain list: it
  carries the `lucide-tags` icon where a list carries `lucide-list`, it wraps its elements EAGERLY where the
  base list converts one only when something reads it, and its `includes` tests each element with
  `TagValue.tagMatches` instead of `Value.looseEquals`. So a note tagged `#parent/child` satisfies
  `tags.contains("#parent")`. The declared return type stays `ListValue`, which is what `obsidian.d.ts` says
  and all `obsidian-typings` says too — neither declares the subclass, which is why it lives in
  `src/internal/` (L1).
  - **`tagMatches` runs on `#`-prefixed, lower-cased forms of BOTH sides**, so `#Parent` matches `parent`,
    and the character after the shorter tag must be the `/` that opens a nesting level — `#parenthesis`
    does not match `#parent`. The direction matters: the RECEIVER is the nested tag and the argument the
    parent. A plain `StringValue` is read as a tag too; anything else never matches.
  - **A frontmatter `tags: [null]` THROWS a `TypeError`, in Obsidian and here.** The tags branch filters
    `null` out before asking whether every element is a string, then hands the ORIGINAL array to the list,
    whose tag constructor dereferences each element. Reading that one property fails; the rest of the
    frontmatter is unaffected.

- **The three tag readers are Obsidian's own, and two of their habits catch a consumer out** (2026-09-17,
  `mg` / `yg` / `Ug` in Obsidian 1.14.2's `app.js`).
  - **`parseFrontMatterTags` reads ONLY a `tags` key, case-insensitively**, and there is no `tag` fallback —
    Obsidian never looks for one, so `tag: foo` yields nothing while `Tags: foo` yields `#foo`. It goes
    through `parseFrontMatterStringArray`, which TRIMS every entry, and then drops every entry that is empty
    and every entry holding a space, because a tag cannot contain one. So a `tags` list whose every entry is
    dropped answers an EMPTY ARRAY, while `null` means there was no `tags` entry at all, or a falsy one.
  - **`getAllTags` lists the FRONTMATTER tags first and the body tags second** — the opposite order to
    `FileValue.getTags`, which reads the body first, and both match their Obsidian counterparts. It returns
    `null` only for a falsy cache and an empty array for a cache carrying no tags, which is how a caller
    tells "no cache" from "no tags"; its parameter is widened to `CachedMetadata | null` for that reason,
    since `obsidian.d.ts` declares it non-nullable while `MetadataCache.getFileCache` really does answer
    `null`. It never deduplicates: a tag in both the frontmatter and the body appears twice.

- **The rest of the `parseFrontMatter*` family reads exactly what Obsidian's own does, and three of its
  habits catch a consumer out** (2026-09-18, `vg` / `mg` / `gg` in Obsidian 1.14.2's `app.js`).
  - **`parseFrontMatterAliases` reads ONLY an `aliases` key, case-insensitively**, and there is no `alias`
    fallback — the same defect the tag reader had, and Obsidian looks for one no more here than there, so
    `alias: foo` yields nothing while `Aliases: foo` yields `foo`. It goes through
    `parseFrontMatterStringArray` too, so every alias is TRIMMED, and then drops every entry that is empty
    once trimmed. A list whose every entry is dropped answers an EMPTY ARRAY; `null` means there was no
    `aliases` entry at all, or one that is neither a string nor a list. Unlike the tag reader it keeps an
    alias holding a space, which is a perfectly good alias.
  - **`parseFrontMatterStringArray` answers `null` for any FALSY entry**, before it ever looks at the
    entry's type — so `aliases: ''` and `tags: ''` are `null`, not `['']` and not `[]`. An entry-less list
    is not falsy and still answers `[]`.
  - **`parseFrontMatterEntry` only reads an OWN key, and returns what is stored verbatim.** It guards with
    `Object.hasOwn`, so `parseFrontMatterEntry(fm, 'toString')` answers `null` rather than the prototype's
    method, and a key explicitly present holding `undefined` reads as `undefined` rather than `null` — the
    one way a caller can tell a key that is there from a key that is not.

- **`MetadataCache.iterateRefsForFile` is implemented, in the shape Obsidian has** (2026-09-17, `app.js:101047`
  and its helper at `47201` in Obsidian 1.14.2, prettified). The `obsidian-typings` augmentation used to say
  `iterateRefsForFile(path: string, callback: (reference: ReferenceCache) => void): void`, wrong on all three
  counts; since `@obsidian-typings/obsidian-public-1.13.7` 1.11.0 (through `obsidian-typings` 6.38.0,
  2026-09-24) it declares the shape below, and `FileManager.iterateAllRefs` — which had no runtime
  implementation — is gone from it. Obsidian takes a **`TFile`** — it reads `file.extension` to look up `this.linkUpdaters[...]` and passes
  `file.path` on — the callback is a **predicate** whose `true` stops the walk, and it receives the file's
  **frontmatter links first**, which are `FrontmatterLinkCache extends Reference` and carry no `position`, so
  they are not `ReferenceCache` at all. The mock implements what Obsidian has (L4), so the settled shape is
  `iterateRefsForFile(file: TFile, callback: (reference: Reference) => MaybeReturn<boolean>): void`, which the
  declaration now matches. The conformance test compares member NAMES only, so it never saw the old mismatch.
  - **The `linkUpdaters` branch is unreachable here, permanently.** Obsidian hands the whole walk to the
    updater registered for the file's extension and reads the metadata cache only as a fallback; this package
    has no such registry and nothing registers one, so every file — `.canvas` included — is walked through its
    cached metadata. That is the only behavior available, not a gap waiting to be filled.
  - **`MetadataCache.isSupportedFile(file)` is Obsidian's own view-registry question** (2026-09-24, read in
    Obsidian 1.14.x's `app.js`): the vault's `showUnsupportedFiles` setting, or else
    `viewRegistry.isExtensionRegistered(file.extension)`. It is the per-file gate of Obsidian's `getLinkSuggestions` walk. Since the mock registry holds
    only the Markdown view, a `.canvas`, image or PDF file answers `false` until a test registers a view for its
    extension, which is the honest answer for a vault with no such view, not a gap.
  - **`FileValue.getLinks` is now the one-line walk Obsidian writes** over that member, rather than its own
    read of `getFileCache`. Same list, same order, same memo — what changes is that the order lives in one
    place instead of being restated by each caller.
