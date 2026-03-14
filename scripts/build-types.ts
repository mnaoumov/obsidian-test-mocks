import {
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync
} from 'node:fs';
import {
  readFile,
  writeFile
} from 'node:fs/promises';
import {
  dirname,
  join,
  relative
} from 'node:path';

import { execFromRoot } from './helpers/exec.ts';

const ESM_DIR = 'dist/lib/esm';
const CJS_DIR = 'dist/lib/cjs';
const OBSIDIAN_DTS = 'node_modules/obsidian/obsidian.d.ts';

interface ExtractResult {
  cleaned: string;
  typeNames: string[];
}

function collectExportedValueNames(dtsContent: string): Set<string> {
  const names = new Set<string>();
  const pattern = /^export (?:abstract )?(?:class|enum|function|const) (?<name>\w+)/gm;
  let match: null | RegExpExecArray;
  while ((match = pattern.exec(dtsContent)) !== null) {
    const name = match.groups?.['name'];
    if (name) {
      names.add(name);
    }
  }
  return names;
}

function collectFiles(dir: string, ext: string): string[] {
  const result: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      result.push(...collectFiles(full, ext));
    } else if (full.endsWith(ext)) {
      result.push(full);
    }
  }
  return result;
}

function countBraces(line: string): number {
  let count = 0;
  for (const ch of line) {
    if (ch === '{') {
      count++;
    } else if (ch === '}') {
      count--;
    }
  }
  return count;
}

function ensureTrailingNewline(content: string): string {
  return content.endsWith('\n') ? content : `${content}\n`;
}

function extractObsidianReExportNames(content: string): ExtractResult {
  const typeNames: string[] = [];
  const pattern = /^export type \{(?<names>[^}]*)\} from ['"]obsidian['"];?\s*\n?/gm;
  const cleaned = content.replace(pattern, (...args: unknown[]) => {
    const groups = args.at(-1) as Record<string, string>;
    const names = groups['names'] ?? '';
    for (const name of names.split(',')) {
      const trimmed = name.trim();
      if (trimmed) {
        typeNames.push(trimmed);
      }
    }
    return '';
  });
  return { cleaned, typeNames };
}

function extractTypeDeclarations(dtsContent: string, typeNames: Set<string>): string {
  const lines = dtsContent.split('\n');
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line === undefined) {
      i++;
      continue;
    }

    // Match export type or export interface declarations
    const typeMatch = /^export type (?<name>\w+)/.exec(line);
    const interfaceMatch = /^export interface (?<name>\w+)/.exec(line);

    if (typeMatch) {
      const name = typeMatch.groups?.['name'];
      if (name && typeNames.has(name)) {
        // Type aliases may span multiple lines if they contain `{`
        const block: string[] = [line];
        const braces = countBraces(line);
        if (braces > 0) {
          // Multi-line type alias with braces — collect until balanced
          let braceDepth = braces;
          i++;
          while (i < lines.length && braceDepth > 0) {
            const nextLine = lines[i];
            if (nextLine !== undefined) {
              block.push(nextLine);
              braceDepth += countBraces(nextLine);
            }
            i++;
          }
        } else {
          i++;
        }
        result.push(block.join('\n'));
        typeNames.delete(name);
        continue;
      }
      i++;
      continue;
    }

    if (interfaceMatch) {
      const name = interfaceMatch.groups?.['name'];
      if (name && typeNames.has(name)) {
        // Collect the full interface declaration (may span multiple lines)
        const block: string[] = [line];
        let braceDepth = countBraces(line);
        i++;
        while (i < lines.length && braceDepth > 0) {
          const nextLine = lines[i];
          if (nextLine !== undefined) {
            block.push(nextLine);
            braceDepth += countBraces(nextLine);
          }
          i++;
        }
        result.push(block.join('\n'));
        typeNames.delete(name);
        continue;
      }
    }

    i++;
  }

  return `${result.join('\n')}\n`;
}

function findReferencedNames(declarations: string, valueNames: Set<string>, typeNames: string[]): string[] {
  // Also include type names that are defined in the declarations (they reference each other)
  const definedInDecl = new Set(typeNames);
  const referenced = new Set<string>();

  for (const name of valueNames) {
    // Check if this name appears as a word boundary in the declarations
    const regex = new RegExp(`\\b${name}\\b`);
    if (regex.test(declarations)) {
      referenced.add(name);
    }
  }

  // Remove any names that are defined within the declarations themselves
  for (const name of definedInDecl) {
    referenced.delete(name);
  }

  return [...referenced].sort();
}

async function generateObsidianTypeDeclarations(typeNames: string[], cjsIndexPath: string, esmIndexPath: string): Promise<void> {
  const obsidianDts = await readFile(OBSIDIAN_DTS, 'utf8');
  const typeNameSet = new Set(typeNames);
  const declarations = extractTypeDeclarations(obsidianDts, typeNameSet);

  // Find all class/enum/function/const names exported from obsidian.d.ts that are NOT types/interfaces.
  const valueNames = collectExportedValueNames(obsidianDts);
  // Find which of those are referenced in the declarations.
  const referencedValues = findReferencedNames(declarations, valueNames, typeNames);

  // Write obsidian-types files for both ESM and CJS.
  // These only contain type/interface declarations, so import type from the index is correct.
  const esmTypesPath = esmIndexPath.replace(/\.d\.mts$/, '.obsidian-types.d.mts');
  const cjsTypesPath = cjsIndexPath.replace(/\.d\.cts$/, '.obsidian-types.d.cts');

  let esmHeader = '';
  let cjsHeader = '';
  if (referencedValues.length > 0) {
    esmHeader = `import type { ${referencedValues.join(', ')} } from './index.mjs';\n`;
    cjsHeader = `import type { ${referencedValues.join(', ')} } from './index.cjs';\n`;
  }

  await writeFile(esmTypesPath, esmHeader + declarations, 'utf8');
  await writeFile(cjsTypesPath, cjsHeader + declarations, 'utf8');

  // Append re-exports from the generated types file to the index files.
  const esmIndex = await readFile(esmIndexPath, 'utf8');
  const esmTypesRelative = toForwardSlash(relative(dirname(esmIndexPath), esmTypesPath));
  await writeFile(esmIndexPath, `${ensureTrailingNewline(esmIndex)}export type * from './${esmTypesRelative}';\n`, 'utf8');

  const cjsIndex = await readFile(cjsIndexPath, 'utf8');
  const cjsTypesRelative = toForwardSlash(relative(dirname(cjsIndexPath), cjsTypesPath));
  await writeFile(cjsIndexPath, `${ensureTrailingNewline(cjsIndex)}export type * from './${cjsTypesRelative}';\n`, 'utf8');
}

async function main(): Promise<void> {
  await execFromRoot('tsc --project tsconfig.build.json');

  const dtsFiles = collectFiles(ESM_DIR, '.d.ts');

  for (const filePath of dtsFiles) {
    const normalized = toForwardSlash(filePath);
    const content = await readFile(filePath, 'utf8');

    const { cleaned, typeNames } = extractObsidianReExportNames(content);

    // Write .d.mts with .mjs import extensions (TypeScript resolves .mjs → .d.mts automatically,
    // Avoiding TS2846 "declaration file imported without import type" errors).
    const esmPath = normalized.replace(/\.d\.ts$/, '.d.mts');
    await writeFile(esmPath, rewriteImportExtensions(cleaned, '.mjs'), 'utf8');

    // Write .d.cts with .cjs import extensions (TypeScript resolves .cjs → .d.cts automatically).
    const cjsPath = normalized.replace(ESM_DIR, CJS_DIR).replace(/\.d\.ts$/, '.d.cts');
    mkdirSync(dirname(cjsPath), { recursive: true });
    await writeFile(cjsPath, rewriteImportExtensions(cleaned, '.cjs'), 'utf8');

    unlinkSync(filePath);

    if (typeNames.length > 0) {
      await generateObsidianTypeDeclarations(typeNames, cjsPath, esmPath);
    }
  }
}

function rewriteImportExtensions(content: string, targetExt: string): string {
  return content.replace(
    /(?<prefix>from\s+['"])(?<path>[^'"]*?)\.ts(?<quote>['"])/g,
    `$<prefix>$<path>${targetExt}$<quote>`
  );
}

function toForwardSlash(p: string): string {
  return p.replace(/\\/g, '/');
}

await main();
