import {
  IInstanceOptions,
  Instance,
  observable
} from "../../../instance-provider";
import { Quaternion, Vec3 } from "../../../math";
import { Transform } from "../../scene-graph";

export interface IInstance3DOptions extends IInstanceOptions {
  /** The transform object that will manage this instance */
  transform?: Transform;
  /** A parent Instance or Transform to this instance */
  parent?: Transform | Instance3D;
}

/**
 * Basic properties of an instance that exists within a 3D world.
 */
export class Instance3D extends Instance {
  /**
   * This is the 3D transform that will place this object within the 3D world.
   */
  @observable private _transform: Transform;
  get transform() {
    return this._transform;
  }
  set transform(val: Transform) {
    if (!this._transform) {
      this._position = val.position;
      this._rotation = val.rotation;
      this._scale = val.scale;
      this._localPosition = val.localPosition;
      this._localRotation = val.localRotation;
      this._localScale = val.localScale;
    }

    val.instance = this;
    this._transform = val;
  }

  /** Local position of the Instance */
  get localPosition() {
    return this._localPosition;
  }
  set localPosition(val: Vec3) {
    this.transform.localPosition = val;
  }
  @observable private _localPosition: Vec3;

  /** Local space rotation of the Instance */
  get localRotation() {
    return this._localRotation;
  }
  set localRotation(val: Quaternion) {
    this.transform.localRotation = val;
  }
  @observable private _localRotation: Quaternion;

  /** Local axis scale of the instance */
  get localScale() {
    return this._localScale;
  }
  set localScale(val: Vec3) {
    this.transform.localScale = val;
  }
  @observable private _localScale: Vec3;

  /** World position of the Instance */
  get position() {
    return this._position;
  }
  set position(val: Vec3) {
    this.transform.position = val;
  }
  @observable private _position: Vec3;

  /** World space rotation of the Instance */
  get rotation() {
    return this._rotation;
  }
  set rotation(val: Quaternion) {
    this.transform.rotation = val;
  }
  @observable private _rotation: Quaternion;

  /** Axis scale of the instance */
  get scale() {
    return this._scale;
  }
  set scale(val: Vec3) {
    this.transform.scale = val;
  }
  @observable private _scale: Vec3;

  /**
   * Quick way to work with parent transforms. This is just syntactic sugar so
   * you don't have to instance.transform.parent all the time.
   */
  set parent(val: Instance3D) {
    this.transform.parent = val.transform;
  }

  constructor(options: IInstance3DOptions) {
    super(options);
    const transform = options.transform || new Transform();
    this.transform = transform;

    if (options.parent) {
      if (options.parent instanceof Instance3D) {
        this.parent = options.parent;
      } else {
        this.transform.parent = options.parent;
      }
    }
  }
}
