import type { BasesView as BasesViewOriginal } from 'obsidian';

import type { QueryController } from './QueryController.ts';

import { noop } from '../internal/noop.ts';
import {
  mergePrototype,
  strictProxyForce
} from '../internal/strict-proxy.ts';
import { Component } from './Component.ts';

export abstract class BasesView extends Component {
  public constructor(controller: QueryController) {
    super();
    const self = strictProxyForce(this);
    self.constructor2__(controller);
    return self;
  }

  public static fromOriginalType2__(value: BasesViewOriginal): BasesView {
    return mergePrototype(BasesView, value);
  }

  public asOriginalType2__(): BasesViewOriginal {
    return strictProxyForce<BasesViewOriginal>(this);
  }

  public constructor2__(_controller: QueryController): void {
    noop();
  }
}
