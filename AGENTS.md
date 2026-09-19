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
2. An in-memory re-check via `checkProjectTypes()` (`scripts/helpers/check-project-types.ts`) with `skipLibCheck: false`, reporting **only** diagnostics whose source file is under the project root and outside `node_modules`. It prints `Ignored N diagnostic(s) outside the validated set.` — when upstream is fixed and `N` reaches `0`, the workaround is no longer doing anything and `skipLibCheck` can go back to `false`.

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

A third is scoped off for an unrelated reason: `unicorn/no-useless-recursion` is off for `scripts/helpers/eslint-rules/no-async-callback-to-unsafe-return.ts`, where it fires on the tail call that follows a type alias. That one is a file-scoped override rather than an inline disable **on purpose** — see the shared-copy rule below.

Reserved-word expansions are spelled `$function` / `$arguments` / `$string` rather than the rule's default `function_` / `arguments_`, so a trailing underscore never reads as the `__` mock-member suffix.

`import-x/no-nodejs-modules` is off for `scripts/` and friends (build tooling reads from disk) and for `testFiles` — a test runs under vitest in Node and is never part of the published library, so the ban has nothing to protect there. The test exemption is ported from `obsidian-dev-utils`' `getNodeBuiltinsConfigs`, which scopes the same rule off for `context.testFiles`; only the `import-x` half comes across, because its twin `obsidianmd/no-nodejs-modules` arrives with the plugin-directory rules this package does not register. It is what lets the two conformance tests read `obsidian.d.ts` and the checked-in typings inventory without an inline waiver at each import.

`linterOptions.reportUnusedDisableDirectives` is set to `'error'` repo-wide. ESLint's default is `'warn'`, and `npm run lint` passes no `--max-warnings 0`, so the default would let a waiver that has stopped silencing anything sit at exit 0 — still naming a rule as the reason for the code beneath it, untruthfully. Every rule here is an error; the directives claiming to suppress them are held to the same bar.

Custom rules are vendored from `obsidian-dev-utils` into `scripts/helpers/eslint-rules/` (this project has no runtime dependency on it). Their tests run as part of `npm test` and need `tsconfig.eslint-test.json` for the type-aware ones.

**`obsidian-dev-utils`' `src/script-utils/linters/eslint-rules/` is the upstream — this repo is a consumer, not the canonical copy.** An earlier version of this paragraph claimed the sources were byte-identical across the consumers with this repo holding the original. Neither half was true: a fix is written upstream, each consumer vendors a different *subset*, and every consumer rewrites one import. So the rule that actually holds is narrower, and mechanically checkable:

**Every shared source here is byte-identical to its upstream file after exactly two deltas, applied on the way in.**

1. **The `type-guards.ts` import path.** Upstream sits three directories deeper and spells it `../../../type-guards.ts`; here it is `../type-guards.ts`. Nothing else in these files imports outside their own directory, so this is the whole of the path rewrite.
2. **An `eslint-disable` naming a plugin the consumer does not install is stripped**, and re-expressed as a file-scoped override in `scripts/eslint-config.ts`. Upstream's `no-async-callback-to-unsafe-return.ts` carries an inline `unicorn/no-useless-recursion` disable; ESLint fails the *entire* run with *"Definition for rule was not found"* on an unresolvable rule reference, so a copy that reaches a consumer without `eslint-plugin-unicorn` cannot carry it. The `unicorn/no-useless-recursion` entry above is that override. Rules every consumer has (`no-bitwise`, `@typescript-eslint/*`, `import-x/*`) are fine inline.

`obsidian-dev-utils-plugin.ts` sits outside the rule by construction: its `rules` map names exactly the subset this repo vendors, so it differs in every consumer and is maintained by hand rather than synced.

**So a sync is a transform, not a merge** — take the upstream file whole, apply the two deltas, and let `git diff` be the check. Anything it then shows is drift.

**The `eslint-plugin-unicorn` ban is a condition, not a headcount.** It applies to a consumer that does not install the plugin — which is not all of them, and the set moves. Measured 2026-09-15: `obsidian-dev-utils`, this repo, `obsidian-integration-testing` and `obsidian-typings` install it; `obsidian-typings-crawler` and `typescript-template` do not. Check before assuming, and keep the directive out regardless, since the file has to remain copyable to the consumers that cannot resolve it.

**The two deltas are now a gate rather than a recipe: `npm run check:vendored-eslint-rules`** (`scripts/check-vendored-eslint-rules.ts`, added 2026-09-19). Each delta is an entry in its `TRANSFORM_ARMS` carrying the reason it exists, and the check asserts the result is byte-identical. Record a new deliberate divergence by adding an arm, never by editing a copy and explaining it in a comment: the arm is what the next run enforces, and a comment is what let these files age apart in the first place. It reads upstream from `raw.githubusercontent.com` — the published package ships `dist/` only, so the sources are not in the tarball, and a sibling checkout would make the check pass only on a machine that has one — and `nano-staged` runs it, after `lint:fix` and `format`, on any commit that stages a vendored file. `CHECK_VENDORED_ESLINT_RULES=0` turns it off where there is no network.

**It finds the copies by NAME, not by walking a known directory, and that is the part this table kept getting wrong.** Every roster written here has been short, twice over: it named three consumers when there were five, then five when there are ten. A walk of one directory per repo reports an unlisted tree as *absent* rather than as *drifted*, which is indistinguishable from not having one.

The consumers, re-enumerated 2026-09-19 by walking `F:\dev\projects` and `E:\Dev\Work` for any file named after an upstream rule source — **eleven trees across ten repos**:

| consumer | tree | gated |
| --- | --- | --- |
| this repo | `scripts/helpers/eslint-rules/` (6 rules, incl. `prefer-noop-async`) | yes |
| `obsidian-integration-testing` | `scripts/helpers/eslint-rules/` (5) | yes |
| `obsidian-typings-crawler` | `scripts/helpers/eslint-rules/` (5) | yes |
| `obsidian-typings` | `scripts/helpers/eslint-rules/` (5) | yes |
| `obsidian-typings` | `workflow-scripts/helpers/eslint-rules/` (2) | yes — same check, one walk |
| `generator-obsidian-plugin` | `scripts/helpers/eslint-rules/` (2) | yes |
| `typescript-template` | `scripts/helpers/eslint-rules/` (6) | not yet |
| `paperio2` | `ts/scripts/helpers/eslint-rules/` (6) | not yet |
| `secret-hitler-companion` | `scripts/helpers/eslint-rules/` (6) | not yet |
| `debuggable-eval` | `scripts/helpers/eslint-rules/` (2) | not yet |
| `taocp-solutions` | `scripts/helpers/eslint-rules/` (2) | not yet |

The five not yet gated are `typescript-template` and its descendants, which sit outside this workspace; the check reaches them through that template rather than one repo at a time.

`obsidian-typings` was the outlier in every earlier version of this table — a different directory name, a `local-plugin.ts`, and a `no-used-underscore-params.ts` that was an ancestor of upstream's `no-used-underscore-variables`. It converged in 2026-09: both of its trees now use upstream's names, and both are gated.

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

### The pipeline is a COPY of `obsidian-dev-utils`'

Everything under `scripts/docs-gen/`, plus `docs/src/{components,styles,assets}`, `content.config.ts`,
`route-data.ts`, `astro.config.ts` and `build-pages.yml`, was copied from `obsidian-dev-utils` and
should be kept in copy-sync with it.
This package cannot simply depend on `obsidian-dev-utils`: that library lists `obsidian-test-mocks` in its own devDependencies, so the
edge would be a cycle. Anything the copy needed from its `src/script-utils/*` was re-pointed at this
repo's `scripts/helpers/*` (`execFromRoot`, `assertNever`).

**This is NOT the arrangement `scripts/helpers/eslint-rules/` has, and an earlier version of this
paragraph said it was.** That tree is byte-identical to upstream after two mechanical transforms, which
is what lets `check:vendored-eslint-rules` assert it. This one cannot be: the divergences below are
semantic, a transform cannot express them, and — measured 2026-09-19 — taking an upstream file whole can
now land lint-RED here. So a docs-gen sync is a read-and-merge, and the list below is what it is merged
against.

Keep new divergence to the seven places this package genuinely differs:

1. **`BASE_PATH` / site title / repo URLs** — mechanical renames.
2. **`getImportStatement()` (`api-doc-text-utils.ts`)** — this package publishes BARREL entry points, so a
   namespace does not map to a subpath the way `obsidian-dev-utils`' does. `obsidian/**` becomes a named import from
   `obsidian-test-mocks/obsidian`; `globals/**` and `obsidian-typings/**` are side-effect imports of the
   matching setup entry point, because nothing there is imported by name.
3. **Member slugs (`splitMockOnlySuffix` in the same file)** — slug generation strips `_`, so `create__`
   and `create` (and `onClick__` / `onClick`) collapsed onto ONE route and one page silently overwrote
   the other. Mock-only members therefore get a `-mock` route suffix. `obsidian-dev-utils` has no `__` convention and so
   has no equivalent.
4. **`EXCLUDED_DIR_SEGMENTS` (`api-doc-source-processing.ts`)** — `internal`, `jest`, `test-helpers`.
5. **The favicon** (`docs/public/favicon.svg`, byte-identical copy in `docs/src/assets/favicon.svg`) —
   this package's own mark, NOT `obsidian-dev-utils`' laptop-and-Matrix-rain one: the Obsidian gem with a dashed copy of itself
   behind it (the mock) and a green check (the passing test). It is the only file under
   `docs/src/assets/` that must never be re-synced from `obsidian-dev-utils`. It feeds three places at once — Starlight's
   `favicon` option, the hero image in `docs/src/content/docs/index.mdx`, and every OG card (rasterized
   by `loadLogoDataUri()` from the `docs/public` copy) — so the two copies must stay identical.
6. **The Markdown processor is Sätteri, not remark** (`astro.config.ts`,
   `scripts/docs-gen/helpers/satteri-plugins/satteri-relative-links.ts`). Astro 7.3 made Sätteri the
   default, and `markdown.remarkPlugins` now runs only on the separate `unified` processor from
   `@astrojs/markdown-remark`. This package names the Sätteri processor and carries the absolute→relative
   link rewrite as one of its mdast plugins; `obsidian-dev-utils` still installs
   `@astrojs/markdown-remark` and keeps `remark-plugins/remark-relative-links.ts`. This is the one
   divergence where THIS repo is ahead, so it travels upstream rather than being re-synced away.
7. **Rules this repo enables that `obsidian-dev-utils` turns off force local rewrites.** The config
   comparison behind `eslint-config-divergences.json` prints twelve such rules as information, because
   this copy is the stricter one there and needs no entry to be stricter. For the *copy-sync* trees that
   is not free: a file byte-identical to upstream is lint-red here. Two measured instances, 2026-09-19 —
   `unicorn/no-declarations-before-early-exit` (error here, off upstream) is why `generate-og-images.ts`
   declares `fontsDirectory` / `outputDirectory` / `manifestPath` / `faviconPath` at their use sites where
   upstream hoists all four above the first early return; and `import-x/no-default-export` (likewise) is
   why `astro.config.ts` carries an inline waiver upstream does not need. Expect more of these as the two
   configs move: when a sync makes lint red, check this class before assuming drift.

### Type-checking and linting gaps (the same ones `obsidian-dev-utils` has)

`scripts/docs-gen/**` is EXCLUDED from the root `tsconfig.json` (it needs `moduleResolution: bundler`
for the Astro/Starlight ESM packages, so it carries its own `scripts/docs-gen/tsconfig.json`), and
`astro.config.ts` is carved out into `tsconfig.astro.json` for the same reason. Neither is part of
`build:compile`, exactly as in `obsidian-dev-utils` — so `tsc -p scripts/docs-gen/tsconfig.json` currently
reports pre-existing `exactOptionalPropertyTypes` violations in the copied code. ESLint DOES cover both
(`projectService` resolves each file's nearest tsconfig; `astro.config.ts` is pinned to
`tsconfig.astro.json` by an override that must come AFTER `getTseslintConfigs()`).

`docs/src/**/*.ts` is ignored by ESLint: those modules resolve `astro:content` and `import.meta.env`
through types Astro generates into the gitignored `docs/.astro/`, so linting them before a build reports
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
- **The two adapters differ where Obsidian's do** (2026-09-17, read in Obsidian 1.14.2's `app.js`). `rmdir` of a
  missing path throws `ENOENT … lstat` on both. The desktop `FileSystemAdapter` (the one `App` uses) runs
  `fs.rm(path, { recursive })`, so `rmdir(path, false)` refuses ANY folder, an empty one included, with `EISDIR` —
  which means `vault.delete(folder)` throws unless passed `force: true`, exactly as in the app. The mobile
  `CapacitorAdapter` ignores `recursive` and always removes the whole folder. The desktop adapter also refuses to copy
  a FILE into a missing folder (`ENOENT … copyfile`), while a copied folder still gets its parents created; the mobile
  copy is native and is left creating parents.

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

- **`Platform` carries eighteen members beyond the thirteen `obsidian.d.ts` declares** (2026-09-18, read in Obsidian
  1.14.2's `app.js` — the literal at `:48126-48170`, the desktop bootstrap that fills it at `:229307-229316`). All
  eighteen are real Obsidian internals `obsidian-typings` declares as `PlatformEx`, so per L4 each takes its real name
  with no `__` suffix.
  - **`hasPhysicalKeyboard` is `true`**, the honest default beside `isDesktopApp: true`: the desktop bootstrap sets
    it, the emulate-mobile path resets it to `false`, and mobile detects it asynchronously — the `false` the app's
    own literal starts from is a pre-bootstrap placeholder no running app is observed in. **Set it to `false` to
    drive the affordances Obsidian gates on a soft keyboard**, of which `Setting.addText`'s `Enter`-blur is the one
    modeled so far; restore it afterwards, as `Keymap`'s suite does for `isMacOS`.
  - **All six `can*` members are getters**, each re-evaluating Obsidian's own derivation on every read, which is how
    Obsidian writes them too — so flipping a flag in a test moves them, instead of freezing an answer at import time.
    Restore the flag afterwards, as `Keymap`'s suite does for `isMacOS`:

    | member | derivation | flip this to move it |
    | --- | --- | --- |
    | `canPinSidebar` | `isMobile && !isPhone` | `isMobile`, `isPhone` |
    | `canExportPdf` | `isDesktopApp` | `isDesktopApp` |
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
  - The app's literal also carries `canOpenExternalFiles` (`isDesktopApp && isDesktop`), which NEITHER
    `obsidian.d.ts` nor `obsidian-typings` declares, so L1 / L4 keeps it off the surface. It wants an
    `obsidian-typings` declaration first, not a mock member — the route `Setting.setIcon` took, declared
    upstream and only then implemented here.
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

- **`MetadataCache.iterateRefsForFile` is implemented, and `obsidian-typings` declares it wrongly on all three
  counts** (2026-09-17, `app.js:101047` and its helper at `47201` in Obsidian 1.14.2, prettified). The
  augmentation says `iterateRefsForFile(path: string, callback: (reference: ReferenceCache) => void): void`.
  Obsidian takes a **`TFile`** — it reads `file.extension` to look up `this.linkUpdaters[...]` and passes
  `file.path` on — the callback is a **predicate** whose `true` stops the walk, and it receives the file's
  **frontmatter links first**, which are `FrontmatterLinkCache extends Reference` and carry no `position`, so
  they are not `ReferenceCache` at all. The mock implements what Obsidian has (L4), so the settled shape is
  `iterateRefsForFile(file: TFile, callback: (reference: Reference) => MaybeReturn<boolean>): void`, and the
  declaration is a sibling-repo fix tracked separately. The conformance test compares member NAMES, so the
  differing signature costs nothing there.
  - **The `linkUpdaters` branch is unreachable here, permanently.** Obsidian hands the whole walk to the
    updater registered for the file's extension and reads the metadata cache only as a fallback; this package
    has no such registry and nothing registers one, so every file — `.canvas` included — is walked through its
    cached metadata. That is the only behavior available, not a gap waiting to be filled.
  - **`FileValue.getLinks` is now the one-line walk Obsidian writes** over that member, rather than its own
    read of `getFileCache`. Same list, same order, same memo — what changes is that the order lives in one
    place instead of being restated by each caller.
