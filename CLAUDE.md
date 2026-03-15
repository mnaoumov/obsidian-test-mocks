# CLAUDE.md

## Project Overview

`obsidian-test-mocks` is a standalone npm package providing comprehensive test mocks for the Obsidian plugin API. It publishes as a dual-format (ESM + CJS) package with three entry points: `obsidian`, `globals`, and `helpers`.

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
- `src/globals/` — prototype extensions Obsidian adds to DOM/JS builtins (HTMLElement, Document, Array, String, etc.)
- `src/internal/` — shared implementation details NOT exported from the package

### Key Design Decisions

L1. **Only expose what `obsidian.d.ts` defines.** The package must mock exactly the public API — no extra classes, no internal helpers in the public surface. Anything not in `obsidian.d.ts` belongs in `src/internal/`.

L2. **Meaningful implementations first.** Mocks should have real in-memory behavior (state tracking, callback invocation, data storage). Only use `noop()` (sync) or `await noopAsync()` (async) from `src/internal/noop.ts` for methods whose bodies would otherwise be completely empty (pure UI operations with no meaningful implementation, e.g., rendering, focus). If a method already has any logic in its body, do not add `noop()` or `await noopAsync()` — they are only for otherwise-empty methods.

L3. **No `obsidian-typings` imports in `src/obsidian/`.** The `obsidian-typings` package uses `declare module 'obsidian'` augmentation which activates globally on import. To avoid side effects, all needed type shapes are inlined in `src/internal/Types.ts`.

L4. **`__` suffix for mock-only public members.** Any public member (field, method, static) that does not exist in `obsidian.d.ts` must end with `__` to signal it is mock-only. This includes factory methods (`create__()`), type bridges (`asOriginalType__()`), test helpers (`simulateClick__()`), and internal tracking fields (`_items__`, `_cache__`). Members that exist in `obsidian.d.ts` must NOT have the `__` suffix.

L5. **`create__()` factory pattern.** All mock classes have a static `create__()` factory method, regardless of whether the constructor is public in `obsidian.d.ts`. For classes with non-public constructors, the actual constructor is `protected`. This ensures all instance creation is spyable via `vi.spyOn(ClassName, 'create__')`. Internal code must always use `create__()` instead of `new` (except inside `create__()` itself). `super()` calls in subclass constructors are the only acceptable direct constructor invocations. When a subclass `create__()` has an incompatible signature with the base class, use `create2__()`, `create3__()`, etc. to avoid TypeScript static-side conflicts. Do NOT use `override` on `create__()` — use numbered variants instead.

L6. **`castTo<T>()` for type bridging** (intentionally overrides G10e). When mock types need to satisfy obsidian's type system (e.g., `EventRef.e` expects `obsidian.Events`), use `castTo<ObsidianType>(this)` from `src/internal/cast.ts`. Every mock class exposes `asOriginalType__()` (instance method, mock → real type) and `fromOriginalType__()` (static method, real → mock type). The import alias convention is `XxxOriginal` (e.g., `import type { App as AppOriginal } from 'obsidian'`). When a subclass `fromOriginalType__()` has an incompatible static signature with the base class (e.g., generic → non-generic), use numbered variants (`fromOriginalType2__()`, `fromOriginalType3__()`, etc.) following the same convention as L5.

L7. **`DataAdapter` is an interface.** In `obsidian.d.ts`, `DataAdapter` is an interface, not a class. `FileSystemAdapter` and `CapacitorAdapter` implement it. The shared in-memory filesystem lives in `src/internal/InMemoryAdapter.ts`.

L8. **Private fields that shadow obsidian-typings.** When `obsidian-typings` declares a field as public (e.g., `Events._`) but `obsidian.d.ts` does not, our mock keeps it private and uses `castTo` where needed for type compatibility.

L9. **`strictMock` constructors with `constructor__()` hooks.** Every mock class (including abstract classes) must use `strictMock(this)` in its constructor and provide a spyable `constructorN__()` method. The pattern is: `constructor(args) { /* init */ const self = strictMock(this); self.constructorN__(args); return self; }` with a corresponding `public constructorN__(_args): void { noop(); }`. The `strictMock()` call prevents access to unmocked properties. The `constructorN__()` method enables spying on construction via `vi.spyOn(Class.prototype, 'constructorN__')`. Numbering follows inheritance depth: a root class uses `constructor__()`, its child uses `constructor2__()`, grandchild `constructor3__()`, etc. — each class in the chain gets the next available number.

L10. **Never `override` a `__` method — always use numbered variants.** Any mock-only method ending with `__` must never use the `override` keyword. Instead, each subclass increments the numeric suffix: `methodName__()` → `methodName2__()` → `methodName3__()`, etc. This applies to all `__` methods: `create__`, `constructor__`, `asOriginalType__`, `fromOriginalType__`, and any future mock-only methods. The inherited base method remains callable at any level, returning the parent type.

### Internal Modules

- `cast.ts` — `castTo<T>()` utility for unsafe type bridging
- `delegated-event-registry.ts` — WeakMap-based on/off event delegation shared by `Document.prototype` and `HTMLElement.prototype`
- `icon-registry.ts` — shared `Map<string, string>` for icon storage (addIcon, removeIcon, getIcon, etc.)
- `in-memory-adapter.ts` — in-memory filesystem base class for `FileSystemAdapter` and `CapacitorAdapter`
- `types.ts` — inlined type shapes (from obsidian-typings) to avoid augmentation side effects
- `type-guards.ts` — `assert()`, `ensureNonNullable()`, and similar guards

## TypeScript

- Extends `@tsconfig/strictest`
- Target: ES2024, Module: NodeNext

## Testing

- The project aims for 100% test coverage.
- Test files are co-located with source files: `src/obsidian/App.test.ts` tests `src/obsidian/App.ts`.
- Vitest with explicit imports (globals: false) — always import `describe`, `it`, `expect`, etc. from `'vitest'`
- Coverage provider: v8

## Code Conventions

- Mock files in `src/obsidian/` use PascalCase to match the original obsidian class/function names (e.g., `App.ts`, `Vault.ts`). All other files (`src/internal/`, `scripts/`) follow the global kebab-case convention.
