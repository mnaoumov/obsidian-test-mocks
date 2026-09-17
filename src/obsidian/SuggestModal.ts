/**
 * @file
 *
 * Mock of Obsidian's `SuggestModal`, a modal that lists suggestions for a typed query.
 */

import type {
  Instruction as InstructionOriginal,
  SuggestModal as SuggestModalOriginal
} from 'obsidian';

import type { App } from './App.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { Modal } from './Modal.ts';

const DEFAULT_LIMIT = 100;

/**
 * Mock of Obsidian's `SuggestModal` base class.
 *
 * No suggestion list is driven by typing: a test calls {@link SuggestModal.selectSuggestion} to choose an item.
 * Instructions are rendered into {@link SuggestModal.instructionsEl} and kept in {@link SuggestModal.instructions__}.
 *
 * @typeParam T - The type of a suggestion item.
 */
export abstract class SuggestModal<T> extends Modal {
  /**
   * Text shown when there are no suggestions.
   */
  public emptyStateText = 'No results found.';

  /**
   * The query input element.
   */
  public inputEl: HTMLInputElement;

  /**
   * Mock-only: the instructions last passed to {@link SuggestModal.setInstructions}.
   */
  public instructions__: InstructionOriginal[] = [];

  /**
   * The `prompt-instructions` element listing the keyboard instructions; attached to the modal only while there are
   * instructions.
   */
  public readonly instructionsEl: HTMLDivElement;

  /**
   * The maximum number of suggestions to show.
   */
  public limit = DEFAULT_LIMIT;

  /**
   * The element suggestions are rendered into.
   */
  public resultContainerEl: HTMLElement;

  /**
   * Creates the modal with its query input, result container and detached instructions element.
   *
   * @param app - The app instance.
   */
  public constructor(app: App) {
    super(app);
    this.inputEl = this.modalEl.createEl('input');
    this.resultContainerEl = this.modalEl.createDiv();
    this.instructionsEl = createDiv('prompt-instructions');
    const self = strictProxy(this);
    self.constructor2__(app);
    return self;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `SuggestModal` as this mock.
   *
   * @typeParam T - The type of a suggestion item.
   * @param value - The value typed as the original `SuggestModal`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType2__<T>(value: SuggestModalOriginal<T>): SuggestModal<T> {
    return strictProxy<SuggestModal<T>>(value, SuggestModal);
  }

  /**
   * Mock-only: views this mock as Obsidian's `SuggestModal` type.
   *
   * @returns The same object, typed as the original `SuggestModal`.
   */
  public asOriginalType2__(): SuggestModalOriginal<T> {
    return strictProxy<SuggestModalOriginal<T>>(this);
  }

  /**
   * Closes the modal.
   */
  public override close(): void {
    super.close();
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(SuggestModal.prototype, 'constructor2__')`.
   *
   * @param _app - The app the modal was created with.
   */
  public constructor2__(_app: App): void {
    noop();
  }

  /**
   * Computes the suggestions for a query.
   *
   * @param _query - The text typed into the input.
   * @returns The matching items, or a promise of them.
   */
  public abstract getSuggestions(_query: string): Promise<T[]> | T[];

  /**
   * Called when the user chooses a suggestion.
   *
   * @param item - The chosen item.
   * @param event - The mouse or keyboard event that chose it.
   */
  public abstract onChooseSuggestion(item: T, event: KeyboardEvent | MouseEvent): void;

  /**
   * Called when a query yields no suggestions. A no-op in the mock.
   */
  public onNoSuggestion(): void {
    noop();
  }

  /**
   * Renders one suggestion into its element.
   *
   * @param value - The item to render.
   * @param _el - The element to render it into.
   */
  public abstract renderSuggestion(value: T, _el: HTMLElement): void;

  /**
   * Chooses the currently highlighted suggestion. A no-op in the mock, which tracks no highlight.
   *
   * @param _event - The mouse or keyboard event that triggered the choice.
   */
  public selectActiveSuggestion(_event: KeyboardEvent | MouseEvent): void {
    noop();
  }

  /**
   * Chooses a suggestion: calls {@link SuggestModal.onChooseSuggestion}, then closes the modal.
   *
   * @param value - The chosen item.
   * @param event - The mouse or keyboard event that chose it.
   */
  public selectSuggestion(value: T, event: KeyboardEvent | MouseEvent): void {
    this.onChooseSuggestion(value, event);
    this.close();
  }

  /**
   * Sets the keyboard instructions shown below the suggestions. An empty list detaches
   * {@link SuggestModal.instructionsEl}; otherwise it is re-rendered and appended to the modal.
   *
   * @param instructions - The command and purpose pairs to show.
   */
  public setInstructions(instructions: InstructionOriginal[]): void {
    this.instructions__ = instructions;
    if (instructions.length === 0) {
      this.instructionsEl.detach();
      return;
    }
    this.instructionsEl.empty();
    for (const instruction of instructions) {
      this.instructionsEl.createDiv('prompt-instruction', (el) => {
        el.createSpan({ cls: 'prompt-instruction-command', text: instruction.command });
        el.createSpan({ text: instruction.purpose });
      });
    }
    this.modalEl.append(this.instructionsEl);
  }

  /**
   * Sets the query input's placeholder text.
   *
   * @param placeholder - The placeholder text.
   */
  public setPlaceholder(placeholder: string): void {
    this.inputEl.placeholder = placeholder;
  }
}
