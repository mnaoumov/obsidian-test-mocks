/**
 * @file
 *
 * Mock of Obsidian's `stringifyYaml`, backed by the `yaml` package.
 */

import { stringify } from 'yaml';

/**
 * Serializes a value as YAML.
 *
 * @param object - The value to serialize.
 * @returns The YAML text.
 */
export function stringifyYaml(object: unknown): string {
  return stringify(object);
}
