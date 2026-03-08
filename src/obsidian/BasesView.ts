import type { BasesView as BasesViewOriginal } from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { Component } from './Component.ts';

export abstract class BasesView extends Component {
  public override asOriginalType__(): BasesViewOriginal {
    return castTo<BasesViewOriginal>(this);
  }
}
