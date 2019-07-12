import { Bounds } from "../../math/primitives/bounds";
import { SubTexture } from "./sub-texture";
export interface IPackNodeDimensions<T> {
    data: T;
    bounds: Bounds<any>;
}
export declare class PackNode<T> {
    child: [PackNode<T> | null, PackNode<T> | null];
    isLeaf: boolean;
    bounds: Bounds<any>;
    data: T | null;
    constructor(x: number, y: number, width: number, height: number);
    destroy(): void;
    hasChild(): boolean;
    insert(image: IPackNodeDimensions<T>): PackNode<T> | null;
    remove(data: T): boolean;
    static applyToSubTexture<T>(root: PackNode<T>, node: PackNode<T>, texture?: SubTexture, padding?: {
        top: number;
        left: number;
        right: number;
        bottom: number;
    }, flipY?: boolean): void;
}
