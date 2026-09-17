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
- `html-sanitizer.ts` — the sanitizer behind `sanitizeHTMLToDom`: a port of the DOMPurify 3.0.1 passes Obsidian runs, with Obsidian's config and its two load-time hooks. `html-sanitizer-allowlists.ts` holds DOMPurify's default allowlists, copied from Obsidian's `app.js` (and excluded from cspell)
- `icon-registry.ts` — shared `Map<string, string>` for icon storage (addIcon, removeIcon, getIcon, etc.). It starts empty: Obsidian's Lucide set and its own glyphs are deliberately not bundled, so their ids resolve to nothing
- `in-memory-adapter.ts` — in-memory filesystem base class for `FileSystemAdapter` and `CapacitorAdapter`
- `lazy-evaluator.ts` — the conversion behind `ListValue.lazyEvaluator` and `ObjectValue.lazyEvaluator`: a raw element or property wrapped into a `Value`. Obsidian has ONE such function and installs it on both classes, so it lives here rather than in either of them; it has to construct the classes that call it, which is the one import cycle it carries a waiver for
- `noop.ts` — `noop()` / `noopAsync()` helpers for otherwise-empty method bodies (see L2)
- `plugins.ts` — the community-plugin registry behind `App.plugins`; an `obsidian-typings` interface with no `obsidian.d.ts` class, so it lives here rather than in `src/obsidian/` (L1, L7)
- `setting-definition-renderer.ts` — renders declarative setting definitions the way Obsidian 1.13 does; drives `SettingTab.renderTab__()` / `refreshDomState()`
- `strict-proxy.ts` — `strictProxy()` mock wrapper that throws on unmocked property access (see L9)
- `types.ts` — inlined type shapes (from obsidian-typings) to avoid augmentation side effects
- `type-guards.ts` — `assert()`, `ensureNonNullable()`, and similar guards
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

The consumers, and how far each stood from upstream on 2026-09-15:

| consumer | directory | rules vendored | state |
| --- | --- | --- | --- |
| this repo | `scripts/helpers/eslint-rules/` | 6, incl. `prefer-noop-async` | byte-identical after the two deltas |
| `obsidian-integration-testing` | `scripts/helpers/eslint-rules/` | 5 | behind by the rule-export doc comments |
| `obsidian-typings-crawler` | `scripts/helpers/eslint-rules/` | 5 | behind by the rule-export doc comments |
| `typescript-template` | `scripts/helpers/eslint-rules/` | 6, incl. `require-method-template` | two wrapped-comment continuation lines wrongly capitalized by a `capitalized-comments` autofix |
| `obsidian-typings` | `scripts/helpers/eslint/` | 3 | a different arrangement, and behind on all three |

`obsidian-typings` is the outlier on purpose-or-not: its directory, its plugin file (`local-plugin.ts`) and one rule file (`no-used-underscore-params.ts`) are named differently, it vendors no rule tests, and its `no-used-underscore-params` is an ancestor of upstream's `no-used-underscore-variables` that still checks parameters only — upstream widened it to local variables and renamed it to match. Converging it is that repo's own work, not this one's.

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
should be kept in copy-sync with it — the same arrangement `scripts/helpers/eslint-rules/` already has.
This package cannot simply depend on `obsidian-dev-utils`: that library lists `obsidian-test-mocks` in its own devDependencies, so the
edge would be a cycle. Anything the copy needed from its `src/script-utils/*` was re-pointed at this
repo's `scripts/helpers/*` (`execFromRoot`, `assertNever`).

Keep new divergence to the five places this package genuinely differs:

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
  a test reaches the fallback. `FileManager.trashFile` still always asks for the system trash, where Obsidian
  routes on the vault's `trashOption` config.

- **Attachment-path resolution is modeled end to end** (added 2026-07-28) — anything calling
  `obsidian-dev-utils`' `getAttachmentFilePath` / `getAttachmentFolderPath` / `isAtProperAttachmentPath`
  against the mocks used to die on a strict-proxy read, forcing every consumer to hand-seed the surface.
  All four are obsidian-typings internals rather than `obsidian.d.ts` members, so per L4 they live on the
  mocks under their real, un-suffixed names:
  - **`Vault.getConfig(key)` / `Vault.setConfig(key, value)`**, backed by the `config` bag. Only
    `attachmentFolderPath` carries a modeled default (`/`, Obsidian's own); every other `ConfigItem`
    reads as `undefined` until a test sets it — do NOT assume the bag mirrors Obsidian's full defaults.
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
  `WorkspaceLeaf.canNavigate()` reads `view.navigation` — a leaf with no view stands for Obsidian's empty view,
  which navigates); `getLeavesOfType` / `detachLeavesOfType` match on the view's type through the mock-only
  `WorkspaceLeaf.getViewType__()` (the open view's `getViewType()`, else the stored view state's type, else
  `'empty'`) rather than on `getViewState().type`, so a fresh leaf answers `getLeavesOfType('empty')`; and
  `WorkspaceItem.dimension` / `setDimension` model the flex-grow share Obsidian divides on `createLeafInParent`,
  `splitLeaf` and the single-child promotion in `removeChild`, and clears in `moveLeafToPopout`.

  **Two departures kept on purpose.** `createLeafInTabGroup` always creates, where Obsidian hands back a tab already
  showing the empty view — a mock leaf holds no view, so it cannot be told from one showing a file. And it falls
  back to the root tab group where Obsidian throws `No tab group found.`, so `getLeaf('tab')` works on a workspace
  no test has populated.

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
