import type {
  DataWriteOptions as DataWriteOptionsOriginal,
  FileManager as FileManagerOriginal
} from 'obsidian';

import type { App } from './App.ts';
import type { TAbstractFile } from './TAbstractFile.ts';
import type { TFile } from './TFile.ts';
import type { TFolder } from './TFolder.ts';

import { castTo } from '../internal/cast.ts';
import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { parseYaml } from './functions/parseYaml.ts';
import { stringifyYaml } from './functions/stringifyYaml.ts';

export class FileManager {
  protected constructor(private readonly app: App) {
    const self = strictMock(this);
    self.constructor__(app);
    return self;
  }

  public static create__(app: App): FileManager {
    return new FileManager(app);
  }

  public asOriginalType__(): FileManagerOriginal {
    return castTo<FileManagerOriginal>(this);
  }

  public constructor__(_app: App): void {
    noop();
  }

  public generateMarkdownLink(file: TFile, _sourcePath: string, subpath?: string, alias?: string): string {
    let link = file.basename;
    if (subpath) {
      link += `#${subpath}`;
    }
    if (alias) {
      return `[[${link}|${alias}]]`;
    }
    return `[[${link}]]`;
  }

  public async getAvailablePathForAttachment(filename: string, _sourcePath?: string): Promise<string> {
    await noopAsync();
    return filename;
  }

  public getNewFileParent(sourcePath: string, _newFilePath?: string): TFolder {
    const lastSlash = sourcePath.lastIndexOf('/');
    if (lastSlash > 0) {
      const parentPath = sourcePath.slice(0, lastSlash);
      const folder = this.app.vault.getFolderByPath(parentPath);
      if (folder) {
        return folder;
      }
    }
    return this.app.vault.getRoot();
  }

  public async processFrontMatter(file: TFile, fn: (frontmatter: Record<string, unknown>) => void, options?: DataWriteOptionsOriginal): Promise<void> {
    const content = await this.app.vault.read(file);
    let frontmatter: Record<string, unknown> = {};
    let body = content;

    const fmMatch = /^---\r?\n(?<yaml>[\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(content);
    if (fmMatch) {
      const yamlStr = fmMatch.groups?.['yaml'] ?? '';
      const parsed = parseYaml(yamlStr);
      if (parsed && typeof parsed === 'object') {
        frontmatter = parsed as Record<string, unknown>;
      }
      body = content.slice(fmMatch[0].length);
    }

    fn(frontmatter);

    const yamlOutput = stringifyYaml(frontmatter);
    const newContent = `---\n${yamlOutput}---${body ? `\n${body}` : '\n'}`;
    await this.app.vault.modify(file, newContent, options);
  }

  public async promptForDeletion(file: TAbstractFile): Promise<void> {
    await this.app.vault.trash(file, true);
  }

  public async renameFile(file: TAbstractFile, newPath: string): Promise<void> {
    await this.app.vault.rename(file, newPath);
  }

  public async trashFile(file: TAbstractFile): Promise<void> {
    await this.app.vault.trash(file, true);
  }
}
