import { Omit, ResourceType, Size } from "../../types";
import { BaseResourceOptions } from "../base-resource-manager";
import { FontMap, FontMapGlyphType } from "./font-map";
import { FontRenderer } from "./font-renderer";
import { IFontResourceRequest } from "./font-resource-request";
export declare enum FontGlyphRenderSize {
    _16 = 16,
    _32 = 32,
    _64 = 64,
    _128 = 128
}
export interface IFontMapMetrics {
    localKerningCache?: boolean;
    type?: FontMapGlyphType;
    size: number;
    family: string;
    weight: string | number;
}
export interface ISimpleFontMapMetrics extends IFontMapMetrics {
    type: undefined;
}
export interface IBitmapFontSource extends IFontMapMetrics {
    type: FontMapGlyphType.BITMAP;
}
export interface IPrerenderedFontSource extends IFontMapMetrics {
    glyphs: {
        [key: string]: string;
    };
    errorGlyph: string;
}
export interface IPrerenderedSDFFontSource extends IPrerenderedFontSource {
    type: FontMapGlyphType.SDF;
}
export interface IPrerenderedMSDFFontSource extends IPrerenderedFontSource {
    type: FontMapGlyphType.MSDF;
}
export declare type FontMapSource = IFontMapMetrics | IBitmapFontSource | IPrerenderedSDFFontSource | IPrerenderedMSDFFontSource;
export interface IFontResourceOptions extends BaseResourceOptions {
    characterFilter?: string;
    dynamic?: boolean;
    fontMap?: FontMap;
    fontSource: FontMapSource;
    type: ResourceType.FONT;
    fontMapSize?: Size;
}
export declare function isFontResource(val: BaseResourceOptions): val is IFontResourceOptions;
export declare function createFont(options: Omit<IFontResourceOptions, "type" | "key"> & Partial<Pick<IFontResourceOptions, "key">>): IFontResourceOptions;
export declare class FontManager {
    fontMaps: Map<string, FontMap>;
    fontRenderer: FontRenderer;
    calculateMetrics(resourceKey: string, requests: IFontResourceRequest[]): Promise<void>;
    private characterFilterToCharacters;
    createFontMap(resourceOptions: IFontResourceOptions): Promise<FontMap>;
    destroy(): void;
    destroyFontMap(key: string): void;
    updateFontMap(resourceKey: string, requests: IFontResourceRequest[]): Promise<void>;
    private updateKerningPairs;
    private updateFontMapCharacters;
    getPrerenderedImageData(source: IPrerenderedFontSource, glyphSize: FontGlyphRenderSize, characters: string[]): Promise<void[]>;
}
