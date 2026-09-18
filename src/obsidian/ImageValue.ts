/**
 * @file
 *
 * Mock of Obsidian's `ImageValue`, the Bases value wrapping a path to an image in the vault.
 */

import type { ImageValue as ImageValueOriginal } from 'obsidian';

import type { RenderContext } from './RenderContext.ts';

import { isInternalLinkTarget } from '../internal/link-target.ts';
import { noop } from '../internal/noop.ts';
import {
  IMAGE_EXTENSIONS,
  toDesktopResourcePath
} from '../internal/resource-path.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { StringValue } from './StringValue.ts';

/**
 * Mock of Obsidian's `ImageValue`: a string value holding an image path.
 */
export class ImageValue extends StringValue {
  /**
   * The value type's identifier, `'Image'` - Obsidian's own name for this class of value.
   */
  public static override type = 'Image';

  /**
   * The lucide icon name standing for this value's type.
   */
  public override icon = 'lucide-image';

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

  /**
   * Renders the image into an element, as Obsidian does: an `img` whose `src` is the vault resource path for
   * an in-vault image, and the value itself for anything else.
   *
   * The two branches are not symmetric, and the asymmetry is Obsidian's. An INTERNAL path is resolved through
   * `MetadataCache.getFirstLinkpathDest` and rendered only when it resolves to a file whose extension is an
   * image one - so a path that resolves to nothing, or to a note, renders NO element at all. An external
   * source always gets its `img`, with a desktop `file:///` source re-prefixed with
   * `Platform.resourcePathPrefix` first.
   *
   * The mock's `Vault.getResourcePath` answers an empty string, so an in-vault image renders an `img` with an
   * empty `src`. Its presence and its class are the observable part; spy on `getResourcePath` for a test that
   * needs a real path.
   *
   * @param el - The element to render into.
   * @param context - The rendering context, whose app resolves an in-vault path.
   */
  public override renderTo(el: HTMLElement, context: RenderContext): void {
    if (!isInternalLinkTarget(this.data)) {
      el.createEl('img').src = toDesktopResourcePath(this.data);
      return;
    }

    const destination = context.app.metadataCache.getFirstLinkpathDest(this.data, '');
    if (destination && IMAGE_EXTENSIONS.includes(destination.extension)) {
      el.createEl('img').src = context.app.vault.getResourcePath(destination);
    }
  }
}
