import { IInstanceOptions, Instance } from "../../instance-provider/instance";
import { IAtlasResourceRequest } from "../../resources";
import { Vec2 } from "../../util/vector";
import { Anchor, ScaleMode } from "../types";
export interface IImageInstanceOptions extends IInstanceOptions {
    anchor?: Anchor;
    depth?: number;
    source: string | TexImageSource;
    height?: number;
    origin?: Vec2;
    scaling?: ScaleMode;
    tint: [number, number, number, number];
    width?: number;
    onReady?(image: ImageInstance): void;
}
export declare class ImageInstance extends Instance {
    tint: [number, number, number, number];
    depth: number;
    height: number;
    origin: Vec2;
    scaling: ScaleMode;
    source: string | TexImageSource;
    width: number;
    maxSize: number;
    onReady?: (image: ImageInstance) => void;
    request?: IAtlasResourceRequest;
    sourceWidth: number;
    sourceHeight: number;
    private _anchor;
    constructor(options: IImageInstanceOptions);
    readonly anchor: Anchor;
    resourceTrigger(): void;
    setAnchor(anchor: Anchor): void;
}
