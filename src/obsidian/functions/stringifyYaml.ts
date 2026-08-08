import { stringify } from 'yaml';

export function stringifyYaml(object: unknown): string {
  return stringify(object);
}
