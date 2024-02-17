import { IInstanceOptions, Instance } from "../../instance-provider";
import { Vec2Compat, Vec3 } from "../../math";
import { Transform2D } from "./transform-2d";
export interface IInstance3DOptions extends IInstanceOptions {
    /** The transform object that will manage this instance */
    transform?: Transform2D;
    /** A parent Instance or Transform2D to this instance */
    parent?: Transform2D | Instance2D;
}
/**
 * Basic properties of an instance that exists within a 3D world.
 */
export declare class Instance2D extends Instance {
    /** Flag indicates local space properties are retrieved from this instance */
    needsLocalUpdate: boolean;
    /** Flag indicates world space properties are retrieved from this instance */
    needsWorldUpdate: boolean;
    /**
     * This is the 3D transform that will place this object within the 3D world.
     */
    private _transform;
    get transform(): Transform2D;
    set transform(val: Transform2D);
    /** Local position of the Instance */
    get localPosition(): Vec2Compat;
    set localPosition(val: Vec2Compat);
    private _localPosition;
    /** Local space rotation of the Instance */
    get localRotation(): number;
    set localRotation(val: number);
    private _localRotation;
    /** Local axis scale of the instance */
    get localScale(): Vec2Compat;
    set localScale(val: Vec2Compat);
    private _localScale;
    /** World position of the Instance */
    get position(): Vec3;
    private _position;
    /** World space rotation of the Instance */
    get rotation(): import("../../math").Vec4;
    private _rotation;
    /** Axis scale of the instance */
    get scale(): Vec3;
    private _scale;
    /**
     * Quick way to work with parent transforms. This is just syntactic sugar so
     * you don't have to instance.transform.parent all the time.
     */
    set parent(val: Instance2D);
    constructor(options: IInstance3DOptions);
}
