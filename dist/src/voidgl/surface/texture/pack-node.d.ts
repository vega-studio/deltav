import { Bounds } from "../../primitives/bounds";
import { SubTexture } from "./sub-texture";
export interface ImageDimensions {
    first: SubTexture;
    second: Bounds;
}
export declare class PackNode {
    child: [PackNode | null, PackNode | null];
    isLeaf: boolean;
    nodeDimensions: Bounds;
    nodeImage: SubTexture | null;
    constructor(x: number, y: number, width: number, height: number);
    destroy(): void;
    hasChild(): boolean;
    insert(image: ImageDimensions): PackNode | null;
    remove(image: SubTexture): boolean;
}
