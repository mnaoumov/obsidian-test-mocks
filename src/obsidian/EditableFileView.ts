/**
 * @file
 *
 * Mock of Obsidian's `EditableFileView`, the base of file views whose file can be edited.
 */

import type { EditableFileView as EditableFileViewOriginal } from 'obsidian';

import type { WorkspaceLeaf } from './WorkspaceLeaf.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { FileView } from './FileView.ts';

/**
 * Mock of Obsidian's abstract `EditableFileView`, which adds nothing to `FileView` in the public API.
 */
export abstract class EditableFileView extends FileView {
  /**
   * Creates the view in a leaf.
   *
   * @param leaf - The workspace leaf the view lives in.
   */
  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    const self = strictProxy(this);
    self.constructor5__(leaf);
    return self;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `EditableFileView` as this mock. The numbered subclass variant of
   * `fromOriginalType__`.
   *
   * @param value - The value typed as the original `EditableFileView`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType5__(value: EditableFileViewOriginal): EditableFileView {
    return strictProxy(value, EditableFileView);
  }

  /**
   * Mock-only: views this mock as Obsidian's `EditableFileView` type. The numbered subclass variant of
   * `asOriginalType__`.
   *
   * @returns The same object, typed as the original `EditableFileView`.
   */
  public asOriginalType5__(): EditableFileViewOriginal {
    return strictProxy<EditableFileViewOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(EditableFileView.prototype, 'constructor5__')`.
   *
   * @param _leaf - The leaf the view was created in.
   */
  public constructor5__(_leaf: WorkspaceLeaf): void {
    noop();
  }
}
