/**
 * @file
 *
 * Mock of Obsidian's `MarkdownRenderChild`, a component whose lifetime is tied to a rendered Markdown element.
 */

import type { MarkdownRenderChild as MarkdownRenderChildOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { Component } from './Component.ts';

/**
 * Mock of Obsidian's `MarkdownRenderChild`.
 *
 * Obsidian unloads the child once its container is detached from the preview; the mock never watches the element,
 * so the child stays loaded until it is unloaded explicitly.
 */
export class MarkdownRenderChild extends Component {
  /**
   * The element whose presence in the preview keeps this child alive.
   */
  public containerEl: HTMLElement;

  /**
   * Creates a render child for an element.
   *
   * @param containerEl - The element tying the child's lifetime to the rendered Markdown; it should be a child of
   * the preview sections.
   */
  public constructor(containerEl: HTMLElement) {
    super();
    this.containerEl = containerEl;
    const self = strictProxy(this);
    self.constructor2__(containerEl);
    return self;
  }

  /**
   * Mock-only factory: creates a render child, spyable via `vi.spyOn(MarkdownRenderChild, 'create2__')`. The
   * subclass variant of {@link Component.create__}.
   *
   * @param containerEl - The element tying the child's lifetime to the rendered Markdown.
   * @returns The new render child.
   */
  public static create2__(containerEl: HTMLElement): MarkdownRenderChild {
    return new MarkdownRenderChild(containerEl);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `MarkdownRenderChild` as this mock.
   *
   * @param value - The value typed as the original `MarkdownRenderChild`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType2__(value: MarkdownRenderChildOriginal): MarkdownRenderChild {
    return strictProxy(value, MarkdownRenderChild);
  }

  /**
   * Mock-only: views this mock as Obsidian's `MarkdownRenderChild` type.
   *
   * @returns The same object, typed as the original `MarkdownRenderChild`.
   */
  public asOriginalType2__(): MarkdownRenderChildOriginal {
    return strictProxy<MarkdownRenderChildOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(MarkdownRenderChild.prototype, 'constructor2__')`.
   *
   * @param _containerEl - The container element the child was created with.
   */
  public constructor2__(_containerEl: HTMLElement): void {
    noop();
  }
}
