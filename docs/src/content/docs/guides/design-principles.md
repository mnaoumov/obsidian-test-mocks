---
title: Design Principles
description: The rules the mock surface is held to, and what they mean for your tests.
sidebar:
    order: 8
---

The mocks are not hand-waved stubs. Four rules govern what may exist in the package and how it must
behave — they are what makes a passing test here mean something about the real app.

## Only `obsidian.d.ts`

The core mocks expose exactly the public API — no extra classes, no internal helpers leaking into the
public surface. Anything Obsidian does not declare publicly is either mock-only (and carries the `__`
suffix) or lives in the package's private internals. The optional
[`obsidian-typings` entry points](/obsidian-test-mocks/guides/obsidian-typings/) are where the internal
API surface is bridged in, opt-in.

Every published `obsidian` release is tracked: newly introduced classes, functions and members are added,
changed signatures updated, and anything dropped from the public API removed, so the mock surface stays
an exact reflection of the current `obsidian.d.ts`.

## Meaningful implementations

Mocks carry real in-memory behavior — state tracking, callback invocation, data storage — rather than
empty stubs. The vault is a real in-memory filesystem; the metadata cache really indexes the notes you
put in it; folder renames really cascade to descendants. Empty bodies are reserved for operations with
nothing to model (pure rendering and focus work).

Where behavior was verified against a real Obsidian build and deliberately *not* modeled, that is a
documented decision rather than an oversight.

## Spyable

All instance creation routes through the `create__()` factories, so `vi.spyOn()` works everywhere — see
[Creating Mock Instances](/obsidian-test-mocks/guides/creating-mocks/). Construction itself is observable
through the `constructor__()` hooks.

## No `obsidian-typings` runtime dependency

The type shapes the mocks need are inlined rather than imported, because `obsidian-typings` augments the
`obsidian` module globally the moment it is imported. `obsidian-typings` is a dev dependency here, used
only to validate that the bridges line up with what it declares.

## Coverage

The package is tested at **100% coverage** — lines, branches, functions and statements — enforced on
every build.
