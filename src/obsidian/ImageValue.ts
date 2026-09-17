/**
 * @file
 *
 * Mock of Obsidian's `ImageValue`, the Bases value wrapping a path to an image in the vault.
 */

import type { ImageValue as ImageValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { StringValue } from './StringValue.ts';

/**
 * Mock of Obsidian's `ImageValue`: a string value holding an image path. The mock never loads the image.
 */
export class ImageValue extends StringValue {
  /**
   * Creates an image value.
   *
   * @param value - The path of the image resource.
   */
  public constructor(value = '') {
    super(value);
    const self = strictProxy(this);
    self.constructor5__(value);
    return self;
  }

  /**
   * Mock-only factory: creates an image value, spyable via `vi.spyOn(ImageValue, 'create2__')`. The subclass
   * variant of {@link StringValue.create__}.
   *
   * @param value - The path of the image resource.
   * @returns The new image value.
   */
  public static create2__(value = ''): ImageValue {
    return new ImageValue(value);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `ImageValue` as this mock.
   *
   * @param value - The value typed as the original `ImageValue`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType5__(value: ImageValueOriginal): ImageValue {
    return strictProxy(value, ImageValue);
  }

  /**
   * Mock-only: views this mock as Obsidian's `ImageValue` type.
   *
   * @returns The same object, typed as the original `ImageValue`.
   */
  public asOriginalType5__(): ImageValueOriginal {
    return strictProxy<ImageValueOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(ImageValue.prototype, 'constructor5__')`.
   *
   * @param _value - The image path the value was created with.
   */
  public constructor5__(_value: string): void {
    noop();
  }
}
