import { castTo } from '../internal/Cast.ts';
import type { QueryController as RealQueryController } from 'obsidian';

import { Component } from './Component.ts';

export class QueryController extends Component {
  // Intentionally empty, obsidian.d.ts doesn't have any members to mock.

  public override asReal__(): RealQueryController {
    return castTo<RealQueryController>(this);
  }
}
