import { InMemoryAdapter } from '../internal/InMemoryAdapter.ts';
import { strictMock } from '../internal/StrictMock.ts';

export class CapacitorAdapter extends InMemoryAdapter {
  public static __create(): CapacitorAdapter {
    return new CapacitorAdapter();
  }

  public static __constructor(_instance: CapacitorAdapter): void {
    // Spy hook.
  }

  protected constructor() {
    super();
    CapacitorAdapter.__constructor(this);
    return strictMock(this);
  }

  public getFullPath(normalizedPath: string): string {
    return `${this.basePath}/${normalizedPath}`;
  }
}
