import { IInstanceOptions, Instance } from "../../../instance-provider";
import { Transform } from "../../scene-graph";
export interface IInstance3DOptions extends IInstanceOptions {
    /** The transform object that will manage this instance */
    transform: Transform;
}
/**
 * Basic properties of an instance that exists within a 3D world.
 */
export declare class Instance3D extends Instance {
    /** This is the 3D transform that will place this object within the 3D world. */
    private _transform;
    transform: Transform;
    /** World position of the Instance */
    readonly position: [number, number, number];
    private _position;
    /** Rotation of the Instance */
    readonly rotation: [number, number, number, number];
    private _rotation;
    readonly scale: [number, number, number];
    private _scale;
    constructor(options: IInstance3DOptions);
}
