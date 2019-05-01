import { Texture } from "../../gl/texture";
import { ResourceType } from "../../types";
import { BaseResourceRequest } from "../base-resource-manager";
import { FontMap, KernedLayout } from "./font-map";
export declare enum FontResourceRequestFetch {
    TEXCOORDS = 0,
    IMAGE_SIZE = 1
}
export interface IFontResourceRequest extends BaseResourceRequest {
    character?: string;
    fetch?: FontResourceRequestFetch;
    fontMap?: FontMap;
    kerningPairs?: string[];
    metrics?: {
        fontSize: number;
        layout?: KernedLayout;
        maxWidth?: number;
        text: string;
        truncation?: string;
        truncatedText?: string;
    };
    texture?: Texture;
    type: ResourceType.FONT;
}
