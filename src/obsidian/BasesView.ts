import { castTo } from '../internal/Cast.ts';
import type { BasesView as RealBasesView } from 'obsidian';

import { Component } from './Component.ts';

export abstract class BasesView extends Component {
  public override asReal__(): RealBasesView {
    return castTo<RealBasesView>(this);
  }
}
