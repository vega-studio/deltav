import { IInstanceOptions, Instance } from "../../../instance-provider";
import { Transform } from "../../scene-graph";
export interface IInstance3DOptions extends IInstanceOptions {
    transform: Transform;
}
export declare class Instance3D extends Instance {
    private _transform;
    transform: Transform;
    readonly position: [number, number, number];
    private _position;
    readonly rotation: [number, number, number, number];
    private _rotation;
    readonly scale: [number, number, number];
    private _scale;
    constructor(options: IInstance3DOptions);
}
