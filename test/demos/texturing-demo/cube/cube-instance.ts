import {
  Color,
  IAtlasResourceRequest,
  IInstance3DOptions,
  ImageInstanceResource,
  ImageVideoResource,
  Instance3D,
  makeObservable,
  observable,
  Size
} from "../../../../src";

/** Customizes a new Cube instance */
export interface ICubeOptions extends IInstance3DOptions {
  topTexture: TextureResource;
  sideTexture: TextureResource;
  /** Sets the dimensions of the cube */
  size?: Size;
  /** Sets the color of the cube */
  color?: Color;
}

type TextureResource = Exclude<ImageInstanceResource, ImageVideoResource>;

/**
 * Represents a cube model within 3D space.
 */
export class CubeInstance extends Instance3D {
  /** Texture for the side of the cube */
  @observable sideTexture: TextureResource;
  /** Texture for the top of the cube */
  @observable topTexture: TextureResource;
  /** Sets the dimensions of the cube */
  @observable size: Size = [1, 1, 1];

  topRequest?: IAtlasResourceRequest;
  sideRequest?: IAtlasResourceRequest;

  constructor(options: ICubeOptions) {
    super(options);
    makeObservable(this, CubeInstance);
    this.size = options.size || this.size;
    this.topTexture = options.topTexture;
    this.sideTexture = options.sideTexture;
  }

  resourceTrigger() {
    this.topTexture = this.topTexture;
    this.sideTexture = this.sideTexture;
  }
}
