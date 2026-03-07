import { InMemoryAdapter } from '../internal/InMemoryAdapter.ts';
import { strictMock } from '../internal/StrictMock.ts';

export class FileSystemAdapter extends InMemoryAdapter {
  public static __create(): FileSystemAdapter {
    return new FileSystemAdapter();
  }

  public static __constructor(_instance: FileSystemAdapter): void {
    // Spy hook.
  }

  protected constructor() {
    super();
    FileSystemAdapter.__constructor(this);
    return strictMock(this);
  }

  public getBasePath(): string {
    return this.basePath;
  }

  public override getFilePath(normalizedPath: string): string {
    return `${this.basePath}/${normalizedPath}`;
  }
}
