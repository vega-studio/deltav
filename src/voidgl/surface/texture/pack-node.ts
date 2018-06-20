import { Bounds } from '../../primitives/bounds';
import { SubTexture } from './sub-texture';

/**
 * Helps us track the bounds of the image being loaded in tied in with the
 * texture it represents
 */
export interface ImageDimensions {
  first: SubTexture;
  second: Bounds;
}

/**
 * This is used specifically by the atlas manager to aid in packing
 * in textures within an area. This will guarantee boundaries of textures are
 * not violated and provide proper feedback for where to draw a given image
 */
export class PackNode {
  child: [PackNode | null, PackNode | null] = [null, null];
  isLeaf: boolean = true;
  nodeDimensions: Bounds;
  nodeImage: SubTexture | null = null;

  constructor(x: number, y: number, width: number, height: number) {
    this.nodeDimensions = new Bounds({
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
    this.nodeImage = null;
    if (child0) { child0.destroy(); }
    if (child1) { child1.destroy(); }
    this.child[0] = null;
    this.child[1] = null;
  }

  /**
   * Indicates if there is a child
   */
  hasChild(): boolean {
    const child0 = this.child[0];
    const child1 = this.child[1];
    if (child0 && !child0.nodeImage) { return !child0.isLeaf; }
    if (child1 && !child1.nodeImage) { return !child1.isLeaf; }
    return false;
  }

  /**
   * Inserts images into our mapping, fitting them appropriately
   */
  insert(image: ImageDimensions): PackNode | null {
    let child0 = this.child[0];
    let child1 = this.child[1];

    if (!this.isLeaf && child0 && child1) {
      // Try inserting into first child
      const newNode: PackNode | null = child0.insert(image);
      if (newNode !== null) { return newNode; }
      // No room in first so insert into second
      return child1.insert(image);
    }

    else {
      // If there's already an image here, return
      if (this.nodeImage) { return null; }
      // Check the fit status of the image in this nodes rectangle space
      const fitFlag: number = this.nodeDimensions.fits(image.second);
      // If we're too small, return null indicating can not fit
      if (fitFlag === 0) { return null; }
      // If we're just right, accept
      if (fitFlag === 1) { return this; }

      // Otherwise, gotta split this node and create some leaves
      this.isLeaf = false;
      // Get the image width
      const imgWidth: number = image.second.width;
      const imgHeight: number = image.second.height;
      // Decide which way to split
      const dWidth: number = this.nodeDimensions.width - imgWidth;
      const dHeight: number = this.nodeDimensions.height - image.second.height;

      if (dWidth > dHeight) {
        child0 = this.child[0] = new PackNode(this.nodeDimensions.x, this.nodeDimensions.y, imgWidth, this.nodeDimensions.height);
        child1 = this.child[1] = new PackNode(this.nodeDimensions.x + imgWidth, this.nodeDimensions.y, dWidth, this.nodeDimensions.height);
      } else {
        child0 = this.child[0] = new PackNode(this.nodeDimensions.x, this.nodeDimensions.y  , this.nodeDimensions.width, imgHeight);
        child1 = this.child[1] = new PackNode(this.nodeDimensions.x, this.nodeDimensions.y + imgHeight, this.nodeDimensions.width, dHeight);
      }
    }

    // Insert into first child we created
    return child0.insert(image);
  }

  /**
   * Removes the image from the mapping and tries to open up as much space as possible.
   *
   * @param {AtlasTexture} image The image to insert into the
   */
  remove(image: SubTexture): boolean {
    const child0 = this.child[0];
    const child1 = this.child[1];

    if (child1 && child0 && !this.isLeaf) {
      // Try removing from first child
      let removed: boolean = child0.remove(image);
      if (removed) { return true; }
      // Try remove from second
      removed = child1.remove(image);

      if (!child0.hasChild()) {
        if (!child1.hasChild()) {
          this.child[0] = null;
          this.child[1] = null;
        }
      }

      return removed;
    }

    else {
      if (this.nodeImage === image) {
        this.nodeImage = null;
        delete image.atlasReferenceID;
        image.pixelWidth = 0;
        return true;
      }

      else {
        return false;
      }
    }
  }
}
