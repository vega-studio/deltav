import { Vec2 } from "../../util/vector";
export declare function convertToSDF(canvas: HTMLCanvasElement, mapMethod?: (toSeedBuffer: Vec2[][], fromSeedBuffer: Vec2[][], noDataObject: Vec2, outData: Uint8ClampedArray) => void): void;
export declare function makeFontSDF(_canvas: HTMLCanvasElement): void;
