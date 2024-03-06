import { isNumber } from "./types.js";

/**
 * Results for a fuzzyGroups query.
 */
export interface IFuzzyGroupResult {
  /**
   * Groupings of the fuzzy results. You can concat the text values in the order
   * of this array to reconstruct the original text term. isMatch will be true
   * when the fuzzy search made a match for the group.
   */
  groups: { isMatch: boolean; text: string }[];
  /**
   * When true, the complete fuzzy search term is completely found within this
   * result. Otherwise, only part or none of the fuzzy term was used.
   */
  fuzzyMatch: boolean;
  /**
   * Indicates how much of the fuzzy term was utilized in the result. A 1 means
   * fuzzyMatch is true. Anything less than 1 is how much less it was used
   * within the result.
   */
  fuzzyMatchStrength: number;
  /**
   * The original text the string was compared against
   */
  text: string;
  /**
   * The fuzzy term that was used to compare against the text.
   */
  fuzzy: string;
}

/**
 * Typeguard for a fuzzy group result type
 */
export function isFuzzyGroupResult(val: any): val is IFuzzyGroupResult {
  return (
    val &&
    val.groups &&
    isNumber(val.groups.length) &&
    isNumber(val.fuzzyMatchStrength)
  );
}

/**
 * Returns fuzzy text matching results.
 *
 * This will provide the fuzzy match with the characters in the list grouped by
 * how they match with the fuzzy text.
 *
 * You combine all of the group text vaues to recreate the original text input.
 * Use the isMatch to determine if the group is a part of a match from the fuzzy
 * input.
 *
 * fuzzyMatch is true when the complete fuzzy term matches items within the
 * text. It's false if only part of the fuzzy term or none of the term matches.
 */
export function fuzzyGroups(text: string, fuzzy: string): IFuzzyGroupResult {
  // Empty fuzzy search returns a single unmatching group
  if (fuzzy.length === 0) {
    return {
      fuzzyMatch: true,
      fuzzyMatchStrength: 1,
      groups: [{ isMatch: false, text }],
      text,
      fuzzy,
    };
  }

  const lowerText = text.toLocaleLowerCase();
  const lowerFuzzy = fuzzy.toLocaleLowerCase();
  let fuzzyIndex = 0;
  let textIndex = 0;

  const groups: { isMatch: boolean; text: string }[] = [];
  let gather = "";
  const startsWithMatch = text[0] === fuzzy[0];
  let isMatching = startsWithMatch;
  let c, lc, lf;
  const textMax = text.length;
  const fuzzyMax = fuzzy.length;

  // Loop to the end of text or until all fuzzy checks are consumed
  for (; textIndex < textMax && fuzzyIndex < fuzzyMax; ++textIndex) {
    c = text[textIndex];
    lc = lowerText[textIndex];
    lf = lowerFuzzy[fuzzyIndex];

    if (lc === lf) {
      // Toggle of the match state and group the gathered items
      if (!isMatching) {
        groups.push({ isMatch: isMatching, text: gather });
        isMatching = true;
        gather = "";
      }

      gather += c;
      // Matches cause our fuzzy index to move forward.
      fuzzyIndex++;
    } else {
      // Toggle of the match state and group the gathered items
      if (isMatching) {
        groups.push({ isMatch: isMatching, text: gather });
        isMatching = false;
        gather = "";
      }

      gather += c;
    }
  }

  if (gather) groups.push({ isMatch: isMatching, text: gather });

  // Add the rest of the characters of the text as an unmatched group
  if (textIndex < text.length) {
    const remaining = text.substring(textIndex);
    if (isMatching || groups.length === 0) {
      groups.push({ isMatch: false, text: remaining });
    } else groups[groups.length - 1].text += remaining;
  }

  return {
    groups,
    fuzzyMatch: fuzzyIndex >= fuzzyMax,
    fuzzyMatchStrength: fuzzyIndex / fuzzyMax,
    text,
    fuzzy,
  };
}
