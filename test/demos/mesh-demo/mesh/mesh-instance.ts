import {
  IAtlasResourceRequest,
  IInstanceOptions,
  ImageInstanceResource,
  Instance,
  observable,
  Vec3,
  Vec4
} from "../../../../src";

export interface IMeshInstanceOptions extends IInstanceOptions {
  color: Vec4;
  // element: HTMLImageElement;
  position?: Vec3;
  source: ImageInstanceResource;
  onError?(): void;
  onReady?(image: MeshInstance, video?: HTMLVideoElement): void;
}

export class MeshInstance extends Instance {
  @observable color: Vec4 = [1, 0, 0, 1];
  @observable transform: Vec4 = [0, 0, 0, 1];
  @observable scale: Vec4 = [1, 1, 1, 1];
  @observable quaternion: Vec4 = [1, 0, 0, 0];
  @observable source: ImageInstanceResource;

  // private _path: string;
  // private _element: HTMLImageElement;
  private _position: Vec3 = [0, 0, 0];

  onError?: IMeshInstanceOptions["onError"];
  onReady?: IMeshInstanceOptions["onReady"];
  request?: IAtlasResourceRequest;

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

    // this._element = options.element;
    this.source = options.source;
    this.onReady = options.onReady;
  }

  resourceTrigger() {
    this.source = this.source;

    if (this.request && this.request.texture) {
      console.warn(this.request.texture);
    }

    if (this.onReady) this.onReady(this);
  }
}
