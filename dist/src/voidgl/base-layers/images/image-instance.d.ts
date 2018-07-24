import { IInstanceOptions, Instance } from "../../instance-provider/instance";
import { Image } from "../../primitives/image";
import { ImageAtlasResource } from "../../surface/texture";
import { Anchor, ScaleType } from "../types";
export interface IImageInstanceOptions extends IInstanceOptions {
    anchor?: Anchor;
    depth?: number;
    element: HTMLImageElement;
    height?: number;
    scaling?: ScaleType;
    tint: [number, number, number, number];
    width?: number;
    x?: number;
    y?: number;
}
export declare class ImageInstance extends Instance implements Image {
    static destroy(): void;
    tint: [number, number, number, number];
    depth: number;
    height: number;
    scaling: ScaleType;
    width: number;
    x: number;
    y: number;
    size: number;
    private _sourceWidth;
    private _sourceHeight;
    private _isDestroyed;
    private _rasterization;
    private _path;
    private _element;
    readonly element: HTMLImageElement;
    readonly isDestroyed: boolean;
    readonly path: string;
    readonly resource: ImageAtlasResource;
    readonly sourceWidth: number;
    readonly sourceHeight: number;
    private _anchor;
    constructor(options: IImageInstanceOptions);
    readonly anchor: Anchor;
    destroy(): void;
    resourceTrigger(): void;
    setAnchor(anchor: Anchor): void;
}
