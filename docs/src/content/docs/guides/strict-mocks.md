---
title: Strict Mocks
description: Every mock throws on unmocked property access instead of returning undefined — and how to fill the gaps.
sidebar:
    order: 5
---

Every mock instance is wrapped in a `Proxy` that throws a descriptive error when you read a property that
is not implemented, instead of silently returning `undefined`:

```text
Property "internalPlugins" is not mocked in App. To override, assign a value first: mock.internalPlugins = ...
```

This turns "the mock quietly returned `undefined` and the assertion passed for the wrong reason" into a
failure you can read.

## Overriding behavior

The strict proxy is fully override-friendly. Assign a value and subsequent reads just work:

```typescript
// Spy on an existing method
vi.spyOn(app.vault, 'read').mockResolvedValue('custom content');

// Batch-extend with Object.assign
Object.assign(app, { commands: { addCommand: vi.fn() } });
```

## Accessing unimplemented properties

Properties the mock does not implement (such as `app.internalPlugins`) throw at runtime, and you make
them available by assigning a value first:

```typescript
app.internalPlugins = { manifests: {} };
```

But `internalPlugins` is not declared in `obsidian.d.ts`, so TypeScript will not compile that assignment
on its own. The options, best to worst:

**1. Use `obsidian-typings`** (recommended) — install
[`obsidian-typings`](https://github.com/Fevol/obsidian-typings), which declares the full internal
API. The assignment compiles with no extra work. See
[Using with `obsidian-typings`](/obsidian-test-mocks/guides/obsidian-typings/).

**2. Manual module augmentation** (recommended) — declare only what you need:

```typescript
declare module 'obsidian' {
  interface App {
    internalPlugins: { manifests: Record<string, unknown> };
  }
}

app.internalPlugins = { manifests: {} };
```

**3. Cast to `Record<string, unknown>`** (less recommended) — a quick one-off escape hatch that still
catches typos in the value:

```typescript
(app as Record<string, unknown>).internalPlugins = { manifests: {} };
```

**4. `as any` / `@ts-expect-error` / `@ts-ignore`** (not recommended) — suppresses all type checking and
hides real errors:

```typescript
(app as any).internalPlugins = { manifests: {} };

// @ts-expect-error -- accessing internal API
app.internalPlugins = { manifests: {} };
```
