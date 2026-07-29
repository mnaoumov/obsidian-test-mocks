# AGENTS.md

## Project Overview

`obsidian-test-mocks` is a standalone npm package providing comprehensive test mocks for the Obsidian plugin API. It publishes as a dual-format (ESM + CJS) package with seven entry points: `obsidian`, `setup`, `vitest-setup`, `jest-setup`, `obsidian-typings/setup`, `obsidian-typings/vitest-setup`, and `obsidian-typings/jest-setup`.

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
- `npm run build:compile:typescript` — TypeScript type-check only
- `npm run version` — run build (used as npm version hook)

## Architecture

### Directory Structure

- `src/obsidian/` — mocks for every class/function in `obsidian.d.ts`
- `src/obsidian-typings/` — optional bridges mapping obsidian-typings internal property names to mock `__`-suffixed members
- `src/globals/` — prototype extensions Obsidian adds to DOM/JS builtins (HTMLElement, Document, Array, String, etc.)
- `src/internal/` — shared implementation details NOT exported from the package

### Key Design Decisions

L1. **Only expose what `obsidian.d.ts` defines.** The package must mock exactly the public API — no extra classes, no internal helpers in the public surface. Anything not in `obsidian.d.ts` belongs in `src/internal/`.

L2. **Meaningful implementations first.** Mocks should have real in-memory behavior (state tracking, callback invocation, data storage). Only use `noop()` (sync) or `await noopAsync()` (async) from `src/internal/noop.ts` for methods whose bodies would otherwise be completely empty (pure UI operations with no meaningful implementation, e.g., rendering, focus). If a method already has any logic in its body, do not add `noop()` or `await noopAsync()` — they are only for otherwise-empty methods.

L3. **No `obsidian-typings` imports in `src/obsidian/`.** The `obsidian-typings` package uses `declare module 'obsidian'` augmentation which activates globally on import. To avoid side effects, all needed type shapes are inlined in `src/internal/types.ts`. The `src/obsidian-typings/` directory is exempt from this rule — it may import obsidian-typings types for validation (via `type-validation.test.ts`, excluded from the main tsconfig).

L4. **`__` suffix for mock-only public members.** Any public member (field, method, static) that does not exist in `obsidian.d.ts` must end with `__` to signal it is mock-only. This includes factory methods (`create__()`), type bridges (`asOriginalType__()`), test helpers (`simulateClick__()`), and internal tracking fields (`_items__`, `_cache__`). Members that exist in `obsidian.d.ts` must NOT have the `__` suffix.

L5. **`create__()` factory pattern.** All mock classes have a static `create__()` factory method, regardless of whether the constructor is public in `obsidian.d.ts`. For classes with non-public constructors, the actual constructor is `protected`. This ensures all instance creation is spyable via `vi.spyOn(ClassName, 'create__')`. Internal code must always use `create__()` instead of `new` (except inside `create__()` itself). `super()` calls in subclass constructors are the only acceptable direct constructor invocations. When a subclass `create__()` has an incompatible signature with the base class, use `create2__()`, `create3__()`, etc. to avoid TypeScript static-side conflicts. Do NOT use `override` on `create__()` — use numbered variants instead.

L6. **`castTo<T>()` for type bridging** (intentionally allows `as unknown as T` casts). When mock types need to satisfy obsidian's type system (e.g., `EventRef.e` expects `obsidian.Events`), use `castTo<ObsidianType>(this)` from `src/internal/castTo.ts`. Every mock class exposes `asOriginalType__()` (instance method, mock → real type) and `fromOriginalType__()` (static method, real → mock type). The import alias convention is `XxxOriginal` (e.g., `import type { App as AppOriginal } from 'obsidian'`). When a subclass `fromOriginalType__()` has an incompatible static signature with the base class (e.g., generic → non-generic), use numbered variants (`fromOriginalType2__()`, `fromOriginalType3__()`, etc.) following the same convention as L5.

L7. **`DataAdapter` is an interface.** In `obsidian.d.ts`, `DataAdapter` is an interface, not a class. `FileSystemAdapter` and `CapacitorAdapter` implement it. The shared in-memory filesystem lives in `src/internal/in-memory-adapter.ts`.

L8. **Private fields that shadow obsidian-typings.** When `obsidian-typings` declares a field as public (e.g., `Events._`) but `obsidian.d.ts` does not, our mock keeps it private and uses `castTo` where needed for type compatibility.

L9. **`strictProxy` constructors with `constructor__()` hooks.** Every mock class (including abstract classes) must use `strictProxy(this)` in its constructor and provide a spyable `constructorN__()` method. The pattern is: `constructor(args) { /* init */ const self = strictProxy(this); self.constructorN__(args); return self; }` with a corresponding `public constructorN__(_args): void { noop(); }`. The `strictProxy()` call prevents access to unmocked properties. The `constructorN__()` method enables spying on construction via `vi.spyOn(Class.prototype, 'constructorN__')`. Numbering follows inheritance depth: a root class uses `constructor__()`, its child uses `constructor2__()`, grandchild `constructor3__()`, etc. — each class in the chain gets the next available number.

L10. **Never `override` a `__` method — always use numbered variants.** Any mock-only method ending with `__` must never use the `override` keyword. Instead, each subclass increments the numeric suffix: `methodName__()` → `methodName2__()` → `methodName3__()`, etc. This applies to all `__` methods: `create__`, `constructor__`, `asOriginalType__`, `fromOriginalType__`, and any future mock-only methods. The inherited base method remains callable at any level, returning the parent type.

L11. **Track every new `obsidian` release.** Whenever a new `obsidian` package is published, update this project so the mocks fully match the latest `obsidian.d.ts` public API — add mocks for newly introduced classes/functions/members, update changed signatures, and remove anything dropped from the public API. The mock surface must stay an exact, current reflection of `obsidian.d.ts` (consistent with L1 and L4): nothing in `obsidian.d.ts` may be left unmocked, and no mock-only addition may masquerade as public API (mock-only members keep the `__` suffix). Bump the `obsidian` devDependency/peerDependency range to cover the new version as part of the same change.

### Internal Modules

- `castTo.ts` — `castTo<T>()` utility for unsafe type bridging
- `delegated-event-registry.ts` — WeakMap-based on/off event delegation shared by `Document.prototype` and `HTMLElement.prototype`
- `icon-registry.ts` — shared `Map<string, string>` for icon storage (addIcon, removeIcon, getIcon, etc.)
- `in-memory-adapter.ts` — in-memory filesystem base class for `FileSystemAdapter` and `CapacitorAdapter`
- `noop.ts` — `noop()` / `noopAsync()` helpers for otherwise-empty method bodies (see L2)
- `strict-proxy.ts` — `strictProxy()` mock wrapper that throws on unmocked property access (see L9)
- `types.ts` — inlined type shapes (from obsidian-typings) to avoid augmentation side effects
- `type-guards.ts` — `assert()`, `ensureNonNullable()`, and similar guards

## TypeScript

- Extends `@tsconfig/strictest`
- Target: es2022, Module: node16

### Type Validation (manual `skipLibCheck` wrapper)

`tsconfig.json` sets `skipLibCheck: true`. This is a deliberate exception to the usual "never weaken `@tsconfig/strictest`" stance: it lets `tsc` type-check our `.ts` files without failing on broken upstream `.d.ts` files we do not control (e.g. a given version's `@vitest/runner` declarations, which ship optional properties that violate `exactOptionalPropertyTypes`). This replaces the old `patch-package` workaround — there is no longer a `patches/` directory or a `postinstall` hook.

The declarations we author are still fully validated. `scripts/build-compile-typescript.ts` (run by `build:compile:typescript`) does two passes:

1. `tsc --build --force` — the normal compile, with `skipLibCheck: true`.
2. An in-memory re-check via `checkProjectTypes()` (`scripts/helpers/check-project-types.ts`) with `skipLibCheck: false`, reporting **only** diagnostics whose source file is under the project root and outside `node_modules`. It prints `Ignored N diagnostic(s) outside the validated set.` — when upstream is fixed and `N` reaches `0`, the workaround is no longer doing anything and `skipLibCheck` can go back to `false`.

## Testing

- The project aims for 100% test coverage.
- Test files are co-located with source files: `src/obsidian/App.test.ts` tests `src/obsidian/App.ts`.
- Vitest with explicit imports (globals: false) — always import `describe`, `it`, `expect`, etc. from `'vitest'`
- Coverage provider: v8

## Code Conventions

- Mock files in `src/obsidian/` use PascalCase to match the original obsidian class/function names (e.g., `App.ts`, `Vault.ts`). All other files (`src/internal/`, `scripts/`) follow the global kebab-case convention. Exception: `src/internal/castTo.ts` is camelCase to mirror its exported `castTo()` function.

## Consuming notes

The modeling gaps surfaced on 2026-07-02 (while converting `obsidian-advanced-note-composer` to the
real-bridge pattern) are now closed. A few affordances worth knowing:

- **`Vault.reconcile__()` syncs the in-memory tree from the adapter.** Direct `app.vault.adapter.*`
  moves/deletes/writes do NOT update `getAbstractFileByPath`/`getFileByPath` (as in real Obsidian, whose
  watcher is async). After such an op, call `app.vault.reconcile__()` to re-scan the adapter and
  reconcile the tree (firing `create`/`delete` events). Dot-prefixed paths (e.g. `.obsidian`) are
  excluded, mirroring real Obsidian.
- **`MetadataCache` indexes synchronously** on `create`/`modify` via `Vault.readSync__`, populating
  `cache__`, `resolvedLinks`/`unresolvedLinks`, and `frontmatterLinks`, plus the obsidian-typings-bridged
  `fileCache`/`metadataCache`/`computeMetadataAsync` — so `getFileCache`, the link graph, and
  `getCacheSafe` work with no tick needed.
- **`Vault.getAvailablePath` de-duplicates**, folder renames cascade to descendants, and
  `createFolder('a/b')` creates/links intermediate ancestors.

- **Attachment-path resolution is modeled end to end** (added 2026-07-28) — anything calling
  `obsidian-dev-utils`' `getAttachmentFilePath` / `getAttachmentFolderPath` / `isAtProperAttachmentPath`
  against the mocks used to die on a strict-proxy read, forcing every consumer to hand-seed the surface.
  The backing members live on the mocks with the `__` suffix (all four are obsidian-typings internals,
  not `obsidian.d.ts` members, so the un-suffixed names come from `obsidian-typings/setup`):
  - **`Vault.getConfig__(key)` / `Vault.setConfig__(key, value)`**, backed by the `config__` bag. Only
    `attachmentFolderPath` carries a modeled default (`/`, Obsidian's own); every other `ConfigItem`
    reads as `undefined` until a test sets it — do NOT assume the bag mirrors Obsidian's full defaults.
  - **`Vault.getAvailablePath__(basePath, extension)`** — Obsidian's de-duplicator (plain name, then a
    `" 1"` / `" 2"` suffix, …). The logic moved here from the bridge, which now delegates; note ODU's own
    `getAvailablePath(app, path)` helper DELEGATES to the bridged name, so a consumer cannot seed it by
    calling that helper — it would recurse until the stack blows.
  - **`Vault.getAvailablePathForAttachments__(fileName, extension, file)`** — the real resolution, not a
    throwing placeholder. `/` → vault root, `./` (and `.`) → the note's own folder, `./sub` → a
    sub-folder of the note's folder, anything else → that fixed folder; the target folder is **created
    when missing** (real Obsidian does this), a `null` file resolves as a root-level note does, and the
    result runs through `getAvailablePath__`. ODU only ever reads this function's `extended` member (an
    attachment-location plugin installs it) and falls back to its own resolution when absent — so the
    plain function is what a test exercises, and it now answers faithfully.
  - **`TFolder.getParentPrefix__()`** — `''` for the root, `` `${path}/` `` otherwise. On the prototype,
    because folders are created by the vault as fixtures are built, never handed to the test to seed.

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
  `setSubmenu` nor `submenu` is in `obsidian.d.ts`), so the un-suffixed names come from
  `obsidian-typings/setup`; the backing members are `MenuItem.setSubmenu__()` and
  `MenuItem.submenu__`. `setSubmenu__()` **memoizes** — it creates the `Menu` on first call and
  returns that same instance afterwards, mirroring real Obsidian's `this.submenu || (…)` — and
  records it in `submenu__`, so a test can read back the items the plugin added to the submenu
  (`item.submenu__?.items__`). Previously it built a fresh `Menu` and threw it away. The real
  implementation's DOM side effects (the `has-submenu` class and the `menu-item-icon mod-submenu`
  chevron) are NOT modeled — `MenuItem` has no `dom__`.

- **`SuggestModal`'s instruction bar is modeled**, so consumers can drive the real
  `SuggestModalCommandBuilder` (`obsidian-dev-utils` `obsidian/modals/suggest-modal-command-builder`)
  instead of hand-rolling a fake. `instructionsEl` is an obsidian-typings-only internal (not in
  `obsidian.d.ts`) — it is a getter bridged (via `obsidian-typings/setup`) to the `__`-suffixed
  backing member `SuggestModal.instructionsEl__`, a real `createDiv('prompt-instructions')` container
  created in the constructor. `setInstructions(instructions)` renders faithfully to real Obsidian:
  when non-empty it clears the container and appends one `.prompt-instruction` div per `Instruction`
  whose **first** span (`.prompt-instruction-command`) holds `command` and **second** span holds
  `purpose`, then attaches the container to `modalEl`; when empty it detaches the container. The
  builder queries `.prompt-instruction > span:nth-child(2)` (the purpose span) to inject
  checkbox/dropdown inputs and registers option-toggle shortcuts on the (already-modeled) `modal.scope`.
