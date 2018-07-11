import { Bounds } from "../primitives/bounds";
export declare class DataBounds<T> extends Bounds {
    data: T;
    static emptyBounds<T>(): DataBounds<T>;
}
