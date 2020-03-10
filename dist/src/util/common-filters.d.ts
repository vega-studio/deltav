import { ISingleTouchInteraction } from "../event-management/types";
/**
 * This file contains common methods for filtering data within the framework.
 */
/**
 * When applied to a filter (eg - .filter(isDefined)), this will make the resulting array not have any FALSEY values.
 * This will also ensure the resulting TYPE of the array is not undefined or null. Thus:
 *
 * const test: (Type1 | Type2 | ... | undefined | null)[] = []
 * const notNull = test.filter(isDefined);
 *
 * notNull will now have a type that excludes undefined and null values.
 *
 * NOTE: The type correction seems to only work when you use this method DIRECTLY as a filter parameter
 * .filter(isDefined) Works!
 * .filter(val => isDefined(val)) Does NOT adjust typings!
 *
 * WARNING: This WILL filter out FALSEY values. So if values like 0 or '' is VALID, then beware.
 */
export declare function isDefined<T>(val: T | null | undefined): val is T;
/**
 * This is a filter for touch events. This will filter down a list of ISingleTouchInteractions to a list that has
 * interactions who only have a specified start view.
 */
export declare function touchesHasStartView(view: string | string[]): (touch: ISingleTouchInteraction) => boolean;
/**
 * This is a filter for touch events. This will filter down a list of ISingleTouchInteractions to a list that has
 * interactions who only have a view that was under the start position of the touch.
 */
export declare function touchesContainsStartView(view: string | string[]): (touch: ISingleTouchInteraction) => {
    position: import("..").Vec2;
    view: import("..").View<import("..").IViewProps>;
} | undefined;
