import { InMemoryAdapter } from '../internal/InMemoryAdapter.ts';
import { strictMock } from '../internal/StrictMock.ts';

export class CapacitorAdapter extends InMemoryAdapter {
  public static create__(): CapacitorAdapter {
    return new CapacitorAdapter();
  }

  public static constructor__(_instance: CapacitorAdapter): void {
    // Spy hook.
  }

  protected constructor() {
    super();
    const mock = strictMock(this);
    CapacitorAdapter.constructor__(mock);
    return mock;
  }

  public getFullPath(normalizedPath: string): string {
    return `${this.basePath}/${normalizedPath}`;
  }
}
