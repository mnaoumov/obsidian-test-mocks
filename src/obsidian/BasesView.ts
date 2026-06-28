import type {
  BasesPropertyId as BasesPropertyIdOriginal,
  BasesView as BasesViewOriginal
} from 'obsidian';

import type { QueryController } from './QueryController.ts';

import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { App } from './App.ts';
import { BasesQueryResult } from './BasesQueryResult.ts';
import { BasesViewConfig } from './BasesViewConfig.ts';
import { Component } from './Component.ts';

export abstract class BasesView extends Component {
  public allProperties: BasesPropertyIdOriginal[] = [];
  public app: App;
  public config: BasesViewConfig;
  public data: BasesQueryResult;
  public abstract type: string;

  public constructor(controller: QueryController) {
    super();
    this.app = App.createConfigured__();
    this.config = BasesViewConfig.create__('', '', '');
    this.data = BasesQueryResult.create__(this.app, this.config, [], []);
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

  public async createFileForView(_baseFileName?: string, _frontmatterProcessor?: (frontmatter: unknown) => void): Promise<void> {
    await noopAsync();
  }

  public abstract onDataUpdated(): void;
}
