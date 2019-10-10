import { Bounds } from '../../math/primitives/bounds';
import { SubTexture } from './sub-texture';

/**
 * Helps us track the bounds of the image being loaded in tied in with the
 * texture it represents
 */
export interface IPackNodeDimensions<T> {
  data: T;
  bounds: Bounds<any>;
}

/**
 * This is used specifically by the atlas manager to aid in packing
 * in textures within an area. This will guarantee boundaries of textures are
 * not violated and provide proper feedback for where to draw a given image
 */
export class PackNode<T> {
  child: [PackNode<T> | null, PackNode<T> | null] = [null, null];
  isLeaf: boolean = true;
  bounds: Bounds<any>;
  data: T | null = null;

  constructor(x: number, y: number, width: number, height: number) {
    this.bounds = new Bounds({
      height,
      width,
      x,
      y,
    });
  }

  /**
   * Deletes all of the sub nodes in this Mapping, thus clearing up memory usage
   */
  destroy() {
    const child0 = this.child[0];
    const child1 = this.child[1];
    this.data = null;
    if (child0) {
      child0.destroy();
    }
    if (child1) {
      child1.destroy();
    }
    this.child[0] = null;
    this.child[1] = null;
  }

  /**
   * Indicates if there is a child
   */
  hasChild(): boolean {
    const child0 = this.child[0];
    const child1 = this.child[1];
    if (child0 && !child0.data) {
      return !child0.isLeaf;
    }
    if (child1 && !child1.data) {
      return !child1.isLeaf;
    }
    return false;
  }

  /**
   * Inserts images into our mapping, fitting them appropriately
   */
  insert(image: IPackNodeDimensions<T>): PackNode<T> | null {
    let child0 = this.child[0];
    let child1 = this.child[1];

    if (!this.isLeaf && child0 && child1) {
      // Try inserting into first child
      const newNode: PackNode<T> | null = child0.insert(image);
      if (newNode !== null) return newNode;
      // No room in first so insert into second
      return child1.insert(image);
    } else {
      // If there's already an image here, return
      if (this.data) return null;
      // Check the fit status of the image in this nodes rectangle space
      const fitFlag: number = this.bounds.fits(image.bounds);
      // If we're too small, return null indicating can not fit
      if (fitFlag === 0) return null;

      // If we're just right, accept
      if (fitFlag === 1) {
        this.data = image.data;
        return this;
      }

      // Otherwise, gotta split this node and create some leaves
      this.isLeaf = false;
      // Get the image width
      const imgWidth: number = image.bounds.width;
      const imgHeight: number = image.bounds.height;
      // Decide which way to split
      const dWidth: number = this.bounds.width - imgWidth;
      const dHeight: number = this.bounds.height - image.bounds.height;

      if (dWidth > dHeight) {
        child0 = this.child[0] = new PackNode(
          this.bounds.x,
          this.bounds.y,
          imgWidth,
          this.bounds.height
        );
        child1 = this.child[1] = new PackNode(
          this.bounds.x + imgWidth,
          this.bounds.y,
          dWidth,
          this.bounds.height
        );
      } else {
        child0 = this.child[0] = new PackNode(
          this.bounds.x,
          this.bounds.y,
          this.bounds.width,
          imgHeight
        );
        child1 = this.child[1] = new PackNode(
          this.bounds.x,
          this.bounds.y + imgHeight,
          this.bounds.width,
          dHeight
        );
      }
    }

    // Insert into first child we created
    return child0.insert(image);
  }

  /**
   * Removes the image from the mapping and tries to open up as much space as possible.
   *
   * @param {AtlasTexture} data The image to insert into the
   */
  remove(data: T): boolean {
    const child0 = this.child[0];
    const child1 = this.child[1];

    if (child1 && child0 && !this.isLeaf) {
      // Try removing from first child
      let removed: boolean = child0.remove(data);
      if (removed) return true;
      // Try remove from second
      removed = child1.remove(data);

      if (!child0.hasChild()) {
        if (!child1.hasChild()) {
          this.child[0] = null;
          this.child[1] = null;
        }
      }

      return removed;
    } else {
      if (this.data === data) {
        this.data = null;

        return true;
      } else {
        return false;
      }
    }
  }

  /**
   * Applies a node's bounds to SubTexture.
   */
  static applyToSubTexture<T>(
    root: PackNode<T>,
    node: PackNode<T> | Bounds<T>,
    texture?: SubTexture,
    padding?: { top: number; left: number; right: number; bottom: number },
    flipY?: boolean
  ) {
    if (!texture) return;

    padding = padding || {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    };

    const bounds = node instanceof PackNode ? node.bounds : node;

    // Set our image's atlas properties
    const ux = (bounds.x + padding.left) / root.bounds.width;
    const uy = (bounds.y + padding.top) / root.bounds.height;
    const uw =
      (bounds.width - padding.left - padding.right) / root.bounds.width;
    const uh =
      (bounds.height - padding.top - padding.bottom) / root.bounds.height;

    let atlasDimensions: Bounds<never>;

    if (flipY) {
      atlasDimensions = new Bounds({
        bottom: 1.0 - uy,
        left: ux,
        right: ux + uw,
        top: 1.0 - (uy + uh),
      });
    } else {
      atlasDimensions = new Bounds({
        top: 1.0 - uy,
        left: ux,
        right: ux + uw,
        bottom: 1.0 - (uy + uh),
      });
    }

    const bottom = atlasDimensions.bottom;
    const top = atlasDimensions.y;
    const left = atlasDimensions.x;
    const right = atlasDimensions.x + atlasDimensions.width;

    texture.atlasTL = [left, top];
    texture.atlasBR = [right, bottom];
    texture.atlasBL = [left, bottom];
    texture.atlasTR = [right, top];
    texture.widthOnAtlas = Math.abs(texture.atlasTR[0] - texture.atlasTL[0]);
    texture.heightOnAtlas = Math.abs(texture.atlasTR[1] - texture.atlasBR[1]);
    texture.pixelWidth = uw * root.bounds.width;
    texture.pixelHeight = uh * root.bounds.height;
  }
}
