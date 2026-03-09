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

1. **Only expose what `obsidian.d.ts` defines.** The package must mock exactly the public API — no extra classes, no internal helpers in the public surface. Anything not in `obsidian.d.ts` belongs in `src/internal/`.

2. **Meaningful implementations, not noops.** Mocks should have real in-memory behavior (state tracking, callback invocation, data storage). Use noop/empty bodies only for pure UI operations that have no observable side effects (e.g., rendering, focus). Even those should be empty function bodies `(): void => {}`, not calls to a `noop()` helper.

3. **No `obsidian-typings` imports in `src/obsidian/`.** The `obsidian-typings` package uses `declare module 'obsidian'` augmentation which activates globally on import. To avoid side effects, all needed type shapes are inlined in `src/internal/Types.ts`.

4. **`__` suffix for mock-only public members.** Any public member (field, method, static) that does not exist in `obsidian.d.ts` must end with `__` to signal it is mock-only. This includes factory methods (`create__()`), type bridges (`asOriginalType__()`), test helpers (`simulateClick__()`), and internal tracking fields (`_items__`, `_cache__`). Members that exist in `obsidian.d.ts` must NOT have the `__` suffix.

5. **`create__()` factory pattern.** All mock classes have a static `create__()` factory method, regardless of whether the constructor is public in `obsidian.d.ts`. For classes with non-public constructors, the actual constructor is `protected`. This ensures all instance creation is spyable via `vi.spyOn(ClassName, 'create__')`. Internal code must always use `create__()` instead of `new` (except inside `create__()` itself). `super()` calls in subclass constructors are the only acceptable direct constructor invocations.

6. **`castTo<T>()` for type bridging.** When mock types need to satisfy obsidian's type system (e.g., `EventRef.e` expects `obsidian.Events`), use `castTo<ObsidianType>(this)` from `src/internal/Cast.ts`. Every mock class exposes `asOriginalType__()` which returns the instance typed as its original obsidian counterpart (e.g., `App` → `import('obsidian').App`). The import alias convention is `XxxOriginal` (e.g., `import type { App as AppOriginal } from 'obsidian'`).

7. **`DataAdapter` is an interface.** In `obsidian.d.ts`, `DataAdapter` is an interface, not a class. `FileSystemAdapter` and `CapacitorAdapter` implement it. The shared in-memory filesystem lives in `src/internal/InMemoryAdapter.ts`.

8. **Private fields that shadow obsidian-typings.** When `obsidian-typings` declares a field as public (e.g., `Events._`) but `obsidian.d.ts` does not, our mock keeps it private and uses `castTo` where needed for type compatibility.

### Internal Modules

- `Cast.ts` — `castTo<T>()` utility for unsafe type bridging
- `DelegatedEventRegistry.ts` — WeakMap-based on/off event delegation shared by `Document.prototype` and `HTMLElement.prototype`
- `IconRegistry.ts` — shared `Map<string, string>` for icon storage (addIcon, removeIcon, getIcon, etc.)
- `InMemoryAdapter.ts` — in-memory filesystem base class for `FileSystemAdapter` and `CapacitorAdapter`
- `Types.ts` — inlined type shapes (from obsidian-typings) to avoid augmentation side effects
- `TypeGuards.ts` — `ensureNonNullable()` and similar guards

## TypeScript

- Extends `@tsconfig/strictest`
- Target: ES2024, Module: NodeNext

## Testing

- The project aims for 100% test coverage.
- Test files: `__tests__/[ModulePath].test.ts` (mirrors `src/` structure)
- Vitest with explicit imports (globals: false) — always import `describe`, `it`, `expect`, etc. from `'vitest'`
- Coverage provider: v8

## Code Conventions

- Mock files in `src/obsidian/` use PascalCase to match the original obsidian class/function names (e.g., `App.ts`, `Vault.ts`). All other files (`src/internal/`, `scripts/`, `__tests__/`) follow the global kebab-case convention.
