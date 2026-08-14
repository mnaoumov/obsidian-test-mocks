/**
 * @file
 *
 * Shared types for the API reference components.
 *
 * obsidian-test-mocks has no official/unofficial axis to render — a member is either part of
 * `obsidian.d.ts` or mock-only, and the `__` suffix already says which (L4 in `AGENTS.md`) — so there
 * is no `ApiStatus` enum here. This module is kept as the shared home for cross-component API types.
 */

/**
A rendered API parameter.
 */
export interface ParameterInfo {
  description: string;
  name: string;
  type: string;
}
