import type { BasesView as RealBasesView } from 'obsidian';

import { strictCastTo } from '../internal/StrictMock.ts';
import { Component } from './Component.ts';

export abstract class BasesView extends Component {
  public override asReal__(): RealBasesView {
    return strictCastTo<RealBasesView>(this);
  }
}
