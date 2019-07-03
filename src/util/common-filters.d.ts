import { ISingleTouchInteraction } from "../event-management/types";
export declare function isDefined<T>(val: T | null | undefined): val is T;
export declare function touchesHasStartView(view: string | string[]): (touch: ISingleTouchInteraction) => boolean;
export declare function touchesContainsStartView(view: string | string[]): (touch: ISingleTouchInteraction) => {
    position: [number, number];
    view: import("..").View<import("..").IViewProps>;
} | undefined;
