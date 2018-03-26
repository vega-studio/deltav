import { SubTexture } from './sub-texture';

export class BaseAtlasResource {
  /** The rasterization metrics of the label */
  rasterization: {
    /**
     * This is an image rendering of the label.
     * WARNING: This will ONLY SOMETIMES be populated. The system can choose
     * when to consume this as it chooses as it can be a major memory eater if
     * permanently left in place. DO NOT RELY on this being available.
     */
    canvas?: HTMLCanvasElement;
    /** The label pixel dimensions as it is rendered to texture space on an atlas */
    texture: {
      height: number;
      width: number;
    };
    /** The label dimensions as it would be rendered in world space */
    world: {
      height: number;
      width: number;
    };
  };
  /**
   * This sets the ratserization of the label to be a larger value on the texture than is rendered within
   * the world space. This allows for techniques to be applied in the shaders to incorporate super sampling
   * or finer grained detail to labels.
   *
   * The default is 1 for a 1 to 1 sample scaling to world space rendering
   */
  sampleScale: number = 1;
  /** Once loaded into the texture, this will be populated */
  texture: SubTexture;
}
