/**
 * @file
 *
 * Mock of Obsidian's `FileManager`, which creates, renames and deletes files on the vault's behalf.
 */

import type {
  DataWriteOptions as DataWriteOptionsOriginal,
  FileManager as FileManagerOriginal
} from 'obsidian';

import type { App } from './App.ts';
import type { TAbstractFile } from './TAbstractFile.ts';
import type { TFile } from './TFile.ts';
import type { TFolder } from './TFolder.ts';

import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';
import { parseYaml } from './functions/parseYaml.ts';
import { stringifyYaml } from './functions/stringifyYaml.ts';

// Obsidian's `trashOption` vault setting, which decides where `trashFile` sends a file.
const TRASH_OPTION_CONFIG_KEY = 'trashOption';
const TRASH_OPTION_SYSTEM = 'system';
const TRASH_OPTION_LOCAL = 'local';
const TRASH_OPTION_NONE = 'none';

/**
 * Mock of Obsidian's `FileManager`.
 *
 * Every operation goes straight to the mock `app.vault`, and no prompt is shown. The one user preference it reads
 * is `trashOption`, which {@link FileManager.trashFile} routes on exactly as Obsidian does.
 */
export class FileManager {
  /**
   * Creates a file manager bound to an app. Use {@link FileManager.create__} from tests.
   *
   * @param app - The app whose vault the manager operates on.
   */
  protected constructor(private readonly app: App) {
    const self = strictProxy(this);
    self.constructor__(app);
    return self;
  }

  /**
   * Mock-only factory: creates a file manager, spyable via `vi.spyOn(FileManager, 'create__')`.
   *
   * @param app - The app whose vault the manager operates on.
   * @returns The new file manager.
   */
  public static create__(app: App): FileManager {
    return new FileManager(app);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `FileManager` as this mock.
   *
   * @param value - The value typed as the original `FileManager`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: FileManagerOriginal): FileManager {
    return strictProxy(value, FileManager);
  }

  /**
   * Mock-only: views this mock as Obsidian's `FileManager` type.
   *
   * @returns The same object, typed as the original `FileManager`.
   */
  public asOriginalType__(): FileManagerOriginal {
    return strictProxy<FileManagerOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(FileManager.prototype, 'constructor__')`.
   *
   * @param _app - The app the manager was created with.
   */
  public constructor__(_app: App): void {
    noop();
  }

  /**
   * Generates a Markdown link to a file based on the user's preferences.
   *
   * The mock ignores preferences and the source path: it always emits a wikilink to the file's basename.
   *
   * @param file - The file to link to.
   * @param _sourcePath - The path of the note the link is stored in; ignored by the mock.
   * @param subpath - A heading or block subpath, appended after `#` when given.
   * @param alias - The display text, appended after `|` when non-empty.
   * @returns The wikilink, such as `[[note#heading|alias]]`.
   */
  public generateMarkdownLink(file: TFile, _sourcePath: string, subpath?: string, alias?: string): string {
    let link = file.basename;
    if (subpath) {
      link += `#${subpath}`;
    }
    return alias ? `[[${link}|${alias}]]` : `[[${link}]]`;
  }

  /**
   * Resolves a unique path for an attachment being saved, according to the user's attachment settings.
   *
   * The mock neither applies settings nor deduplicates: it returns `filename` unchanged.
   *
   * @param filename - The name of the attachment being saved.
   * @param _sourcePath - The path of the note the attachment belongs to; ignored by the mock.
   * @returns The attachment path, which in the mock is `filename` itself.
   */
  public async getAvailablePathForAttachment(filename: string, _sourcePath?: string): Promise<string> {
    await noopAsync();
    return filename;
  }

  /**
   * Gets the folder new files should be created in, given the user's preferences.
   *
   * The mock always behaves like the "same folder as current file" preference: it returns the folder containing
   * `sourcePath` when that folder exists in the vault, and the vault root otherwise.
   *
   * @param sourcePath - The path of the currently open file, or an empty string when there is none.
   * @param _newFilePath - The path of the file about to be created; ignored by the mock.
   * @returns The folder to create the new file in.
   */
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

  /**
   * Atomically reads, modifies and saves a note's frontmatter.
   *
   * The mock reads the note from the vault, parses its leading `---` block as YAML (an empty object when there is
   * none), lets `$function` mutate that object, and writes the note back with the re-serialized frontmatter
   * followed by the original body.
   *
   * @param file - The Markdown file to modify.
   * @param $function - A callback that mutates the frontmatter object synchronously.
   * @param options - Write options passed on to `vault.modify`.
   */
  public async processFrontMatter(file: TFile, $function: (frontmatter: Record<string, unknown>) => void, options?: DataWriteOptionsOriginal): Promise<void> {
    const content = await this.app.vault.read(file);
    let frontmatter: Record<string, unknown> = {};
    let body = content;

    const fmMatch = /^---\r?\n(?<yaml>[\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(content);
    if (fmMatch) {
      const yamlString = ensureNonNullable(fmMatch.groups?.['yaml']);
      const parsed = parseYaml(yamlString);
      if (parsed && typeof parsed === 'object') {
        frontmatter = parsed as Record<string, unknown>;
      }
      body = content.slice(fmMatch[0].length);
    }

    $function(frontmatter);

    const yamlOutput = stringifyYaml(frontmatter);
    const newContent = `---\n${yamlOutput}---${body ? `\n${body}` : '\n'}`;
    await this.app.vault.modify(file, newContent, options);
  }

  /**
   * Asks the user to confirm deleting a file or folder, and deletes it if they do.
   *
   * The mock shows no prompt: it behaves as if the user confirmed, deleting the file through
   * {@link FileManager.trashFile} right away, as Obsidian does when its confirmation prompt is turned off.
   *
   * Obsidian's own `promptDelete` and `deleteUnlinkedAttachments` settings are deliberately not modeled — the mock
   * has no dialogue to show, so the only faithful answer it can give is the one it already gives. Set `trashOption`
   * to choose where the file goes.
   *
   * @param file - The file or folder to delete.
   * @returns Whether the deletion was confirmed; always `true` in the mock.
   */
  public async promptForDeletion(file: TAbstractFile): Promise<boolean> {
    await this.trashFile(file);
    return true;
  }

  /**
   * Renames or moves a file, updating links to it according to the user's preferences.
   *
   * The mock delegates to `vault.rename` and does not update any links.
   *
   * @param file - The file or folder to rename.
   * @param newPath - The new vault path.
   */
  public async renameFile(file: TAbstractFile, newPath: string): Promise<void> {
    await this.app.vault.rename(file, newPath);
  }

  /**
   * Removes a file or folder according to the user's trash preference (the vault's `.trash` folder or the system
   * trash).
   *
   * Routes on the vault's `trashOption` setting exactly as Obsidian does: `system` (the default) trashes through
   * `vault.trash(file, true)`, `local` through `vault.trash(file, false)`, and `none` deletes permanently through
   * `vault.delete(file, true)`. Any other value does **nothing at all** — Obsidian's three branches have no `else`,
   * so a key set to an unrecognized value leaves the file where it is.
   *
   * @param file - The file or folder to remove.
   */
  public async trashFile(file: TAbstractFile): Promise<void> {
    const trashOption = this.app.vault.getConfig(TRASH_OPTION_CONFIG_KEY);
    switch (trashOption) {
      case TRASH_OPTION_LOCAL: {
        await this.app.vault.trash(file, false);
        break;
      }
      case TRASH_OPTION_NONE: {
        await this.app.vault.delete(file, true);
        break;
      }
      case TRASH_OPTION_SYSTEM: {
        await this.app.vault.trash(file, true);
        break;
      }
      default: {
        break;
      }
    }
  }
}
