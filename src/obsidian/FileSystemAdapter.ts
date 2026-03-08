import { InMemoryAdapter } from '../internal/InMemoryAdapter.ts';
import { strictMock } from '../internal/StrictMock.ts';

export class FileSystemAdapter extends InMemoryAdapter {
  protected constructor(basePath: string) {
    super();
    this.basePath = basePath;
    const mock = strictMock(this);
    FileSystemAdapter.constructor__(mock, basePath);
    return mock;
  }

  public static constructor__(_instance: FileSystemAdapter, _basePath: string): void {
    // Spy hook.
  }

  public static create__(basePath = '/mock-vault'): FileSystemAdapter {
    return new FileSystemAdapter(basePath);
  }

  public getBasePath(): string {
    return this.basePath;
  }

  public override getFilePath(normalizedPath: string): string {
    return `${this.basePath}/${normalizedPath}`;
  }
}
