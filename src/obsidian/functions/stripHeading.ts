/**
 * @file
 *
 * Mock of Obsidian's `stripHeading`.
 */

const SPECIAL_CHARACTERS_REG_EXP = /[!"#$%&()*+,.:;<=>?@^`{|}~/[\]\\\r\n]/g;

/**
 * Normalizes a heading for link matching, as Obsidian does: each character of `` !"#$%&()*+,.:;<=>?@^`{|}~/[]\ ``,
 * and each line break, becomes a space; runs of whitespace collapse to one space; and the result is trimmed.
 *
 * @param heading - The heading text.
 * @returns The normalized heading.
 */
export function stripHeading(heading: string): string {
  return heading.replaceAll(SPECIAL_CHARACTERS_REG_EXP, ' ').replaceAll(/\s+/g, ' ').trim();
}
