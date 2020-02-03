/**
 * Provides a 64 bit UID.
 *
 * Note: all uids generated with uid() are unique amongst uid() calls and NOT unique amongst
 * other types of uid calls.
 */
export declare function uid(): number;
/**
 * Provides a 24 bit UID (keeps the UID within non-alpha color ranges)
 *
 * Note: all uids generated with colorUID() are unique amongst colorUID() calls and NOT unique amongst
 * other types of uid calls.
 */
export declare function colorUID(): number;
