import { IInstanceOptions, Instance } from "../../instance-provider";
import { IFontResourceRequest } from "../../resources";
import { Omit } from "../../types";
import { Vec2, Vec4 } from "../../util/vector";
import { LabelInstance } from "./label-instance";
export declare type GlyphInstanceOptions = Omit<Partial<GlyphInstance>, "resourceTrigger" | keyof Instance | "parentLabel" | "request"> & IInstanceOptions;
export declare class GlyphInstance extends Instance {
    anchor: Vec2;
    character: string;
    color: Vec4;
    depth: number;
    fontScale: number;
    maxScale: number;
    offset: Vec2;
    origin: Vec2;
    padding: Vec2;
    parentLabel?: LabelInstance;
    onReady?: (glyph: GlyphInstance) => void;
    request: IFontResourceRequest;
    constructor(options: GlyphInstanceOptions);
    clone(): void;
    resourceTrigger(): void;
}
