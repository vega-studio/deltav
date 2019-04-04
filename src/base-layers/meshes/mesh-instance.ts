import { observable } from "../../instance-provider";
import { IInstanceOptions, Instance } from "../../instance-provider/instance";
import { Image } from "../../primitives/image";
import { ImageAtlasResource, ImageRasterizer } from "../../surface";
import { quaternion, Vec3, Vec4 } from "../../util";

export interface IMeshInstanceOptions extends IInstanceOptions {
  color: Vec4;
  element: HTMLImageElement;
  position?: Vec3;
}

type RasterizationReference = {
  resource: ImageAtlasResource;
  references: number;
};

const rasterizationLookUp = new Map<
  string | HTMLElement,
  RasterizationReference
>();

export class MeshInstance extends Instance implements Image {
  @observable color: Vec4 = [0, 0, 0, 1];
  @observable transform: Vec4 = [0, 0, 0, 1];
  @observable scale: Vec4 = [1, 1, 1, 1];
  @observable quaternion: Vec4 = quaternion(0, 1, 0, 0);

  private _sourceWidth: number = 0;
  private _sourceHeight: number = 0;
  private _isDestroyed: boolean = false;
  @observable private _rasterization: RasterizationReference;
  private _path: string;
  private _element: HTMLImageElement;
  private _position: Vec3 = [0, 0, 0];

  get sourceWidth() {
    return this._sourceWidth;
  }

  get sourceHeight() {
    return this._sourceHeight;
  }

  get isDestroyed() {
    return this._isDestroyed;
  }

  get element() {
    return this._element;
  }

  get path() {
    return this._path;
  }

  get position() {
    return this._position;
  }

  get resource() {
    return this._rasterization.resource;
  }

  constructor(options: IMeshInstanceOptions) {
    super(options);
    this.color = options.color || this.color;
    this._position = options.position || this._position;
    this.transform = [
      this._position[0],
      this._position[1],
      this._position[2],
      1
    ];

    this._element = options.element;

    let rasterization = rasterizationLookUp.get(this._path || this._element);

    if (rasterization) {
      rasterization.references++;
    }

    if (!rasterization) {
      rasterization = {
        references: 1,
        resource: new ImageAtlasResource(this)
      };

      rasterization.resource.sampleScale =
        rasterization.resource.sampleScale || 1.0;

      ImageRasterizer.renderSync(rasterization.resource);

      rasterizationLookUp.set(this._path || this._element, rasterization);
    }

    this._rasterization = rasterization;
    this._sourceWidth = rasterization.resource.rasterization.world.width;
    this._sourceHeight = rasterization.resource.rasterization.world.height;
  }

  resourceTrigger() {
    this._rasterization = this._rasterization;
  }
}