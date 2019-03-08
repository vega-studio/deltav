export declare enum AnchorType {
    BottomLeft = 0,
    BottomMiddle = 1,
    BottomRight = 2,
    Custom = 3,
    Middle = 4,
    MiddleLeft = 5,
    MiddleRight = 6,
    TopLeft = 7,
    TopMiddle = 8,
    TopRight = 9
}
export declare type Anchor = {
    padding: number;
    type: AnchorType;
    x?: number;
    y?: number;
};
export declare enum ScaleType {
    ALWAYS = 1,
    BOUND_MAX = 2,
    NEVER = 3
}
