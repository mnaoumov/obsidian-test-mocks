import type { BasesView as BasesViewOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { Component } from './Component.ts';

export abstract class BasesView extends Component {
  public constructor() {
    super();
    noop();
  }

  public override asOriginalType__(): BasesViewOriginal {
    return castTo<BasesViewOriginal>(this);
  }
}
