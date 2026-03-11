import { parse } from 'yaml';

export function parseYaml(yaml: string): unknown {
  return parse(yaml) as unknown;
}
