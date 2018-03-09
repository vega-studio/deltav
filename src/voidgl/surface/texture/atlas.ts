import * as Three from 'three';
import { Bounds } from '../../primitives/bounds';
import { AtlasResource } from './atlas-manager';
import { PackNode } from './pack-node';

/**
 * This represents a single Texture on the gpu that is composed of several smaller textures
 * as a 'look up'.
 */
export class Atlas {
  /** The gl context this atlas is a part of */
  gl: WebGLRenderingContext;
  /** This is the packing of the  */
  packing: PackNode;
  /** This is all of the resources associated with this atlas */
  resources: AtlasResource[] = [];
  /** This is the actual texture object that represents the atlas on the GPU */
  texture: Three.Texture;

  constructor(context: WebGLRenderingContext, width: number, height: number) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    this.texture = new Three.Texture();
    this.texture.generateMipmaps = false;
    this.packing = new PackNode(0, 0, width, height);
  }

  pack(bounds: Bounds, image: HTMLImageElement) {
    const pack = new PackNode(0, 0, bounds.width, bounds.height);
  }
}
