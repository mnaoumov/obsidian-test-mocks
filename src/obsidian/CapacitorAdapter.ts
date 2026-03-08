import { InMemoryAdapter } from '../internal/InMemoryAdapter.ts';
import { strictMock } from '../internal/StrictMock.ts';

export class CapacitorAdapter extends InMemoryAdapter {
  protected constructor(basePath: string) {
    super();
    this.basePath = basePath;
    const mock = strictMock(this);
    CapacitorAdapter.constructor__(mock, basePath);
    return mock;
  }

  public static constructor__(_instance: CapacitorAdapter, _basePath: string): void {
    // Spy hook.
  }

  public static create__(basePath = '/mock-vault', _fs?: unknown): CapacitorAdapter {
    return new CapacitorAdapter(basePath);
  }

  public getFullPath(normalizedPath: string): string {
    return `${this.basePath}/${normalizedPath}`;
  }
}
