import { InMemoryAdapter } from '../internal/InMemoryAdapter.ts';

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
  }

  public getBasePath(): string {
    return this.basePath;
  }

  public override getFilePath(normalizedPath: string): string {
    return `${this.basePath}/${normalizedPath}`;
  }
}
