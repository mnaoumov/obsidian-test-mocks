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
- `delegated-event-registry.ts` — WeakMap-based on/off event delegation shared by `Document.prototype` and `HTMLElement.prototype`
- `icon-registry.ts` — shared `Map<string, string>` for icon storage (addIcon, removeIcon, getIcon, etc.)
- `in-memory-adapter.ts` — in-memory filesystem base class for `FileSystemAdapter` and `CapacitorAdapter`
- `noop.ts` — `noop()` / `noopAsync()` helpers for otherwise-empty method bodies (see L2)
- `plugins.ts` — the community-plugin registry behind `App.plugins`; an `obsidian-typings` interface with no `obsidian.d.ts` class, so it lives here rather than in `src/obsidian/` (L1, L7)
- `setting-definition-renderer.ts` — renders declarative setting definitions the way Obsidian 1.13 does; drives `SettingTab.renderTab__()` / `refreshDomState()`
- `strict-proxy.ts` — `strictProxy()` mock wrapper that throws on unmocked property access (see L9)
- `types.ts` — inlined type shapes (from obsidian-typings) to avoid augmentation side effects
- `type-guards.ts` — `assert()`, `ensureNonNullable()`, and similar guards

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

## Code Conventions

- Mock files in `src/obsidian/` use PascalCase to match the original obsidian class/function names (e.g., `App.ts`, `Vault.ts`). All other files (`src/internal/`, `scripts/`) follow the global kebab-case convention. Exception: `src/internal/castTo.ts` is camelCase to mirror its exported `castTo()` function.
- `unicorn/filename-case` enforces the above, accepting all three cases (`camelCase`, `kebabCase`, `pascalCase`) because the name is dictated by the API being mocked. `sanitizeHTMLToDom.ts` is listed in the rule's `ignore` — no case can express its embedded acronym, and the file mirrors Obsidian's spelling exactly.

### Linting

The ESLint config (`scripts/eslint-config.ts`) tracks `obsidian-dev-utils`' strict config, minus what is specific to a plugin shipping into the Obsidian renderer (`eslint-plugin-n`'s Node-16 floor, `eslint-plugin-obsidianmd`, jsdoc/tsdoc). It runs `eslint-plugin-unicorn`'s `recommended` on top of the tseslint/stylistic/import-x/perfectionist stack.

Two rules are scoped off where they cannot be satisfied, both for the same reason — the mock surface answers to Obsidian's names, not ours:

- `unicorn/consistent-boolean-name` is off for non-test `src/obsidian/**` and `src/globals/**`. Every boolean there is Obsidian's (`requireApiVersion`, `Array.prototype.contains`, `Object.each`, `MarkdownRenderer.supportWorker`, the `_center` / `_system` / `resetTimer` parameters).
- `unicorn/name-replacements` stays on everywhere; sites naming an Obsidian member (`EventRef`'s `ctx` / `e` / `fn`, `Vault.configDir`, `Keymap.isModEvent`, `ViewState.eState`) carry an inline disable rather than being renamed.

Reserved-word expansions are spelled `$function` / `$arguments` / `$string` rather than the rule's default `function_` / `arguments_`, so a trailing underscore never reads as the `__` mock-member suffix.

`import-x/no-nodejs-modules` is off for `scripts/` and friends (build tooling reads from disk) and for `testFiles` — a test runs under vitest in Node and is never part of the published library, so the ban has nothing to protect there. The test exemption is ported from ODU's `getNodeBuiltinsConfigs`, which scopes the same rule off for `context.testFiles`; only the `import-x` half comes across, because ODU's twin `obsidianmd/no-nodejs-modules` arrives with the plugin-directory rules this package does not register. It is what lets the two conformance tests read `obsidian.d.ts` and the checked-in typings inventory without an inline waiver at each import.

`linterOptions.reportUnusedDisableDirectives` is set to `'error'` repo-wide. ESLint's default is `'warn'`, and `npm run lint` passes no `--max-warnings 0`, so the default would let a waiver that has stopped silencing anything sit at exit 0 — still naming a rule as the reason for the code beneath it, untruthfully. Every rule here is an error; the directives claiming to suppress them are held to the same bar.

Custom rules are vendored from `obsidian-dev-utils` into `scripts/helpers/eslint-rules/` (this project has no runtime dependency on it). Their tests run as part of `npm test` and need `tsconfig.eslint-test.json` for the type-aware ones.

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

- **Guides** — hand-written, in `docs/src/content/docs/guides/`. They are the README's overflow: per G59
  the top-level `README.md` stays a concise overview + navigation, and everything longer lives here.
  OTM is a library, not a plugin, so `docs/` is the correct destination (the demo-vault carve-out in
  G102 does not apply).
- **API reference** — GENERATED from this repo's own TSDoc by `scripts/docs-gen/generate-api-docs.ts`
  (ts-morph) into `docs/src/content/docs/api/`, plus `docs/src/generated-sidebar.json` which
  `astro.config.ts` reads. Both are gitignored; so are `docs/public/og` (per-page Open Graph cards
  rendered by satori + resvg) and `docs/dist`. Never hand-edit anything under `docs/src/content/docs/api`.

### The pipeline is a COPY of `obsidian-dev-utils`'

Everything under `scripts/docs-gen/`, plus `docs/src/{components,styles,assets}`, `content.config.ts`,
`route-data.ts`, `astro.config.ts` and `build-pages.yml`, was copied from `obsidian-dev-utils` (ODU) and
should be kept in copy-sync with it — the same arrangement `scripts/helpers/eslint-rules/` already has.
OTM cannot simply depend on ODU: ODU lists `obsidian-test-mocks` in its own devDependencies, so the
edge would be a cycle. Anything the copy needed from ODU's `src/script-utils/*` was re-pointed at this
repo's `scripts/helpers/*` (`execFromRoot`, `assertNever`).

Keep new divergence to the five places OTM genuinely differs:

1. **`BASE_PATH` / site title / repo URLs** — mechanical renames.
2. **`getImportStatement()` (`api-doc-text-utils.ts`)** — OTM publishes BARREL entry points, so a
   namespace does not map to a subpath the way ODU's does. `obsidian/**` becomes a named import from
   `obsidian-test-mocks/obsidian`; `globals/**` and `obsidian-typings/**` are side-effect imports of the
   matching setup entry point, because nothing there is imported by name.
3. **Member slugs (`splitMockOnlySuffix` in the same file)** — slug generation strips `_`, so `create__`
   and `create` (and `onClick__` / `onClick`) collapsed onto ONE route and one page silently overwrote
   the other. Mock-only members therefore get a `-mock` route suffix. ODU has no `__` convention and so
   has no equivalent.
4. **`EXCLUDED_DIR_SEGMENTS` (`api-doc-source-processing.ts`)** — `internal`, `jest`, `test-helpers`.
5. **The favicon** (`docs/public/favicon.svg`, byte-identical copy in `docs/src/assets/favicon.svg`) —
   OTM's own mark, NOT ODU's laptop-and-Matrix-rain one: the Obsidian gem with a dashed copy of itself
   behind it (the mock) and a green check (the passing test). It is the only file under
   `docs/src/assets/` that must never be re-synced from ODU. It feeds three places at once — Starlight's
   `favicon` option, the hero image in `docs/src/content/docs/index.mdx`, and every OG card (rasterized
   by `loadLogoDataUri()` from the `docs/public` copy) — so the two copies must stay identical.

### Type-checking and linting gaps (same as ODU's)

`scripts/docs-gen/**` is EXCLUDED from the root `tsconfig.json` (it needs `moduleResolution: bundler`
for the Astro/Starlight ESM packages, so it carries its own `scripts/docs-gen/tsconfig.json`), and
`astro.config.ts` is carved out into `tsconfig.astro.json` for the same reason. Neither is part of
`build:compile`, exactly as in ODU — so `tsc -p scripts/docs-gen/tsconfig.json` currently
reports pre-existing `exactOptionalPropertyTypes` violations in the copied code. ESLint DOES cover both
(`projectService` resolves each file's nearest tsconfig; `astro.config.ts` is pinned to
`tsconfig.astro.json` by an override that must come AFTER `getTseslintConfigs()`).

`docs/src/**/*.ts` is ignored by ESLint: those modules resolve `astro:content` and `import.meta.env`
through types Astro generates into the gitignored `docs/.astro/`, so linting them before a build reports
every Astro import as an unresolved `any`. `docs/tsconfig.json` and the Astro build validate them
instead. `docs/**` is likewise out of markdownlint's scope (Starlight's frontmatter-driven conventions,
plus the generated API markdown), and `scripts/docs-gen` is out of dprint's and cspell's — keeping the
copy byte-comparable to ODU's.

### `js-yaml` must stay on 4.x

The `js-yaml` override is pinned to `4.3.1` (recorded in `pinned-versions.json`). Astro and Starlight do
`import yaml from 'js-yaml'`, and js-yaml 5 is ESM-only with NO default export, so hoisting 5.x into
their subtree makes `astro build` die before it reads a single page. The update sweep will try to raise
it again — do not let it.

### Testing

`scripts/vitest-config.ts` runs the documentation code as its own `unit-tests:docs` project:
`environment: 'node'`, no setup files (the generator reads this repo's sources with ts-morph, so the
global `obsidian` mock would only get in the way), and a 30 s `testTimeout` because rendering an OG
image and building a ts-morph `Project` are genuinely slow. Everything else stays in `unit-tests`
(jsdom + the mock setup), which excludes the docs globs.

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

- **Attachment-path resolution is modeled end to end** (added 2026-07-28) — anything calling
  `obsidian-dev-utils`' `getAttachmentFilePath` / `getAttachmentFolderPath` / `isAtProperAttachmentPath`
  against the mocks used to die on a strict-proxy read, forcing every consumer to hand-seed the surface.
  All four are obsidian-typings internals rather than `obsidian.d.ts` members, so per L4 they live on the
  mocks under their real, un-suffixed names:
  - **`Vault.getConfig(key)` / `Vault.setConfig(key, value)`**, backed by the `config` bag. Only
    `attachmentFolderPath` carries a modeled default (`/`, Obsidian's own); every other `ConfigItem`
    reads as `undefined` until a test sets it — do NOT assume the bag mirrors Obsidian's full defaults.
  - **`Vault.getAvailablePath(basePath, extension)`** — Obsidian's de-duplicator (plain name, then a
    `" 1"` / `" 2"` suffix, …). Note ODU's own `getAvailablePath(app, path)` helper DELEGATES to this
    member, so a consumer cannot seed it by calling that helper — it would recurse until the stack blows.
  - **`Vault.getAvailablePathForAttachments(fileName, extension, file)`** — the real resolution, not a
    throwing placeholder. `/` → vault root, `./` (and `.`) → the note's own folder, `./sub` → a
    sub-folder of the note's folder, anything else → that fixed folder; the target folder is **created
    when missing** (real Obsidian does this), a `null` file resolves as a root-level note does, and the
    result runs through `getAvailablePath`. ODU only ever reads this function's `extended` member (an
    attachment-location plugin installs it) and falls back to its own resolution when absent — so the
    plain function is what a test exercises, and it now answers faithfully.
  - **`TFolder.getParentPrefix()`** — `''` for the root, `` `${path}/` `` otherwise. On the prototype,
    because folders are created by the vault as fixtures are built, never handed to the test to seed.

- **`app.plugins.getPlugin(id)` answers `null`** (added 2026-09-01) — a mock vault genuinely has no
  community plugins installed, so that is the truth about it rather than a placeholder. This matters
  beyond tidiness: `obsidian-dev-utils` reads the registry from INHERITED code (its Notebook Navigator
  menu registrar on layout ready, plus `canvas.ts`, `folder-note.ts` and
  `rename-delete-handler-component.ts`), so while `App.plugins` was unmocked a single ODU bump broke the
  same `plugin.test.ts` in roughly 28 repos at once. Every one of them hand-assigned
  `app.plugins = strictProxy({ getPlugin: () => null })`; they no longer need to.
  - **`app.plugins.registerPlugin__(id, plugin)`** seeds one, and `unregisterPlugin__(id)` removes it.
    The instance can be a full `Plugin` mock via `asOriginalType2__()` or any stand-in carrying the
    members under test (`{ api }`, `{ settings }`) — which is what ODU's call sites actually read.
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
    them; `G101` mandates `settingEx` instead); there is no keyed reconciliation, so each `renderTab__()`
    rebuilds; group search inputs and the `list` add/delete/reorder affordances are absent (a `list` renders as
    a group); and a `page` renders as its own name/desc row without navigation — render its `items` by passing
    them in explicitly.
  - `Setting.setDisabled` still does not propagate to the components on the row (it does in real Obsidian), so
    assert the predicate, not `component.disabled`.

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
