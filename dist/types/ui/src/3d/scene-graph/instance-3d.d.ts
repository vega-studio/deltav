import { IInstanceOptions, Instance } from "../../instance-provider";
import { Mat4x4, Quaternion, Vec3 } from "../../math";
import { Transform } from "./transform.js";
export interface IInstance3DOptions extends IInstanceOptions {
    /** The transform object that will manage this instance */
    transform?: Transform;
    /** A parent Instance or Transform to this instance */
    parent?: Transform | Instance3D;
}
/**
 * Basic properties of an instance that exists within a 3D world.
 */
export declare class Instance3D extends Instance {
    /** Flag indicates local space properties are retrieved from this instance */
    needsLocalUpdate: boolean;
    /** Flag indicates world space properties are retrieved from this instance */
    needsWorldUpdate: boolean;
    /**
     * This is the 3D transform that will place this object within the 3D world.
     */
    get transform(): Transform;
    set transform(val: Transform);
    private _transform;
    /**
     * Matrix representing the transform needed to put this instance into world
     * space. Should never edit this directly. Use the transform property or the
     * orientation properties to mutate this transform.
     */
    get matrix(): Mat4x4;
    private _matrix;
    /**
     * Matrix used to represent the transform this object places on itself.
     * Anything using this matrix as it's basis
     */
    get localMatrix(): Mat4x4;
    private _localMatrix;
    /** Local position of the Instance */
    get localPosition(): Vec3;
    set localPosition(val: Vec3);
    private _localPosition;
    /** Local space rotation of the Instance */
    get localRotation(): Quaternion;
    set localRotation(val: Quaternion);
    private _localRotation;
    /** Local axis scale of the instance */
    get localScale(): Vec3;
    set localScale(val: Vec3);
    private _localScale;
    /** World position of the Instance */
    get position(): Vec3;
    set position(val: Vec3);
    private _position;
    /** World space rotation of the Instance */
    get rotation(): Quaternion;
    set rotation(val: Quaternion);
    private _rotation;
    /** Axis scale of the instance */
    get scale(): Vec3;
    set scale(val: Vec3);
    private _scale;
    /**
     * Quick way to work with parent transforms. This is just syntactic sugar so
     * you don't have to instance.transform.parent all the time.
     */
    set parent(val: Instance3D);
    constructor(options: IInstance3DOptions);
    /**
     * This is an ambiguous but simple method that attempts to re-optimize this
     * instance. If you have maybe a one time analysis of an instance over the
     * course of a lengthy period of time, consider calling this.
     *
     * Instances and transforms take the approach of "shifting gears" toward world
     * decomposition after world orientations are queried. However, you may not
     * always need or rarely need a specific world orientation. Thus calling this
     * method will make the instance and transform assume it no longer needs world
     * orientations once again until something queries for it.
     */
    optimize(): void;
}
