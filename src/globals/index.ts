import * as ArrayStatic from './Array.ts';
import * as ArrayPrototype from './Array.prototype.ts';
import * as DocumentFragmentPrototype from './DocumentFragment.prototype.ts';
import * as DocumentPrototype from './Document.prototype.ts';
import * as ElementPrototype from './Element.prototype.ts';
import * as Globals from './functions.ts';
import * as HTMLElementPrototype from './HTMLElement.prototype.ts';
import * as MathStatic from './Math.ts';
import * as NodePrototype from './Node.prototype.ts';
import * as NumberStatic from './Number.ts';
import * as ObjectStatic from './Object.ts';
import * as SVGElementPrototype from './SVGElement.prototype.ts';
import * as StringStatic from './String.ts';
import * as StringPrototype from './String.prototype.ts';
import { castTo } from '../internal/Cast.ts';
import type { ObsidianGlobal } from '../internal/Types.ts';
import { assertGenericObject } from '../internal/TypeGuards.ts';

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

function hasDom(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
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

export function mockObsidianDeclareGlobal(): void {
  // Constructor / static helpers
  define(Object, {
    each: ObjectStatic.each,
    isEmpty: ObjectStatic.isEmpty
  });
  define(Array, {
    combine: ArrayStatic.combine
  });
  define(Math, {
    clamp: MathStatic.clamp,
    square: MathStatic.square
  });
  define(String, {
    isString: StringStatic.isString
  });
  define(Number, {
    isNumber: NumberStatic.isNumber
  });

  // Global functions / variables
  define(globalThis, {
    ajax: Globals.ajax,
    ajaxPromise: Globals.ajaxPromise,
    isBoolean: Globals.isBoolean,
    nextFrame: Globals.nextFrame,
    ready: Globals.ready,
    sleep: Globals.sleep
  });

  defineValueIfMissing(globalThis, 'activeWindow', hasDom() ? window : globalThis);
  defineValueIfMissing(globalThis, 'activeDocument', hasDom() ? document : undefined);

  if (hasDom()) {
    define(globalThis, {
      createDiv: Globals.createDiv,
      createEl: Globals.createEl,
      createFragment: Globals.createFragment,
      createSpan: Globals.createSpan,
      createSvg: Globals.createSvg,
      fish: Globals.fish,
      fishAll: Globals.fishAll
    });
  }

  // Prototype extensions
  define(Array.prototype, {
    contains: ArrayPrototype.contains,
    findLastIndex: ArrayPrototype.findLastIndex,
    first: ArrayPrototype.first,
    last: ArrayPrototype.last,
    remove: ArrayPrototype.remove,
    shuffle: ArrayPrototype.shuffle,
    unique: ArrayPrototype.unique
  });

  define(String.prototype, {
    contains: StringPrototype.contains,
    format: StringPrototype.format
  });

  if (hasDom() && typeof Node !== 'undefined') {
    define(Node.prototype, {
      appendText: NodePrototype.appendText,
      createDiv: NodePrototype.createDiv,
      createEl: NodePrototype.createEl,
      createSpan: NodePrototype.createSpan,
      createSvg: NodePrototype.createSvg,
      detach: NodePrototype.detach,
      empty: NodePrototype.empty,
      indexOf: NodePrototype.indexOf,
      insertAfter: NodePrototype.insertAfter,
      instanceOf: NodePrototype.instanceOf,
      setChildrenInPlace: NodePrototype.setChildrenInPlace
    });

    defineGetterIfMissing(Node.prototype, 'doc', NodePrototype.doc);
    defineGetterIfMissing(Node.prototype, 'win', NodePrototype.win);
    defineGetterIfMissing(Node.prototype, 'constructorWin', NodePrototype.constructorWin);
  }

  if (hasDom() && typeof Element !== 'undefined') {
    define(Element.prototype, {
      addClass: ElementPrototype.addClass,
      addClasses: ElementPrototype.addClasses,
      find: ElementPrototype.find,
      findAll: ElementPrototype.findAll,
      findAllSelf: ElementPrototype.findAllSelf,
      getAttr: ElementPrototype.getAttr,
      getCssPropertyValue: ElementPrototype.getCssPropertyValue,
      getText: ElementPrototype.getText,
      hasClass: ElementPrototype.hasClass,
      isActiveElement: ElementPrototype.isActiveElement,
      matchParent: ElementPrototype.matchParent,
      removeClass: ElementPrototype.removeClass,
      removeClasses: ElementPrototype.removeClasses,
      setAttr: ElementPrototype.setAttr,
      setAttrs: ElementPrototype.setAttrs,
      setText: ElementPrototype.setText,
      toggleClass: ElementPrototype.toggleClass
    });
  }

  if (hasDom() && typeof HTMLElement !== 'undefined') {
    define(HTMLElement.prototype, {
      find: HTMLElementPrototype.find,
      findAll: HTMLElementPrototype.findAll,
      findAllSelf: HTMLElementPrototype.findAllSelf,
      hide: HTMLElementPrototype.hide,
      isShown: HTMLElementPrototype.isShown,
      off: HTMLElementPrototype.off,
      on: HTMLElementPrototype.on,
      onClickEvent: HTMLElementPrototype.onClickEvent,
      onNodeInserted: HTMLElementPrototype.onNodeInserted,
      onWindowMigrated: HTMLElementPrototype.onWindowMigrated,
      setCssProps: HTMLElementPrototype.setCssProps,
      setCssStyles: HTMLElementPrototype.setCssStyles,
      show: HTMLElementPrototype.show,
      toggle: HTMLElementPrototype.toggle,
      toggleVisibility: HTMLElementPrototype.toggleVisibility,
      trigger: HTMLElementPrototype.trigger
    });

    defineGetterIfMissing(HTMLElement.prototype, 'innerWidth', HTMLElementPrototype.innerWidth);
    defineGetterIfMissing(HTMLElement.prototype, 'innerHeight', HTMLElementPrototype.innerHeight);
  }

  if (hasDom() && typeof SVGElement !== 'undefined') {
    define(SVGElement.prototype, {
      setCssProps: SVGElementPrototype.setCssProps,
      setCssStyles: SVGElementPrototype.setCssStyles
    });
  }

  if (hasDom() && typeof DocumentFragment !== 'undefined') {
    define(DocumentFragment.prototype, {
      find: DocumentFragmentPrototype.find,
      findAll: DocumentFragmentPrototype.findAll
    });
  }

  if (hasDom() && typeof Document !== 'undefined') {
    define(Document.prototype, {
      off: DocumentPrototype.off,
      on: DocumentPrototype.on
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

// Apply mocks on import (Vitest setupFiles entrypoint).
mockObsidianDeclareGlobal();

