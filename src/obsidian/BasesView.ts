import type { BasesView as BasesViewOriginal } from 'obsidian';

import type { QueryController } from './QueryController.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { Component } from './Component.ts';

export abstract class BasesView extends Component {
  public constructor(controller: QueryController) {
    super();
    const self = strictProxy(this);
    self.constructor2__(controller);
    return self;
  }

  public static fromOriginalType2__(value: BasesViewOriginal): BasesView {
    return strictProxy(value, BasesView);
  }

  public asOriginalType2__(): BasesViewOriginal {
    return strictProxy<BasesViewOriginal>(this);
  }

  public constructor2__(_controller: QueryController): void {
    noop();
  }
}
