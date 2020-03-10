import { IInstanceOptions, Instance } from "../../../instance-provider";
import { Vec3 } from "../../../math";
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
    get transform(): Transform;
    set transform(val: Transform);
    /** World position of the Instance */
    get position(): Vec3;
    private _position;
    /** Rotation of the Instance */
    get rotation(): import("../../../math").Vec4;
    private _rotation;
    get scale(): Vec3;
    private _scale;
    constructor(options: IInstance3DOptions);
}
