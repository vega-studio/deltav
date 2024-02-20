import {
  apply3,
  apply4,
  copy4x4,
  decomposeRotation,
  forward3,
  identity3,
  identity4,
  inverse3,
  length4Components,
  lookAtQuat,
  M3R,
  M4R,
  Mat4x4,
  matrix3x3FromUnitQuatModel,
  multiply4x4,
  oneQuat,
  Quaternion,
  rotateVectorByUnitQuat,
  scale3,
  SRT4x4,
  subtract3,
  transpose3x3,
  TRS4x4,
  V3R,
  Vec3,
} from "../../math";
import { Instance3D } from "./instance-3d";
import { resolveUpdate, scheduleUpdate } from "./transform-base";
import { TreeNode } from "./tree-node";
import { UpdateProp } from "../../types";

/**
 * The initial properties of the transform on creation
 */
export interface ITransform {
  /** Starting position in local space */
  localPosition?: Vec3;
  /** Starting rotation in local space */
  localRotation?: Quaternion;
  /** Starting scale in local space */
  localScale?: Vec3;
  /** A parent transform relative to this transform */
  parent?: Transform;
}

/**
 * This is a wrapper for a 3D matrix for transforming coordinates from one
 * vector space to another. Follows the order of ISROT: Identity, Scale,
 * Rotation, Origin, Translation. However, this only provides the SRT properties
 * for simpler affine transforms.
 *
 * This class also helps manage a balance between local and world information
 * needed for the transform.
 *
 * This operates with less information and less calculations when only the local
 * orientations are used (or no parent is set).
 */
export class Transform extends TreeNode<Transform> {
  /** Indicates this transform is queued for an update in the update loop */
  private isQueuedForUpdate = false;
  /**
   * Helper flag indicating it is relevant to have the world orientation
   * decomposed from the world transform.
   */
  private needsWorldOrientation = false;
  /**
   * Flag indicates the world matrix has been updated but has not been through
   * a decomposition yet.
   */
  private needsWorldDecomposition = false;
  /**
   * Flag that indicates this transform has a matrix that performs the
   * operations in reverse (such as for a camera.)
   */
  private hasViewMatrix = false;

  /** This is a special instance listener for the transform */
  private _instance: Instance3D | null = null;
  set instance(val: Instance3D | null) {
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
  private _matrix: UpdateProp<Mat4x4> = { value: identity4() };

  /**
   * This is the local matrix which represents the transform this Transform
   * performs which does NOT include the parent transforms to this transform.
   */
  get localMatrix(): Mat4x4 {
    this.update();
    return this._localMatrix.value;
  }
  private _localMatrix: UpdateProp<Mat4x4> = { value: this._matrix.value };

  /**
   * This is the transform matrix that contains the operations in reverse order.
   * This produces a 'view matrix' for the transform and shouldn't be considered
   * an inverse matrix. This is commonly used for Camera constructs whos
   * orientation is reverse to the world (the camera would exist in world space
   * using the normal world matrix, but the operations to transform everything
   * to the cameras perspective is in the exact opposite order.)
   */
  get viewMatrix(): Mat4x4 {
    this.hasViewMatrix = true;
    if (this._viewMatrix === void 0) this.invalidate();
    this.update();
    if (this._viewMatrix === void 0) return identity4();
    return this._viewMatrix.value;
  }
  private _viewMatrix?: UpdateProp<Mat4x4>;

  /**
   * This excludes any parent transform information and is the view matrix
   * specific to this transform.
   *
   * This is the transform matrix that contains the operations in reverse order.
   * This produces a 'view matrix' for the transform and shouldn't be considered
   * an inverse matrix. This is commonly used for Camera constructs whos
   * orientation is reverse to the world (the camera would exist in world space
   * using the normal world matrix, but the operations to transform everything
   * to the cameras perspective is in the exact opposite order.)
   */
  get localViewMatrix(): Mat4x4 {
    this.hasViewMatrix = true;
    if (this._localViewMatrix === void 0) this.invalidate();
    this.update();
    if (this._localViewMatrix === void 0) return identity4();
    return this._localViewMatrix.value;
  }
  private _localViewMatrix?: UpdateProp<Mat4x4>;

  /**
   * Transforms can have an additional modification for non-affine or
   * specialized transforms that are generally considered too expensive to keep
   * track of at all times.
   *
   * This is NOT applied to the viewMatrix output. Use localViewTransform for
   * that.
   *
   * Applying this matrix to this Transform will make 'world space' values
   * invalid.
   *
   * Why do world calculations stop working? Since this transform is so generic
   * there is no good way to derive that information anymore.
   */
  get localTransform() {
    return this._localTransform?.value;
  }
  set localTransform(val: Mat4x4 | undefined) {
    if (val) {
      if (!this._localTransform) this._localTransform = { value: identity4() };
      copy4x4(val, this._localTransform.value);
      this._localTransform.didUpdate = true;
    } else {
      delete this._localTransform;
    }

    this.invalidate();
  }
  private _localTransform?: UpdateProp<Mat4x4>;

  /**
   * This is the same as localTransform except it is ONLY applied to the view.
   * We have a transform for the view and the node separated as there are more
   * cases to have specialized view calculations, but require having the node be
   * left unaffected. Such as having elements follow the Camera, but have the
   * camera distort the final output space.
   *
   * Transforms can have an additional modification for non-affine or
   * specialized transforms that are generally considered too expensive to keep
   * track of at all times.
   *
   * Applying this matrix to this Transform will make 'world space' values
   * invalid.
   *
   * Why do world calculations stop working? Since this transform is so generic
   * there is no good way to derive that information anymore.
   */
  get localViewTransform() {
    return this._localViewTransform?.value;
  }
  set localViewTransform(val: Mat4x4 | undefined) {
    if (val) {
      if (!this._localViewTransform) {
        this._localViewTransform = { value: identity4() };
      }
      copy4x4(val, this._localViewTransform.value);
      this._localViewTransform.didUpdate = true;
    } else {
      delete this._localViewTransform;
    }

    this.invalidate();
  }
  private _localViewTransform?: UpdateProp<Mat4x4>;

  /**
   * Orientation of this transform in world space. When no parent is present
   * rotation === localRotation.
   *
   * If localTransform is present, this value may be incorrect.
   */
  get rotation() {
    this.needsWorldOrientation = true;
    this.update();
    return this._rotation.value;
  }
  set rotation(val: Quaternion) {
    if (!this.parent) {
      this.localRotation = val;
    } else {
      console.warn(
        "NOT IMPLEMENTED: Setting world rotation when a parent is present is not supported yet. Use localRotation for now."
      );
    }
  }

  /**
   * Orientation of this transform without it's parent's orientation. When no
   * parent is present rotation === localRotation.
   */
  get localRotation() {
    return this._localRotation.value;
  }
  set localRotation(val: Quaternion) {
    apply4(this._localRotation.value, val[0], val[1], val[2], val[3]);
    this._localRotation.didUpdate = true;
    this.invalidate();
    this.needsForwardUpdate = true;
  }
  private _rotation: UpdateProp<Quaternion> = { value: oneQuat() };
  private _localRotation: UpdateProp<Quaternion> = {
    value: this._rotation.value,
  };
  private localRotationMatrix = identity3();

  /**
   * The scale of the Transform in world space. When there is no parent,
   * localScale === scale.
   *
   * If localTransform is present, this value may be incorrect.
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
  set localScale(val: Vec3) {
    apply3(this._localScale.value, val[0], val[1], val[2]);
    this._localScale.didUpdate = true;
    this.invalidate();
  }
  private _scale: UpdateProp<Vec3> = { value: [1, 1, 1] };
  private _localScale: UpdateProp<Vec3> = { value: this._scale.value };

  /**
   * Translation of this transform in world space. When there is no parent,
   * position === localPosition.
   *
   * If localTransform is present, this value may be incorrect.
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
   * The position this transform applies ignoring the parent Transform. When
   * there is no parent, position === localPosition.
   */
  get localPosition() {
    return this._localPosition.value;
  }
  set localPosition(val: Vec3) {
    this._localPosition.value[0] = val[0];
    this._localPosition.value[1] = val[1];
    this._localPosition.value[2] = val[2];
    this._localPosition.didUpdate = true;
    this.invalidate();
  }
  private _position: UpdateProp<Vec3> = { value: [0, 0, 0] };
  private _localPosition: UpdateProp<Vec3> = {
    value: this._position.value,
  };

  /**
   * The forward vector for this particular transform in world space. When no
   * parent is present, forward === localForward.
   */
  get forward() {
    if (this.needsForwardUpdate || this.parent?.childUpdate.has(this)) {
      this.needsForwardUpdate = false;
      rotateVectorByUnitQuat(
        forward3(),
        this._rotation.value,
        this._forward.value
      );
    }

    return this._forward.value;
  }
  /**
   * The forward vector for this particular transform ignoring the parent
   * transform. When no parent is present, forward === localForward.
   */
  get localForward() {
    if (this.needsForwardUpdate) {
      this.needsForwardUpdate = false;
      rotateVectorByUnitQuat(
        forward3(),
        this._localRotation.value,
        this._localForward.value
      );
    }

    return this._localForward.value;
  }
  private _forward: UpdateProp<Vec3> = { value: forward3() };
  private _localForward: UpdateProp<Vec3> = { value: this._forward.value };
  private needsForwardUpdate = false;

  constructor(options?: ITransform) {
    super();
    if (!options) return;
    if (options.localPosition) this.localPosition = options.localPosition;
    if (options.localRotation) this.localRotation = options.localRotation;
    if (options.localScale) this.localScale = options.localScale;
    if (options.parent) this.parent = options.parent;
  }

  /**
   * Adjusts the transform's properties all at once to shave off a little bit of
   * overhead.
   */
  applyLocalSRT(scale: Vec3, rotation: Quaternion, translation: Vec3) {
    this._localScale.value = scale;
    this._localPosition.value = translation;
    this._localRotation.value = rotation;
    this._localScale.didUpdate = true;
    this._localPosition.didUpdate = true;
    this._localRotation.didUpdate = true;

    this.invalidate();
    if (this._instance) this._instance.transform = this;
  }

  /**
   * This method contains the math involved in decomposing our world SRT matrix
   * so we can view the Transform's orientation relative to world space.
   */
  private decomposeWorldMatrix() {
    // If no triggers occurred, we need to not decompose
    if (
      !this.needsWorldDecomposition ||
      !this.parent ||
      !this._matrix.didUpdate ||
      this._matrix.value === this._localMatrix.value
    ) {
      return;
    }

    // Check to see if something is utilizing world orientation from either this
    // transform or from the instance itself. If neither are, then we should not
    // decompose the matrix as nothing is reading the value.
    if (this._instance) {
      if (!this._instance.needsWorldUpdate || !this.needsWorldOrientation) {
        return;
      }
    } else if (!this.needsWorldOrientation) {
      return;
    }

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
   * Orients this transform to make the forward direction point toward a
   * position relative to this transform. When no parent is present, lookAt and
   * lookAtLocal behaves exactly the same.
   */
  lookAtLocal(position: Vec3, up?: Vec3) {
    lookAtQuat(
      subtract3(position, this._localPosition.value, V3R[0]),
      up || [0, 1, 0],
      this._localRotation.value
    );
    this._localRotation.didUpdate = true;
    this.invalidate();
    this.needsForwardUpdate = true;
  }

  /**
   * Makes world space and local space information have it's own memory
   * allotment as they should be different after calling this method.
   */
  private divideMemory() {
    this._forward.value = forward3();
    this._matrix.value = identity4();
    this._rotation.value = oneQuat();
    this._scale.value = [1, 1, 1];
    this._position.value = [0, 0, 0];

    if (this.hasViewMatrix && this._viewMatrix && this._localViewMatrix) {
      this._viewMatrix.value = identity4();
    }
  }

  /**
   * Merges local and world space information as they'll be identical.
   */
  private mergeMemory() {
    this._forward.value = this._localForward.value;
    this._matrix.value = this._localMatrix.value;
    this._rotation.value = this._localRotation.value;
    this._scale.value = this._localScale.value;
    this._position.value = this._localPosition.value;

    if (this.hasViewMatrix && this._viewMatrix && this._localViewMatrix) {
      this._viewMatrix.value = this._localViewMatrix.value;
    }
  }

  /**
   * Changes the parent transform of this Transform. This triggers required
   * updates for this Transform.
   */
  setParent(v?: Transform, unsafe?: boolean) {
    if (v === this.parent) return;

    // If we are going into an undefined parent state, then we can merge our
    // world and local values to save on RAM
    if (!v) {
      this.mergeMemory();
    }

    // Once we set a parent matrix, this transform must handle a dividing moment
    // where the world and local properties are no longer equivalent.
    else if (!this.parent) {
      this.divideMemory();
    }

    // Set the parent and flag everything for update
    this.invalidate();
    this.needsForwardUpdate = true;
    this._localScale.didUpdate = true;
    this._localRotation.didUpdate = true;
    this._localPosition.didUpdate = true;

    super.setParent(v, unsafe);
  }

  /**
   * We override the invalidation to aid in handling the issue with our
   * rendering system being "passive" and our node structure to be "passive" as
   * well.
   */
  invalidate() {
    this.queueForUpdate();
    return super.invalidate();
  }

  /**
   * This is an ambiguous but simple method that attempts to re-optimize this
   * transform. If you have maybe a one time analysis of properties over the
   * course of a lengthy period of time, consider calling this.
   *
   * Instances and transforms take the approach of "shifting gears" toward world
   * decomposition after world orientations are queried. However, you may not
   * always need or rarely need a specific world orientation. Thus calling this
   * method will make the instance and transform assume it no longer needs world
   * orientations once again until something queries for it.
   */
  optimize() {
    this.needsWorldOrientation = false;
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
        matrix3x3FromUnitQuatModel(this._localRotation.value, R);
      }

      // Concat the SRT transform in this order Scale -> Rotation -> Translation
      // We utilize our existing matrix to reduce redundant allocations of
      // matrix information.
      if (this._localTransform) {
        // With a local transform we want to make the local transform appended
        // as a last step applied: so translate -> rotate -> scale ->
        // localTransform
        SRT4x4(this._localScale.value, R, this._localPosition.value, M4R[0]);

        multiply4x4(
          this._localTransform.value,
          M4R[0],
          this._localMatrix.value
        );
      } else {
        SRT4x4(
          this._localScale.value,
          R,
          this._localPosition.value,
          this._localMatrix.value
        );
      }

      this._localMatrix.didUpdate = true;
      // Since we updated the local matrix, let's make sure the world matrix
      // gets updated as well
      updateWorldMatrix = true;

      if (this.hasViewMatrix) {
        if (this._viewMatrix === void 0) {
          this._viewMatrix = { value: identity4() };
        }

        // If the localViewMatrix has not been initialized, do it now
        if (this._localViewMatrix === void 0) {
          // We must merge the local and complete matrix depending on the parent
          // status. If there is a parent, the local matrix gets it's own memory
          // space, otherwise local and complete view matrix share the same
          // matrix.
          if (this.parent) {
            this._localViewMatrix = { value: identity4() };
          } else {
            this._localViewMatrix = { value: this._viewMatrix.value };
          }
        }

        // When generating this transform, it is important to remember that when
        // you envision the camera looking at something, everything else is in
        // the exact opposite orientation to the camera. Remember: this view
        // matrix gets APPLIED to geometry to orient it correclty to the camera.
        // Thus the world is being moved for the sake of the camera, the camera
        // itself is not moving. THUS: all operations to make this matrix will
        // be the INVERSE of where the camera is physically located and oriented
        if (this._localViewTransform) {
          TRS4x4(
            inverse3(this._localScale.value, V3R[0]),
            transpose3x3(R, M3R[1]),
            scale3(this._localPosition.value, -1, V3R[1]),
            M4R[0]
          );

          multiply4x4(
            this._localViewTransform.value,
            M4R[0],
            this._localViewMatrix.value
          );
        } else {
          TRS4x4(
            inverse3(this._localScale.value, V3R[0]),
            transpose3x3(R, M3R[1]),
            scale3(this._localPosition.value, -1, V3R[1]),
            this._localViewMatrix.value
          );
        }

        this._localViewMatrix.didUpdate = true;
      }
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

        // Update view matrices as well if present. This is a little more costly
        // than normal matrix chaining as we don't accidentally force parent
        // matrices to support having their own view matrix. View matrices need
        // to be a bit more isolated as they are a much rarer occurrence in
        // these types of display trees. So, to prevent creation and chaining of
        // view matrices, we simply calculate the parent's world view matrix for
        // it, then apply that calculated matrix to our local view matrix.
        if (this.hasViewMatrix && this._viewMatrix && this._localViewMatrix) {
          // If our parent has a view matrix, awesome! Let's use that to speed
          // up calculations.
          if (
            this.parent.hasViewMatrix &&
            this.parent._viewMatrix &&
            this.parent._localViewMatrix
          ) {
            multiply4x4(
              this.parent._viewMatrix.value,
              this._localViewMatrix.value,
              this._viewMatrix.value
            );
          }

          // Otherwise, don't attempt to retrieve the matrix lest we
          // accidentally casue the parent to generate a view matrix which is
          // not ideal.
          else {
            // Get a complete rotation transform in world space for the parent
            matrix3x3FromUnitQuatModel(this.parent.rotation, M3R[0]);

            // Generate a view matrix on behalf of the parent using the world
            // orientation of the parent
            TRS4x4(
              inverse3(this.parent._scale.value, V3R[0]),
              transpose3x3(M3R[0], M3R[1]),
              scale3(this.parent._position.value, -1, V3R[1]),
              M4R[0]
            );

            // Use our computed parent view matrix to make the total oriented
            // view happen.
            multiply4x4(
              this._localViewMatrix.value,
              M4R[0],
              this._viewMatrix.value
            );
          }

          this._viewMatrix.didUpdate = true;
        }
      }
    }

    // Make sure our world orientations are up to date if we updated our world
    // matrix.
    this.decomposeWorldMatrix();

    // Perform all of the triggers needed to update the instance to the latest
    // information. If neither matrix had an update, then there is nothing that
    // needs to update for the instance as the matrices are the culmination of
    // all changes that could be made
    if (
      this._instance &&
      this._instance.active &&
      (this._localMatrix.didUpdate || this._matrix.didUpdate)
    ) {
      if (this._instance.needsLocalUpdate) {
        if (this._localRotation.didUpdate) {
          (this._instance as any)._localRotation = this._localRotation.value;
        }

        if (this._localPosition.didUpdate) {
          (this._instance as any)._localPosition = this._localPosition.value;
        }

        if (this._localScale.didUpdate) {
          (this._instance as any)._localScale = this._localScale.value;
        }
      }

      // If we don't have a parent, then the local and the world positioning is
      // merged and thus the world needs to be updated based on the local
      if (this._instance.needsWorldUpdate) {
        if (this.parent) {
          if (this._rotation.didUpdate) {
            (this._instance as any)._rotation = this._rotation.value;
          }

          if (this._scale.didUpdate) {
            (this._instance as any)._scale = this._scale.value;
          }

          if (this._position.didUpdate) {
            (this._instance as any)._position = this._position.value;
          }
        } else {
          if (this._localRotation.didUpdate) {
            (this._instance as any)._rotation = this._localRotation.value;
          }

          if (this._localPosition.didUpdate) {
            (this._instance as any)._position = this._localPosition.value;
          }

          if (this._localScale.didUpdate) {
            (this._instance as any)._scale = this._localScale.value;
          }
        }
      }

      if (this._matrix.didUpdate) {
        (this._instance as any)._matrix = this._matrix.value;
      }

      if (this._localMatrix.didUpdate) {
        (this._instance as any)._localMatrix = this._localMatrix.value;

        if (!this.parent) {
          (this._instance as any)._matrix = this._matrix.value;
        }
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

export const IdentityTransform: Readonly<Transform> = new Transform();
