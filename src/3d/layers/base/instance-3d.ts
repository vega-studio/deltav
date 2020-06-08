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
    if (this._position !== val.position) this._position = val.position;
    if (this._rotation !== val.rotation) this._rotation = val.rotation;
    if (this.scale !== val.scale) this._scale = val.scale;
    val.instance = this;
    this._transform = val;
  }

  /** World position of the Instance */
  get position() {
    return this._position;
  }
  @observable private _position: Vec3;

  /** Rotation of the Instance */
  get rotation() {
    return this._rotation;
  }
  @observable private _rotation: Quaternion;

  /** Axis scale of the instance */
  get scale() {
    return this._scale;
  }
  @observable private _scale: Vec3;

  constructor(options: IInstance3DOptions) {
    super(options);
    const transform = options.transform || new Transform();
    this.transform = transform;
  }
}
