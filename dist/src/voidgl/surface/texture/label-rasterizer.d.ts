import { Label } from "../../primitives/label";
import { LabelAtlasResource } from "./label-atlas-resource";
export interface ILabelRasterizedMetrics {
    canvas: HTMLCanvasElement;
    height: number;
    width: number;
}
export declare class LabelRasterizer {
    static awaitContext(): Promise<void>;
    static calculateLabelSize(resource: LabelAtlasResource, sampleScale?: number, calculateTexture?: boolean): void;
    static calculateTrucatedText(resource: LabelAtlasResource): void;
    static createCroppedCanvas(resource: LabelAtlasResource, top: number, left: number): HTMLCanvasElement;
    static drawLabel(label: Label, text: string, canvas: CanvasRenderingContext2D, sampleScaling: number): void;
    static getContext(): CanvasRenderingContext2D | null;
    static getLabelRasterizationFontSize(label: Label, sampleScale: number): number;
    static makeCSSFont(label: Label, sampleScale: number): string;
    static measureContents(canvas: CanvasRenderingContext2D): {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
    };
    static render(resource: LabelAtlasResource): Promise<LabelAtlasResource>;
    static renderSync(resource: LabelAtlasResource): LabelAtlasResource;
}
