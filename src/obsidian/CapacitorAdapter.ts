import { DataAdapter } from './DataAdapter.ts';

export class CapacitorAdapter extends DataAdapter {
  public getBasePath(): string {
    return this.basePath;
  }

  public override getFilePath(normalizedPath: string): string {
    return `${this.basePath}/${normalizedPath}`;
  }
}
