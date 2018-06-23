import { IColorPickingData } from '..';
import { Vec2 } from './vector';
/**
 * This analyzes the rendered data for color picking and outputs the metrics and data needed
 * for the operation.
 */
export declare function analyzeColorPickingRendering(mouse: Vec2, data: Uint8Array, width: number, height: number): IColorPickingData;
