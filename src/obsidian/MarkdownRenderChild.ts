import type { MarkdownRenderChild as MarkdownRenderChildOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import {
  mergePrototype,
  strictProxyForce
} from '../internal/strict-proxy.ts';
import { Component } from './Component.ts';

export class MarkdownRenderChild extends Component {
  public containerEl: HTMLElement;

  public constructor(containerEl: HTMLElement) {
    super();
    this.containerEl = containerEl;
    const self = strictProxyForce(this);
    self.constructor2__(containerEl);
    return self;
  }

  public static create2__(containerEl: HTMLElement): MarkdownRenderChild {
    return new MarkdownRenderChild(containerEl);
  }

  public static fromOriginalType2__(value: MarkdownRenderChildOriginal): MarkdownRenderChild {
    return mergePrototype(MarkdownRenderChild, value);
  }

  public asOriginalType2__(): MarkdownRenderChildOriginal {
    return strictProxyForce<MarkdownRenderChildOriginal>(this);
  }

  public constructor2__(_containerEl: HTMLElement): void {
    noop();
  }
}
