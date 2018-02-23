import { Matrix4, Vector4 } from 'three';
import { Bounds } from './bounds';
import { IPoint } from './point';
import { ISize } from './size';

export enum AnchorPosition {
  BottomLeft,
  BottomRight,
  Custom,
  Middle,
  MiddleBottom,
  MiddleLeft,
  MiddleRight,
  MiddleTop,
  TopLeft,
  TopRight,
}

const anchorCalculations: {[key: number]: (quad: RotateableQuad<any>) => Vector4} = {
  [AnchorPosition.BottomLeft]: (quad: RotateableQuad<any>) => new Vector4(
    0,
    0,
    0,
    1,
  ),

  [AnchorPosition.BottomRight]: (quad: RotateableQuad<any>) => new Vector4(
    quad.getSize().width,
    0,
    0,
    1,
  ),

  [AnchorPosition.Custom]: (quad: RotateableQuad<any>) => new Vector4(
    0,
    -quad.getSize().height,
    0,
    1,
  ),

  [AnchorPosition.Middle]: (quad: RotateableQuad<any>) => new Vector4(
    quad.getSize().width / 2,
    -quad.getSize().height / 2,
    0,
    1,
  ),

  [AnchorPosition.MiddleBottom]: (quad: RotateableQuad<any>) => new Vector4(
    quad.getSize().width / 2,
    0,
    0,
    1,
  ),

  [AnchorPosition.MiddleLeft]: (quad: RotateableQuad<any>) => new Vector4(
    0,
    -quad.getSize().height / 2,
    0,
    1,
  ),

  [AnchorPosition.MiddleRight]: (quad: RotateableQuad<any>) => new Vector4(
    quad.getSize().width,
    -quad.getSize().height / 2,
    0,
    1,
  ),

  [AnchorPosition.MiddleTop]: (quad: RotateableQuad<any>) => new Vector4(
    quad.getSize().width / 2,
    -quad.getSize().height,
    0,
    1,
  ),

  [AnchorPosition.TopLeft]: (quad: RotateableQuad<any>) => new Vector4(
    0,
    quad.getSize().height,
    0,
    1,
  ),

  [AnchorPosition.TopRight]: (quad: RotateableQuad<any>) => new Vector4(
    quad.getSize().width,
    -quad.getSize().height,
    0,
    1,
  ),
};

export class RotateableQuad<T> extends Bounds<T> {
  // These are the vertex locations of the four corners of the quad
  BL: Vector4;
  BR: Vector4;
  TL: Vector4;
  TR: Vector4;

  /** This is the anchor point where location and rotation is based on */
  private anchor: Vector4;
  /** This auto sets where the anchor point should be located */
  private anchorType: AnchorPosition;
  /** This will contain all of the results of the transform after the metrics have been applied to the vertices */
  private base: Vector4[];
  /** This sets the location of the quad with it's anchor point set to this spot in world coordinates */
  private location: IPoint;
  /** Specifies rotation, in radians, around the anchor */
  private rotation: number;
  /** Specifies how wide and high the quad is */
  private size: ISize;
  /** This contains the transform */
  private transform: Matrix4;
  /** This determines if any metric has changed. If so, then the update must recalculate */
  private isDirty: boolean;

  /**
   * Generates a quad
   *
   * @param {IPoint} location The location of the quad (it's anchorpoint will be placed here)
   * @param {number} width The width of the quad
   * @param {number} height The height of the quad
   * @param {AnchorPosition} anchor The anchor location of the quad.
   *                                Location and rotation will be relative to this.
   */
  constructor(location: IPoint, size: ISize, rotation: number, anchor: AnchorPosition = AnchorPosition.Middle) {
    super(0, 0, 0, 0);

    // Apply our properties
    this.setSize(size);
    this.setAnchor(anchor);
    this.setLocation(location);
    this.setRotation(rotation);
  }

  /**
   * @private
   * Recalculates this anchor position based on the anchor type
   *
   * @param {AnchorPosition} anchor
   */
  private calculateAnchor(anchor: AnchorPosition) {
    this.anchor = anchorCalculations[anchor](this);
  }

  /**
   * Get the base size of the quad
   *
   * @returns {ISize} The base size of this quad
   */
  getSize(): ISize {
    return this.size;
  }

  /**
   * Sets the specified anchor position on the quad
   *
   * @param {AnchorPosition} anchor This specifies an auto calculated position for the anchor
   * @param {IPoint} custom If specified, will set a custom anchor location rather
   *                        than the calculated version.
   */
  setAnchor(anchor: AnchorPosition = AnchorPosition.Middle, custom?: IPoint) {
    this.isDirty = true;
    this.anchorType = anchor;

    // Apply the custom position if present
    if (custom) {
      this.anchorType = AnchorPosition.Custom;
      this.anchor = new Vector4(custom.x, custom.y, 0, 1);
      return;
    }

    this.calculateAnchor(anchor);
  }

  /**
   * Retrieves the position of the anchor
   *
   * @param worldSpace If this is true, this will calculate the anchor's position relative to world
   *                   coordinates.
   */
  getAnchor(worldSpace?: boolean): IPoint {
    if (worldSpace) {
      this.update();
      // Get a copy of the anchor so we don't modify it
      const worldAnchor = this.anchor.clone();
      // Correct the anchor y positioning to offset the transforms use of the anchor
      worldAnchor.y = -this.anchor.y;
      // Apply the transform to the anchor to get it's world position
      worldAnchor.applyMatrix4(this.transform);

      return worldAnchor;
    }

    return this.anchor;
  }

  getAnchorType() {
    return this.anchorType;
  }

  /**
   * This sets the location of this quad to a given position where the anchor
   * point will be located on top of the location provided.
   *
   * @param {IPoint} location The location to place the quad
   */
  setLocation(location: IPoint) {
    this.isDirty = true;
    this.location = location;
  }

  getLocation() {
    return this.location;
  }

  /**
   * Sets the rotation of this quad, in radians, rotated around the anchor point.
   *
   * @param {number} rotation The rotation of the quad
   */
  setRotation(rotation: number) {
    this.isDirty = true;
    this.rotation = rotation;
  }

  /**
   * get Rotation
   */
  getRotation() {
    return this.rotation;
  }

  /**
   * get direction as a point
   */
  getDirection() {
    const angle = this.rotation;
    return{
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
  }

  /**
   * Applies the size to the base
   *
   * @param {ISize} size The size of the base quad
   */
  setSize(size: ISize) {
    this.isDirty = true;
    this.size = size;

    this.base = [
      new Vector4(0, size.height, 0, 1),
      new Vector4(size.width, size.height, 0, 1),
      new Vector4(0, 0, 0, 1),
      new Vector4(size.width, 0, 0, 1),
    ];

    if (this.anchorType && this.anchorType !== AnchorPosition.Custom) {
      this.calculateAnchor(this.anchorType);
    }
  }

  /**
   * This re-calculates the transform for this quad and applies the transform to
   * the corners.
   */
  update() {
    if (this.isDirty) {
      // Calculate the pieces of the transformation
      const anchorMat: Matrix4 = new Matrix4().makeTranslation(-this.anchor.x, this.anchor.y, 0);
      const rotationMat: Matrix4 = new Matrix4().makeRotationZ(this.rotation);
      const locationMat: Matrix4 = new Matrix4().makeTranslation(this.location.x, this.location.y, 0);

      // Compose the transform based on the pieces and apply them
      // In the proper compositing order
      this.transform = new Matrix4()
        .multiply(locationMat)
        .multiply(rotationMat)
        .multiply(anchorMat)
      ;

      // Apply the transform to all of our base vertices
      this.TL = this.base[0].clone().applyMatrix4(this.transform);
      this.TR = this.base[1].clone().applyMatrix4(this.transform);
      this.BL = this.base[2].clone().applyMatrix4(this.transform);
      this.BR = this.base[3].clone().applyMatrix4(this.transform);

      // Update the bounds of this object
      this.x = this.TL.x;
      this.y = this.TL.y;
      this.width = 1;
      this.height = 1;
      this.encapsulatePoints([this.TR, this.BL, this.BR]);

      // Flag as no longer needing updates
      this.isDirty = false;
    }
  }
}
