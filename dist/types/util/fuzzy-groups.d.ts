/**
 * Results for a fuzzyGroups query.
 */
export interface IFuzzyGroupResult {
    /**
     * Groupings of the fuzzy results. You can concat the text values in the order
     * of this array to reconstruct the original text term. isMatch will be true
     * when the fuzzy search made a match for the group.
     */
    groups: {
        isMatch: boolean;
        text: string;
    }[];
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
export declare function isFuzzyGroupResult(val: any): val is IFuzzyGroupResult;
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
export declare function fuzzyGroups(text: string, fuzzy: string): IFuzzyGroupResult;
