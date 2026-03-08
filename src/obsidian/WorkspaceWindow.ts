import { strictMock } from '../internal/StrictMock.ts';

export class WorkspaceWindow {
  public get doc(): Document {
    return document;
  }

  public get win(): Window {
    return window;
  }

  protected constructor() {
    const mock = strictMock(this);
    WorkspaceWindow.constructor__(mock);
    return mock;
  }

  public static constructor__(_instance: WorkspaceWindow): void {
    // Spy hook.
  }

  public static create__(_workspace?: unknown, _id?: string, _size?: Record<string, number>): WorkspaceWindow {
    return new WorkspaceWindow();
  }
}
