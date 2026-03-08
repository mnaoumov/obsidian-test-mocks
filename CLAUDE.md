# CLAUDE.md

## Project Overview

`obsidian-test-mocks` is a standalone npm package providing comprehensive test mocks for the Obsidian plugin API. It publishes as a dual-format (ESM + CJS) package with three entry points: `obsidian`, `obsidian-typings/implementations`, and `globals`.

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
- `src/obsidian-typings/implementations/` — mocks for `obsidian-typings` implementations
- `src/globals/` — prototype extensions Obsidian adds to DOM/JS builtins (HTMLElement, Document, Array, String, etc.)
- `src/internal/` — shared implementation details NOT exported from the package

### Key Design Decisions

1. **Only expose what `obsidian.d.ts` defines.** The package must mock exactly the public API — no extra classes, no internal helpers in the public surface. Anything not in `obsidian.d.ts` belongs in `src/internal/`.

2. **Meaningful implementations, not noops.** Mocks should have real in-memory behavior (state tracking, callback invocation, data storage). Use noop/empty bodies only for pure UI operations that have no observable side effects (e.g., rendering, focus). Even those should be empty function bodies `(): void => {}`, not calls to a `noop()` helper.

3. **No `obsidian-typings` imports in `src/obsidian/`.** The `obsidian-typings` package uses `declare module 'obsidian'` augmentation which activates globally on import. To avoid side effects, all needed type shapes are inlined in `src/internal/Types.ts`. The `src/obsidian-typings/` subpath may still use `obsidian-typings` as a peer dependency.

4. **`__create()` factory pattern.** Classes whose constructors are not public in `obsidian.d.ts` use a static `__create()` factory method. The `__` prefix signals this is not part of the real obsidian API. The actual constructor is `protected`. This ensures all instance creation is spyable via `vi.spyOn(ClassName, '__create')`. Internal code must always use `__create()` instead of `new` (except inside `__create()` itself). `super()` calls in subclass constructors are the only acceptable direct constructor invocations.

5. **`castTo<T>()` for type bridging.** When mock types need to satisfy obsidian's type system (e.g., `EventRef.e` expects `obsidian.Events`), use `castTo<ObsidianType>(this)` from `src/internal/Cast.ts`.

6. **`DataAdapter` is an interface.** In `obsidian.d.ts`, `DataAdapter` is an interface, not a class. `FileSystemAdapter` and `CapacitorAdapter` implement it. The shared in-memory filesystem lives in `src/internal/InMemoryAdapter.ts`.

7. **Unused parameters get `_` prefix; used ones do not.** If a parameter is referenced in the function body, it must NOT have the `_` prefix, even if the implementation is minimal.

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
