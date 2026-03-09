import type { ObsidianGlobal } from '../internal/Types.ts';

import { castTo } from '../internal/Cast.ts';
import { assertGenericObject } from '../internal/TypeGuards.ts';
import {
  contains,
  findLastIndex,
  first,
  last,
  remove,
  shuffle,
  unique
} from './Array.prototype.ts';
import { combine } from './Array.ts';
import {
  off,
  on
} from './Document.prototype.ts';
import {
  find,
  findAll
} from './DocumentFragment.prototype.ts';
import {
  addClass,
  addClasses,
  find,
  findAll,
  findAllSelf,
  getAttr,
  getCssPropertyValue,
  getText,
  hasClass,
  isActiveElement,
  matchParent,
  removeClass,
  removeClasses,
  setAttr,
  setAttrs,
  setText,
  toggleClass
} from './Element.prototype.ts';
import {
  ajax,
  ajaxPromise,
  createDiv,
  createEl,
  createFragment,
  createSpan,
  createSvg,
  fish,
  fishAll,
  isBoolean,
  nextFrame,
  ready,
  sleep
} from './functions.ts';
import {
  find,
  findAll,
  findAllSelf,
  hide,
  innerHeight,
  innerWidth,
  isShown,
  off,
  on,
  onClickEvent,
  onNodeInserted,
  onWindowMigrated,
  setCssProps,
  setCssStyles,
  show,
  toggle,
  toggleVisibility,
  trigger
} from './HTMLElement.prototype.ts';
import {
  clamp,
  square
} from './Math.ts';
import {
  appendText,
  constructorWin,
  createDiv,
  createEl,
  createSpan,
  createSvg,
  detach,
  doc,
  empty,
  indexOf,
  insertAfter,
  instanceOf,
  setChildrenInPlace,
  win
} from './Node.prototype.ts';
import { isNumber } from './Number.ts';
import {
  each,
  isEmpty
} from './Object.ts';
import {
  format,
  contains as StringPrototype_contains
} from './String.prototype.ts';
import { isString } from './String.ts';
import {
  setCssProps,
  setCssStyles
} from './SVGElement.prototype.ts';

export function mockObsidianDeclareGlobal(): void {
  // Constructor / static helpers
  define(Object, {
    each,
    isEmpty
  });
  define(Array, {
    combine
  });
  define(Math, {
    clamp,
    square
  });
  define(String, {
    isString
  });
  define(Number, {
    isNumber
  });

  // Global functions / variables
  define(globalThis, {
    ajax,
    ajaxPromise,
    isBoolean,
    nextFrame,
    ready,
    sleep
  });

  defineValueIfMissing(globalThis, 'activeWindow', hasDom() ? window : globalThis);
  defineValueIfMissing(globalThis, 'activeDocument', hasDom() ? document : undefined);

  if (hasDom()) {
    define(globalThis, {
      createDiv,
      createEl,
      createFragment,
      createSpan,
      createSvg,
      fish,
      fishAll
    });
  }

  // Prototype extensions
  define(Array.prototype, {
    contains,
    findLastIndex,
    first,
    last,
    remove,
    shuffle,
    unique
  });

  define(String.prototype, {
    contains: StringPrototype_contains,
    format
  });

  if (hasDom() && typeof Node !== 'undefined') {
    define(Node.prototype, {
      appendText,
      createDiv,
      createEl,
      createSpan,
      createSvg,
      detach,
      empty,
      indexOf,
      insertAfter,
      instanceOf,
      setChildrenInPlace
    });

    defineGetterIfMissing(Node.prototype, 'doc', doc);
    defineGetterIfMissing(Node.prototype, 'win', win);
    defineGetterIfMissing(Node.prototype, 'constructorWin', constructorWin);
  }

  if (hasDom() && typeof Element !== 'undefined') {
    define(Element.prototype, {
      addClass,
      addClasses,
      find,
      findAll,
      findAllSelf,
      getAttr,
      getCssPropertyValue,
      getText,
      hasClass,
      isActiveElement,
      matchParent,
      removeClass,
      removeClasses,
      setAttr,
      setAttrs,
      setText,
      toggleClass
    });
  }

  if (hasDom() && typeof HTMLElement !== 'undefined') {
    define(HTMLElement.prototype, {
      find,
      findAll,
      findAllSelf,
      hide,
      isShown,
      off,
      on,
      onClickEvent,
      onNodeInserted,
      onWindowMigrated,
      setCssProps,
      setCssStyles,
      show,
      toggle,
      toggleVisibility,
      trigger
    });

    defineGetterIfMissing(HTMLElement.prototype, 'innerWidth', innerWidth);
    defineGetterIfMissing(HTMLElement.prototype, 'innerHeight', innerHeight);
  }

  if (hasDom() && typeof SVGElement !== 'undefined') {
    define(SVGElement.prototype, {
      setCssProps,
      setCssStyles
    });
  }

  if (hasDom() && typeof DocumentFragment !== 'undefined') {
    define(DocumentFragment.prototype, {
      find,
      findAll
    });
  }

  if (hasDom() && typeof Document !== 'undefined') {
    define(Document.prototype, {
      off,
      on
    });
  }

  // Mirror global helpers onto `window` for browser-like code paths.
  if (hasDom()) {
    const obsidianGlobal = castTo<ObsidianGlobal>(globalThis);
    defineValueIfMissing(window, 'sleep', obsidianGlobal.sleep);
    defineValueIfMissing(window, 'nextFrame', obsidianGlobal.nextFrame);
    defineValueIfMissing(window, 'activeWindow', obsidianGlobal.activeWindow);
    defineValueIfMissing(window, 'activeDocument', obsidianGlobal.activeDocument);
  }
}

/**
 * Defines a set of properties on the target object, but only if missing.
 *
 * This is intended to polyfill Obsidian's `declare global` helpers/prototypes
 * in tests without overwriting any existing implementation (e.g. jsdom / Node).
 */
function define<Target extends object>(target: Target, values: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(values)) {
    defineValueIfMissing(target, key, value);
  }
}

function defineGetterIfMissing<Target extends object, Return>(
  target: Target,
  key: string,
  getter: (this: Target) => Return
): void {
  assertGenericObject(target);
  if (target[key] !== undefined) {
    return;
  }
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: false,
    get: getter
  });
}

function defineValue(
  target: object,
  key: string,
  value: unknown
): void {
  assertGenericObject(target);
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: false,
    value,
    writable: true
  });
}

function defineValueIfMissing(
  target: object,
  key: string,
  value: unknown
): void {
  assertGenericObject(target);
  if (target[key] !== undefined) {
    return;
  }
  defineValue(target, key, value);
}

function hasDom(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

// Apply mocks on import (Vitest setupFiles entrypoint).
mockObsidianDeclareGlobal();
