export declare function normalizeWheel(event: any): {
    spinX: number;
    spinY: number;
    pixelX: number;
    pixelY: number;
};
export declare namespace normalizeWheel {
    var getEventType: () => "wheel" | "mousewheel" | "DOMMouseScroll";
}
