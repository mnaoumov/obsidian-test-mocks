import type {
  DataAdapter,
  DataWriteOptions
} from 'obsidian';

import type { TAbstractFile } from './TAbstractFile.ts';

import { Events } from './Events.ts';
import { FileSystemAdapter } from './FileSystemAdapter.ts';
import { TFile } from './TFile.ts';
import { TFolder } from './TFolder.ts';

export class Vault extends Events {
  public adapter: DataAdapter = FileSystemAdapter.__create() as unknown as DataAdapter;
  // eslint-disable-next-line obsidianmd/hardcoded-config-path -- Default value for testing.
  public configDir = '.obsidian';
  public fileMap: Record<string, TAbstractFile> = {};

  public static __create(): Vault {
    return new Vault();
  }

  public static override __constructor(_instance: Vault): void {
    // Spy hook.
  }

  protected constructor() {
    super();
    const root = TFolder.__create(this, '/');
    this.fileMap['/'] = root;
    root.deleted = false;
    Vault.__constructor(this);
  }

  public static recurseChildren(folder: TFolder, cb: (f: TAbstractFile) => unknown): void {
    for (const child of folder.children) {
      cb(child);
      if (child instanceof TFolder) {
        Vault.recurseChildren(child, cb);
      }
    }
  }

  public async append(file: TFile, data: string, options?: DataWriteOptions): Promise<void> {
    await this.adapter.append(file.path, data, options);
    this.trigger('modify', file);
  }

  public async cachedRead(file: TFile): Promise<string> {
    return this.adapter.read(file.path);
  }

  public async copy(file: TFile, newPath: string): Promise<TFile> {
    await this.adapter.copy(file.path, newPath);
    const newFile = TFile.__create(this, newPath);
    setVaultAbstractFile(this, newPath, newFile);
    this.trigger('create', newFile);
    return newFile;
  }

  public async create(path: string, data: string, options?: DataWriteOptions): Promise<TFile> {
    await this.adapter.write(path, data, options);
    const file = TFile.__create(this, path);
    setVaultAbstractFile(this, path, file);
    this.trigger('create', file);
    return file;
  }

  public async createBinary(path: string, data: ArrayBuffer, options?: DataWriteOptions): Promise<TFile> {
    await this.adapter.writeBinary(path, data, options);
    const file = TFile.__create(this, path);
    setVaultAbstractFile(this, path, file);
    this.trigger('create', file);
    return file;
  }

  public async createFolder(path: string): Promise<TFolder> {
    await this.adapter.mkdir(path);
    const folder = TFolder.__create(this, path);
    setVaultAbstractFile(this, path, folder);
    this.trigger('create', folder);
    return folder;
  }

  public async delete(file: TAbstractFile, _force?: boolean): Promise<void> {
    if (file instanceof TFolder) {
      await this.adapter.rmdir(file.path, true);
    } else {
      await this.adapter.remove(file.path);
    }
    deleteVaultAbstractFile(this, file);
    this.trigger('delete', file);
  }

  public async exists(path: string): Promise<boolean> {
    return this.adapter.exists(path);
  }

  public getAbstractFileByPath(path: string): null | TAbstractFile {
    return this.fileMap[path] ?? null;
  }

  public getAbstractFileByPathInsensitive(path: string): null | TAbstractFile {
    const lower = path.toLowerCase();
    for (const [key, value] of Object.entries(this.fileMap)) {
      if (key.toLowerCase() === lower) {
        return value;
      }
    }
    return null;
  }

  public getAllFolders(_includeRoot?: boolean): TFolder[] {
    return Object.values(this.fileMap).filter((f): f is TFolder => f instanceof TFolder);
  }

  public getAllLoadedFiles(): TAbstractFile[] {
    return Object.values(this.fileMap);
  }

  public getAvailablePath(base: string, ext: string): string {
    const candidate = `${base}.${ext}`;
    if (!this.fileMap[candidate]) {
      return candidate;
    }
    let counter = 1;
    while (this.fileMap[`${base} ${String(counter)}.${ext}`]) {
      counter++;
    }
    return `${base} ${String(counter)}.${ext}`;
  }

  public getFileByPath(path: string): null | TFile {
    const f = this.fileMap[path];
    return f instanceof TFile ? f : null;
  }

  public getFiles(): TFile[] {
    return Object.values(this.fileMap).filter((f): f is TFile => f instanceof TFile);
  }

  public getFolderByPath(path: string): null | TFolder {
    const f = this.fileMap[path];
    return f instanceof TFolder ? f : null;
  }

  public getMarkdownFiles(): TFile[] {
    return Object.values(this.fileMap).filter((f): f is TFile => f instanceof TFile && f.extension === 'md');
  }

  public getName(): string {
    return '';
  }

  public getResourcePath(_file: TFile): string {
    return '';
  }

  public getRoot(): TFolder {
    const root = this.fileMap['/'];
    if (root instanceof TFolder) {
      return root;
    }
    const fallback = TFolder.__create(this, '/');
    this.fileMap['/'] = fallback;
    return fallback;
  }

  public async modify(file: TFile, data: string, options?: DataWriteOptions): Promise<void> {
    await this.adapter.write(file.path, data, options);
    this.trigger('modify', file);
  }

  public async modifyBinary(file: TFile, data: ArrayBuffer, options?: DataWriteOptions): Promise<void> {
    await this.adapter.writeBinary(file.path, data, options);
    this.trigger('modify', file);
  }

  public async process(file: TFile, fn: (data: string) => string, options?: DataWriteOptions): Promise<string> {
    const content = await this.adapter.read(file.path);
    const result = fn(content);
    await this.adapter.write(file.path, result, options);
    this.trigger('modify', file);
    return result;
  }

  public async read(file: TFile): Promise<string> {
    return this.adapter.read(file.path);
  }

  public async readBinary(file: TFile): Promise<ArrayBuffer> {
    return this.adapter.readBinary(file.path);
  }

  public async rename(file: TAbstractFile, newPath: string): Promise<void> {
    const oldPath = file.path;
    await this.adapter.rename(oldPath, newPath);

    // Remove old entry from fileMap and parent's children
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- This is a simple in-memory map for tests.
    delete this.fileMap[oldPath];
    if (file.parent) {
      const idx = file.parent.children.indexOf(file);
      if (idx !== -1) {
        file.parent.children.splice(idx, 1);
      }
    }

    // Update the file's properties in place
    file.path = newPath;
    const parts = newPath.split('/');
    file.name = parts[parts.length - 1] ?? '';
    if (file instanceof TFile) {
      const dotIndex = file.name.lastIndexOf('.');
      file.extension = dotIndex >= 0 ? file.name.slice(dotIndex + 1) : '';
      file.basename = dotIndex >= 0 ? file.name.slice(0, dotIndex) : file.name;
    }

    // Re-register in fileMap with new path and attach to new parent
    setVaultAbstractFile(this, newPath, file);

    this.trigger('rename', file, oldPath);
  }

  public async trash(file: TAbstractFile, _system: boolean): Promise<void> {
    if (file instanceof TFolder) {
      await this.adapter.rmdir(file.path, true);
    } else {
      await this.adapter.remove(file.path);
    }
    deleteVaultAbstractFile(this, file);
    this.trigger('delete', file);
  }
}

export function deleteVaultAbstractFile(vault: Vault, file: TAbstractFile): void {
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- This is a simple in-memory map for tests.
  delete vault.fileMap[file.path];
  file.deleted = true;
  if (file.parent) {
    const idx = file.parent.children.indexOf(file);
    if (idx !== -1) {
      file.parent.children.splice(idx, 1);
    }
  }
}

export function setVaultAbstractFile(vault: Vault, path: string, file: TAbstractFile): void {
  vault.fileMap[path] = file;
  file.deleted = false;
  if (path !== '/' && path !== '') {
    const lastSlash = path.lastIndexOf('/');
    const parentKey = lastSlash > 0 ? path.slice(0, lastSlash) : '/';
    const parentFile = vault.fileMap[parentKey];
    if (parentFile instanceof TFolder) {
      file.parent = parentFile;
      parentFile.children.push(file);
    }
  }
}
