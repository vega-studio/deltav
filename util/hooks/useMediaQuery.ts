import { useEffect, useState } from "react";

export const Breakpoints = {
  mobile: 768,
  desktop: 1440,
  large: 2560,
} as const;

// Detect orientation
export function orientation(): { landscape: boolean; portrait: boolean } {
  if (typeof window !== "undefined") {
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    return {
      landscape: !isPortrait,
      portrait: isPortrait,
    };
  }
  return {
    landscape: true,
    portrait: false,
  };
}

/**
 * Hook to check if a media query is matched.
 * @param breakpoint The breakpoint to check. e.g. `Breakpoints.mobile`
 * @param minOrMax Whether to check for min or max width. Defaults to max.
 * @returns True or false depending on whether the breakpoint is matched.
 */
export function useMediaQuery(
  breakpoint: (typeof Breakpoints)[keyof typeof Breakpoints],
  minOrMax: "min" | "max" = "max"
): boolean {
  const adjustedBreakpoint = minOrMax === "max" ? breakpoint - 1 : breakpoint;
  const query = `(${minOrMax}-width: ${adjustedBreakpoint}px)`;

  const getMatches = (query: string): boolean => {
    // Prevents SSR issues
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches(query));

  function handleChange() {
    setMatches(getMatches(query));
  }

  useEffect(() => {
    const matchMedia = window.matchMedia(query);

    // Triggered at the first client-side load and if query changes
    handleChange();

    // Listen matchMedia
    matchMedia.addEventListener("change", handleChange);

    return () => {
      matchMedia.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}
