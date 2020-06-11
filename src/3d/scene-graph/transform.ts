import {
  apply3,
  concat4x4,
  decomposeRotation,
  forward3,
  identity4,
  inverse3,
  length4,
  lookAtQuat,
  Mat4x4,
  matrix4x4FromUnitQuatModel,
  matrix4x4FromUnitQuatView,
  multiply4x4,
  oneQuat,
  Quaternion,
  rotateVectorByUnitQuat,
  scale3,
  scale4x4by3,
  subtract3,
  translation4x4by3,
  Vec3
} from "../../math";
import { onAnimationLoop } from "../../util/frame";
import { Instance3D } from "../layers";
import { TreeNode } from "./tree-node";

type UpdateProp<T> = {
  didUpdate?: boolean;
  value: T;
};

/**
 * Stores transforms that MUST be updated for the sake of instances waiting for
 * updates from the transform. Due to our instances being passive and our
 * TreeNode structure being passive, this is our glue that detects the instances
 * that WOULD have actively requested the update but won't due to passively
 * waiting without interaction.
 */
const updateTransform = new Set<Transform>();

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
   * Flag that indicates this transform has a matrix that performs the
   * operations in reverse (such as for a camera.)
   */
  private hasViewMatrix: boolean = false;
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
  /**
   * This is the culminated matrix for world space which includes this
   * Transform's changes plus it's parent's changes.
   */
  private _matrix: UpdateProp<Mat4x4> = { value: identity4() };
  /**
   * This is the local matrix which represents the transform this Transform
   * performs which does NOT include the parent transforms to this transform.
   */
  private _localMatrix: UpdateProp<Mat4x4> = { value: this._matrix.value };
  /**
   * When this is set, this means the values located within the rotation,
   * position, and scale need to be calculated via decomposition from the world
   * matrix.
   */
  private needsWorldDecomposition: boolean = false;

  /**
   * This is the transform matrix that contains the operations in reverse order.
   * This produces a 'view matrix' for the transform and shouldn't be considered
   * an inverse matrix. This is commonly used for Camera constructs whos
   * orientation is reverse to the world (the camera would exist in world space
   * using the normal world matrix, but the operations to transform everything
   * to the cameras perspective is in the exact opposite order.)
   *
   * Currently, the viewMatrix does NOT consider parenting.
   */
  get viewMatrix(): Mat4x4 {
    this.hasViewMatrix = true;
    if (this._viewMatrix === void 0) this.invalidate();
    this.update();
    if (this._viewMatrix === void 0) return identity4();
    return this._viewMatrix;
  }
  private _viewMatrix?: Mat4x4;

  /**
   * Orientation of this transform in world space. When no parent is present
   * rotation === localRotation.
   */
  get rotation() {
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
    apply3(this._localRotation.value, val[0], val[1], val[2]);
    this._localRotation.didUpdate = true;
    this.invalidate();
    this.needsForwardUpdate = true;
    this.needsWorldDecomposition = true;
  }
  private _rotation: UpdateProp<Quaternion> = { value: oneQuat() };
  private _localRotation: UpdateProp<Quaternion> = {
    value: this._rotation.value
  };
  private localRotationMatrix: Mat4x4 = identity4();

  /**
   * The scale of the Transform in world space. When there is no parent,
   * localScale === scale.
   */
  get scale() {
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
  private scaleMatrix: Mat4x4 = identity4();

  /**
   * Translation of this transform in world space. When there is no parent,
   * position === localPosition.
   */
  get position() {
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
    value: this._position.value
  };
  private translationMatrix: Mat4x4 = identity4();

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
  private needsForwardUpdate: boolean = false;

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
    // If something triggered an
    if (!this.parent || !this.needsWorldDecomposition) {
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
    const sx = length4([m[0], m[1], m[2], m[3]]);
    const sy = length4([m[4], m[5], m[6], m[7]]);
    const sz = length4([m[8], m[9], m[10], m[11]]);
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
  lookAtLocal(position: Vec3, up: Vec3) {
    this.localRotation = lookAtQuat(
      subtract3(position, this._localPosition.value),
      up
    );
    this._localRotation.didUpdate = true;
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
      this._forward = this._localForward;
      this._matrix = this._localMatrix;
      this._rotation = this._localRotation;
      this._scale = this._localScale;
      this._position = this._localPosition;
      this.needsWorldDecomposition = false;
    }

    // Once we set a parent matrix, this transform must handle a dividing moment
    // where the world and local properties are no longer equivalent.
    else if (!this.parent) {
      this._forward.value = forward3();
      this._matrix.value = identity4();
      this._rotation.value = oneQuat();
      this._scale.value = [1, 1, 1];
      this._position.value = [0, 0, 0];
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
      updateTransform.add(this);
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
      updateTransform.delete(this);
      this.isQueuedForUpdate = false;
    }

    // If this node directly needs an update we should update our local matrix
    if (this.needsUpdate) {
      const S = this.scaleMatrix;

      if (this._localScale.didUpdate) {
        scale4x4by3(this._localScale.value, S);
      }

      const R = this.localRotationMatrix;

      if (this._localRotation.didUpdate) {
        matrix4x4FromUnitQuatModel(this._localRotation.value, R);
      }

      const T = this.translationMatrix;

      if (this._localPosition.didUpdate) {
        translation4x4by3(this._localPosition.value, T);
      }

      // Concat the SRT transform in this order Scale -> Rotation -> Translation
      // We utilize our existing matrix to reduce redundant allocations of
      // matrix information.
      multiply4x4(
        T,
        multiply4x4(R, S, this._localMatrix.value),
        this._localMatrix.value
      );
      this._localMatrix.didUpdate = true;
      // Since we updated the local matrix, let's make sure the world matrix
      // gets updated as well
      updateWorldMatrix = true;

      if (this.hasViewMatrix) {
        if (this._viewMatrix === void 0) {
          this._viewMatrix = identity4();
        }
        // When generating this transform, it is important to remember that when
        // you envision the camera looking at something, everything else is in
        // the exact opposite orientation to the camera. Remember: this view
        // matrix gets APPLIED to geometry to orient it correclty to the camera.
        // Thus the world is being moved for the sake of the camera, the camera
        // itself is not moving. THUS: all operations to make this matrix will
        // be the INVERSE of where the camera is physically located and oriented
        concat4x4(
          this._viewMatrix,
          // The world looks at the camera. The camera does not look at the world
          matrix4x4FromUnitQuatView(this._localRotation.value),
          // The world moves to align itself with the camera's position
          translation4x4by3(scale3(this._localPosition.value, -1)),
          // The world condenses and expands to fit the camera
          scale4x4by3(inverse3(this._localScale.value))
        );
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
          this.processParentUpdates(transform => {
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
        // Flag our world orientation calculations for needing an update by
        // decomposing our new world matrix
        this.needsWorldDecomposition = true;
        // Apply the world change
        multiply4x4(
          this._localMatrix.value,
          this.parent._matrix.value,
          this._matrix.value
        );
        this._matrix.didUpdate = true;
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
      this._instance.transform = this;
    }

    this._localScale.didUpdate = false;
    this._localRotation.didUpdate = false;
    this._localPosition.didUpdate = false;
    this._rotation.didUpdate = false;
    this._scale.didUpdate = false;
    this._position.didUpdate = false;

    this.resolve();
  }
}

/**
 * We create a looping function to ensure the transforms that MUST be updated
 * for instances are dequeued and properly updated.
 */
const updateLoop = async () => {
  // This pattern guarantees an always running loop that can not be stopped. The
  // animation loop will continue forever and also cause a Promise that will
  // never resolve. The Promise resolves only when the loop is stopped somehow,
  // which we then immediately start our loop back up again.
  await onAnimationLoop(
    () => {
      updateTransform.forEach(t => t.update());
    },
    undefined,
    Number.POSITIVE_INFINITY
  );

  updateLoop();
};

updateLoop();

export const IdentityTransform: Readonly<Transform> = new Transform();
