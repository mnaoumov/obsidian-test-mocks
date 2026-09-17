/**
 * @file
 *
 * Mock of Obsidian's `parseYaml`, backed by the `yaml` package.
 */

import { parse } from 'yaml';

/**
 * Parses a YAML string into a value.
 *
 * @param yaml - The YAML text.
 * @returns The parsed value.
 */
export function parseYaml(yaml: string): unknown {
  return parse(yaml) as unknown;
}
