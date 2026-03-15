import type { QueryController as QueryControllerOriginal } from 'obsidian';

import type { App } from './App.ts';
import type { TFile } from './TFile.ts';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { Component } from './Component.ts';

export class QueryController extends Component {
  public constructor(app: App, plugin: unknown, viewHeaderEl: HTMLElement, currentFile?: null | TFile) {
    super();
    const self = strictMock(this);
    self.constructor2__(app, plugin, viewHeaderEl, currentFile);
    return self;
  }

  public static create2__(app: App, plugin: unknown, viewHeaderEl: HTMLElement, currentFile?: null | TFile): QueryController {
    return new QueryController(app, plugin, viewHeaderEl, currentFile);
  }

  public static override fromOriginalType__(value: QueryControllerOriginal): QueryController {
    return castTo<QueryController>(value);
  }

  public override asOriginalType__(): QueryControllerOriginal {
    return castTo<QueryControllerOriginal>(this);
  }

  public constructor2__(_app: App, _plugin: unknown, _viewHeaderEl: HTMLElement, _currentFile?: null | TFile): void {
    noop();
  }
}
