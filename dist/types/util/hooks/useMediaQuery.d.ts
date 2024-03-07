export declare const Breakpoints: {
    readonly mobile: 768;
    readonly desktop: 1440;
    readonly large: 2560;
};
export declare function orientation(): {
    landscape: boolean;
    portrait: boolean;
};
/**
 * Hook to check if a media query is matched.
 * @param breakpoint The breakpoint to check. e.g. `Breakpoints.mobile`
 * @param minOrMax Whether to check for min or max width. Defaults to max.
 * @returns True or false depending on whether the breakpoint is matched.
 */
export declare function useMediaQuery(breakpoint: (typeof Breakpoints)[keyof typeof Breakpoints], minOrMax?: "min" | "max"): boolean;
