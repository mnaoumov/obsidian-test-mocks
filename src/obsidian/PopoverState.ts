/**
 * @file
 *
 * Mock of Obsidian's `PopoverState` enum.
 */

/**
 * Mock of Obsidian's `PopoverState` enum, which names the lifecycle states of a hover popover.
 *
 * `obsidian.d.ts` declares it with no members; the mock carries the four Obsidian defines at runtime, under the
 * names and values `obsidian-typings` declares: `Showing` is `0`, and each state after it is one higher.
 */
export enum PopoverState {
  /**
   * The popover is being shown.
   */
  Showing,
  /**
   * The popover is shown.
   */
  Shown,
  /**
   * The popover is being hidden.
   */
  Hiding,
  /**
   * The popover is hidden.
   */
  Hidden
}
