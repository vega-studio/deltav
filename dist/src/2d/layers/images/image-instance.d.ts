import { IInstanceOptions, Instance } from "../../../instance-provider/instance";
import { Vec2 } from "../../../math/vector";
import { IAtlasResourceRequest } from "../../../resources";
import { Anchor, ScaleMode } from "../../types";
import { ImageInstanceResource } from "./image-layer";
export interface IImageInstanceOptions extends IInstanceOptions {
    anchor?: Anchor;
    depth?: number;
    source: ImageInstanceResource;
    height?: number;
    origin?: Vec2;
    scaling?: ScaleMode;
    tint: [number, number, number, number];
    width?: number;
    onError?(): void;
    onReady?(image: ImageInstance, video?: HTMLVideoElement): void;
}
export declare class ImageInstance extends Instance {
    tint: [number, number, number, number];
    depth: number;
    height: number;
    origin: Vec2;
    scaling: ScaleMode;
    source: ImageInstanceResource;
    width: number;
    maxSize: number;
    onError?: IImageInstanceOptions["onError"];
    onReady?: IImageInstanceOptions["onReady"];
    request?: IAtlasResourceRequest;
    sourceWidth: number;
    sourceHeight: number;
    private _anchor;
    constructor(options: IImageInstanceOptions);
    readonly anchor: Anchor;
    videoLoad: Function;
    resourceTrigger(): void;
    setAnchor(anchor: Anchor): void;
}
