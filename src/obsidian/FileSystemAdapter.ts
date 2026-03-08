import { InMemoryAdapter } from '../internal/InMemoryAdapter.ts';
import { strictMock } from '../internal/StrictMock.ts';

export class FileSystemAdapter extends InMemoryAdapter {
  public static create__(): FileSystemAdapter {
    return new FileSystemAdapter();
  }

  public static constructor__(_instance: FileSystemAdapter): void {
    // Spy hook.
  }

  protected constructor() {
    super();
    const mock = strictMock(this);
    FileSystemAdapter.constructor__(mock);
    return mock;
  }

  public getBasePath(): string {
    return this.basePath;
  }

  public override getFilePath(normalizedPath: string): string {
    return `${this.basePath}/${normalizedPath}`;
  }
}
