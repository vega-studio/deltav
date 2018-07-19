import { IInstanceOptions, Instance } from "../../instance-provider/instance";
export interface IEdgeInstanceOptions extends IInstanceOptions {
    colorStart?: [number, number, number, number];
    colorEnd?: [number, number, number, number];
    control?: [number, number][];
    depth?: number;
    end: [number, number];
    start: [number, number];
    widthStart?: number;
    widthEnd?: number;
}
export declare type EdgeColor = [number, number, number, number];
export declare class EdgeInstance extends Instance {
    colorStart: EdgeColor;
    colorEnd: EdgeColor;
    control: [number, number][];
    depth: number;
    end: [number, number];
    start: [number, number];
    widthStart: number;
    widthEnd: number;
    readonly length: number;
    readonly midpoint: number;
    readonly perpendicular: [number, number];
    setEdgeWidth(width: number): void;
    setColor(color: EdgeColor): void;
    constructor(options: IEdgeInstanceOptions);
}
