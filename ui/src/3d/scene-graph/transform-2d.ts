import {
  apply2,
  apply3,
  decomposeRotation,
  identity2x2,
  identity4x4,
  length4Components,
  Mat4x4,
  multiply4x4,
  oneQuat,
  Quaternion,
  rotation2x2,
  SRT4x4_2D,
  Vec2Compat,
  Vec3,
} from "../../math";
import { UpdateProp } from "../../types.js";
import { Instance2D } from "./instance-2d.js";
import { resolveUpdate, scheduleUpdate } from "./transform-base.js";
import { TreeNode } from "./tree-node.js";

/**
 * This is a transform node that specifically only operates on x y positions and
 * single value rotations. It still is compatible with the 3D node system but
 * significantly reduces operations when only 2D operations are needed.
 */
export class Transform2D extends TreeNode<Transform2D> {
  /** Indicates this transform is queued for an update in the update loop */
  private isQueuedForUpdate = false;
  /**
   * Helper flag indicating it is relevant to have the world orientation
   * decomposed from the world transform.
   */
  private needsWorldOrientation = false;
  /**
   * When this is set, this means the world matrix has updated and has not been
   * decomposed yet.
   */
  private needsWorldDecomposition = false;

  /** This is a special instance listener for the transform */
  private _instance: Instance2D | null = null;
  set instance(val: Instance2D | null) {
    if (this._instance !== val && this._instance) {
      this._instance.transform.instance = null;
      if (val) val.transform = this;
    }

    this._instance = val;
  }

  /**
   * This is the inner matrix that represents the culmination of all the
   * properties into a single transform matrix. It is invalid and will cause
   * undefined behavior if the elements of this matrix are modified. You should
   * use the provided methods of this Transform class to manipulate this matrix.
   *
   * This matrix is what is used to transform coordinates into world space, thus
   * it is also the culmination of all the parent's to this particular
   * transform.
   */
  get matrix(): Mat4x4 {
    this.update();
    return this._matrix.value;
  }
  /**
   * This is the culminated matrix for world space which includes this
   * Transform's changes plus it's parent's changes.
   */
  private _matrix: UpdateProp<Mat4x4> = { value: identity4x4() };
  /**
   * This is the local matrix which represents the transform this Transform
   * performs which does NOT include the parent transforms to this transform.
   */
  private _localMatrix: UpdateProp<Mat4x4> = { value: this._matrix.value };

  /**
   * Translation of this transform in world space.
   */
  get position() {
    this.needsWorldOrientation = true;
    this.update();
    return this._position.value;
  }
  set position(val: Vec3) {
    if (!this.parent) {
      this.localPosition = val;
    } else {
      console.warn(
        "NOT IMPLEMENTED: Setting world position is not supported yet. Use localPosition for now."
      );
    }
  }
  /**
   * The position on the x y axis
   */
  get localPosition() {
    return this._localPosition.value;
  }
  set localPosition(val: Vec2Compat) {
    this._localPosition.value[0] = val[0];
    this._localPosition.value[1] = val[1];
    this._localPosition.didUpdate = true;
    this.invalidate();
  }
  private _position: UpdateProp<Vec3> = { value: [0, 0, 0] };
  private _localPosition: UpdateProp<Vec2Compat> = {
    value: this._position.value,
  };

  /**
   * Orientation of this transform in world space. When no parent is present
   * rotation === localRotation.
   */
  get rotation() {
    this.needsWorldOrientation = true;
    this.update();
    return this._rotation.value;
  }
  set rotation(_val: Quaternion) {
    console.warn(
      "NOT IMPLEMENTED: Setting world rotation for a 2D transform is not supported yet."
    );
  }
  /**
   * Orientation of this transform without it's parent's orientation. When no
   * parent is present rotation === localRotation.
   */
  get localRotation() {
    return this._localRotation.value;
  }
  set localRotation(val: number) {
    this._localRotation.value = val;
    this._localRotation.didUpdate = true;
    this.invalidate();
  }
  private _rotation: UpdateProp<Quaternion> = { value: oneQuat() };
  private _localRotation: UpdateProp<number> = {
    value: 0,
  };
  private localRotationMatrix = identity2x2();

  /**
   * The scale of the Transform in world space. When there is no parent,
   * localScale === scale.
   */
  get scale() {
    this.needsWorldOrientation = true;
    this.update();
    return this._scale.value;
  }
  set scale(val: Vec3) {
    if (!this.parent) {
      this.localScale = val;
    } else {
      console.warn(
        "NOT IMPLEMENTED: Setting world scale is not supported yet. Use localScale for now."
      );
    }
  }
  /**
   * The scale this Transform applies ignoring the parent Transform. When there
   * is no parent, localScale === scale.
   */
  get localScale() {
    return this._localScale.value;
  }
  set localScale(val: Vec2Compat) {
    apply2(this._localScale.value, val[0], val[1]);
    this._localScale.didUpdate = true;
    this.invalidate();
  }
  private _scale: UpdateProp<Vec3> = { value: [1, 1, 1] };
  private _localScale: UpdateProp<Vec2Compat> = { value: this._scale.value };

  /**
   * This method contains the math involved in decomposing our world SRT matrix
   * so we can view the Transform's orientation relative to world space.
   */
  private decomposeWorldMatrix() {
    // If no triggers occurred, we need to not decompose
    if (
      !this.parent ||
      !this.needsWorldDecomposition ||
      !this.needsWorldOrientation
    ) {
      return;
    }

    // Indicate the decomposition has been updated for the current world matrix
    this.needsWorldDecomposition = false;
    const m = this._matrix.value;
    const translation = this._position.value;
    const scale = this._scale.value;

    // Translation is stored in the last row
    this._position.didUpdate =
      translation[0] !== m[12] ||
      translation[1] !== m[13] ||
      translation[2] !== m[14];
    if (this._position.didUpdate) {
      apply3(translation, m[12], m[13], m[14]);
    }

    // Scale is the magnitude of each row vector
    const sx = length4Components(m[0], m[1], m[2], m[3]);
    const sy = length4Components(m[4], m[5], m[6], m[7]);
    const sz = length4Components(m[8], m[9], m[10], m[11]);
    this._scale.didUpdate =
      scale[0] !== sx || scale[1] !== sy || scale[2] !== sz;
    apply3(scale, sx, sy, sz);
    this._scale.didUpdate = true;

    // Use the calculated scale to make a pure rotation matrix from which we can
    // derive a Quaternion for the world orientation.
    // prettier-ignore
    const [a, b, c, d] = this._rotation.value;
    decomposeRotation(this._matrix.value, sx, sy, sz, this._rotation.value);
    const r = this._rotation.value;
    this._rotation.didUpdate =
      r[0] !== a || r[1] !== b || r[2] !== c || r[3] !== d;
  }

  /**
   * Ensures this transform WILL receive an update if it fits requirements for
   * potentially missing an update that may be needed by passive elements.
   */
  queueForUpdate() {
    // If the invalidation did happen, then we check our monitored instance to
    // see if it's actively waiting on any of the transform's properties. If it
    // is, then the invalidation should also immediately trigger an update and
    // trigger the resource updates for the instance.
    if (!this.isQueuedForUpdate && this._instance && this._instance.active) {
      this.isQueuedForUpdate = true;
      scheduleUpdate(this);
    }
  }

  /**
   * If needed, this updates the matrix for this transform. This is called
   * automatically when the matrix is retrieved.
   *
   * The unsafe flag causes this node to update without ensuring it's parents
   * are out of date. Recommended to not use this flag ever. The system handles
   * all of that for you.
   */
  update(unsafe?: boolean) {
    let updateWorldMatrix = false;

    // If this is queued for an update, we can remove it now as it's definitely
    // up to date at this point.
    if (this.isQueuedForUpdate) {
      resolveUpdate(this);
      this.isQueuedForUpdate = false;
    }

    // If this node directly needs an update we should update our local matrix
    if (this.needsUpdate) {
      const R = this.localRotationMatrix;

      if (this._localRotation.didUpdate) {
        rotation2x2(this._localRotation.value, R);
      }

      // Concat the SRT transform in this order Scale -> Rotation -> Translation
      // We utilize our existing matrix to reduce redundant allocations of
      // matrix information.
      SRT4x4_2D(
        this._localScale.value,
        R,
        this._localPosition.value,
        this._localMatrix.value
      );
      this._localMatrix.didUpdate = true;
      // Since we updated the local matrix, let's make sure the world matrix
      // gets updated as well
      updateWorldMatrix = true;
    }

    // If our parent has this node flagged for update, then this means our world
    // matrix is no longer valid.
    if (this.parent) {
      // If the parent node specifically needs an update, then we need to
      // process the updates of all the nodes bubling up the tree
      if (this.parent.needsUpdate) {
        // Flagging this as a child being out of date could mean several nodes
        // up the chain are out of date as well. So we shall update those nodes
        // starting at the top most out of date node, and work our way down
        if (!unsafe) {
          this.processParentUpdates((transform) => {
            transform.update(true);
          });
        }

        updateWorldMatrix = true;
      }

      // If the parent doesn't need updating, but we still have a child
      // unresolved flag set, then we still need the world matrix for this node
      // updated.
      else if (this.parent.childUpdate.has(this)) {
        updateWorldMatrix = true;
      }

      // If something changed that required the world matrix to be recalculated,
      // then let's update it.
      if (updateWorldMatrix) {
        // Apply the world change
        multiply4x4(
          this.parent._matrix.value,
          this._localMatrix.value,
          this._matrix.value
        );
        this._matrix.didUpdate = true;
        this.needsWorldDecomposition = true;
      }
    }

    // Make sure our world orientations are up to date if we updated our world
    // matrix.
    this.decomposeWorldMatrix();

    // Perform all of the triggers needed to update the instance to the latest
    if (this._instance && this._instance.active) {
      if (this._localRotation.didUpdate) {
        (this._instance as any)._localRotation = this._localRotation.value;
      }

      if (this._localPosition.didUpdate) {
        (this._instance as any)._localPosition = this._localPosition.value;
      }

      if (this._localScale.didUpdate) {
        (this._instance as any)._localScale = this._localScale.value;
      }

      // If we don't have a parent, then the local and the world positioning is
      // merged and thus the world needs to be updated based on the local
      if (!this.parent) {
        if (this._localRotation.didUpdate) {
          (this._instance as any)._rotation = this._localRotation.value;
        }

        if (this._localPosition.didUpdate) {
          (this._instance as any)._position = this._localPosition.value;
        }

        if (this._localScale.didUpdate) {
          (this._instance as any)._scale = this._localScale.value;
        }
      } else {
        if (this._rotation.didUpdate) {
          (this._instance as any)._rotation = this._rotation.value;
        }

        if (this._scale.didUpdate) {
          (this._instance as any)._scale = this._scale.value;
        }

        if (this._position.didUpdate) {
          (this._instance as any)._position = this._position.value;
        }
      }

      // Trigger updates for the instance
      if (this._matrix.didUpdate || this._localMatrix.didUpdate) {
        this._instance.transform = this;
      }
    }

    this._localScale.didUpdate = false;
    this._localRotation.didUpdate = false;
    this._localPosition.didUpdate = false;
    this._rotation.didUpdate = false;
    this._scale.didUpdate = false;
    this._position.didUpdate = false;
    this._matrix.didUpdate = false;
    this._localMatrix.didUpdate = false;

    this.resolve();
  }
}
