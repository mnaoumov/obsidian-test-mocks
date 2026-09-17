/**
 * @file
 *
 * Mock of Obsidian's `EditorSuggest`, the base of autocomplete popovers triggered while typing in an editor.
 */

import type {
  Editor as EditorOriginal,
  EditorPosition as EditorPositionOriginal,
  EditorSuggestContext as EditorSuggestContextOriginal,
  EditorSuggest as EditorSuggestOriginal,
  EditorSuggestTriggerInfo as EditorSuggestTriggerInfoOriginal,
  Instruction as InstructionOriginal,
  TFile as TFileOriginal
} from 'obsidian';

import type { App } from './App.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { PopoverSuggest } from './PopoverSuggest.ts';

const DEFAULT_LIMIT = 100;

/**
 * Mock of Obsidian's abstract `EditorSuggest`.
 *
 * The mock never watches an editor: nothing calls {@link EditorSuggest.onTrigger} on its own, so a test calls the
 * subclass's methods directly.
 *
 * @typeParam T - The type of the suggestion items.
 */
export abstract class EditorSuggest<T> extends PopoverSuggest<T> {
  /**
   * The current suggestion context, built from the result of {@link EditorSuggest.onTrigger}; `null` whenever the
   * suggester is not active. The mock leaves it `null` until a test sets it.
   */
  public context: EditorSuggestContextOriginal | null = null;

  /**
   * Mock-only: the instructions last passed to {@link EditorSuggest.setInstructions}.
   */
  public instructions__: InstructionOriginal[] = [];

  /**
   * The maximum number of suggestions shown; `100` by default. Subclasses override it to change the limit.
   */
  public limit = DEFAULT_LIMIT;

  /**
   * Creates the suggester.
   *
   * @param app - The app the suggester belongs to.
   */
  public constructor(app: App) {
    super(app);
    const self = strictProxy(this);
    self.constructor2__(app);
    return self;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `EditorSuggest` as this mock. The numbered subclass variant of
   * `fromOriginalType__`.
   *
   * @typeParam T - The type of the suggestion items.
   * @param value - The value typed as the original `EditorSuggest`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType2__<T>(value: EditorSuggestOriginal<T>): EditorSuggest<T> {
    return strictProxy<EditorSuggest<T>>(value);
  }

  /**
   * Mock-only: views this mock as Obsidian's `EditorSuggest` type. The numbered subclass variant of
   * `asOriginalType__`.
   *
   * @returns The same object, typed as the original `EditorSuggest`.
   */
  public asOriginalType2__(): EditorSuggestOriginal<T> {
    return strictProxy<EditorSuggestOriginal<T>>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(EditorSuggest.prototype, 'constructor2__')`.
   *
   * @param _app - The app the suggester was created with.
   */
  public constructor2__(_app: App): void {
    noop();
  }

  /**
   * Generates the suggestion items for the current context; may be async, though sync is preferred.
   *
   * @param _context - The context built from {@link EditorSuggest.onTrigger}'s result.
   * @returns The suggestions, or a promise of them.
   */
  public abstract override getSuggestions(_context: EditorSuggestContextOriginal): Promise<T[]> | T[];

  /**
   * Decides, from the cursor and the text around it, whether the suggester should open. Obsidian calls it on every
   * key press, so it should return `null` as early as possible.
   *
   * @param cursor - The cursor position.
   * @param editor - The editor being typed in.
   * @param file - The file open in the editor, if any.
   * @returns The trigger range and query, or `null` to stay closed.
   */
  public abstract onTrigger(cursor: EditorPositionOriginal, editor: EditorOriginal, file: null | TFileOriginal): EditorSuggestTriggerInfoOriginal | null;

  /**
   * Renders one suggestion item.
   *
   * @param value - The suggestion to render.
   * @param el - The element to render it into.
   */
  public abstract override renderSuggestion(value: T, el: HTMLElement): void;

  /**
   * Called when the user picks a suggestion.
   *
   * @param value - The chosen suggestion.
   * @param event - The mouse or keyboard event that made the choice.
   */
  public abstract override selectSuggestion(value: T, event: KeyboardEvent | MouseEvent): void;

  /**
   * Sets the keyboard hints shown below the suggestions. The mock renders nothing and keeps them in
   * {@link EditorSuggest.instructions__}.
   *
   * @param instructions - The hints to show.
   */
  public setInstructions(instructions: InstructionOriginal[]): void {
    this.instructions__ = instructions;
  }
}
