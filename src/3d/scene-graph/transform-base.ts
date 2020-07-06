import { onAnimationLoop } from "../../util/frame";

/**
 * This is the minimal interface required for a Transform node. This base exists
 * because not all node control is equal. No matter what, this needs to result
 * in output that places a node in 3D space, but there are different levels of
 * dimensionality for how this happens.
 *
 * For instance, the original intent of this interface is to allow for 3D and 2D
 * transform nodes. 3D has the full need of 4x4 matrics to transform
 * orientations into 3D space and rotate on all axis. 2D still needs to be
 * translated into the 3D world, but it's operations are specifically based on a
 * single axis of rotation and x,y coordinates which requires significantly less
 * operations to manage.
 */
export interface ITransformBase {}

/**
 * Stores objects that MUST be updated for the sake of elements waiting for
 * updates from the transform. Due to elements being passive and our
 * TreeNode structure being passive, this is our glue that detects the elements
 * that WOULD have actively requested the update but won't due to passively
 * waiting without interaction.
 */
const updateSet = new Set<{ update(): void }>();

/** Flags an object for an update cycle */
export const scheduleUpdate = updateSet.add.bind(updateSet);
/** Removes an object from needing a scheduled update */
export const resolveUpdate = updateSet.delete.bind(updateSet);

/**
 * We create a looping function to ensure the objects that MUST be updated
 * are dequeued and properly updated.
 */
const updateLoop = async () => {
  // This pattern guarantees an always running loop that can not be stopped. The
  // animation loop will continue forever and also cause a Promise that will
  // never resolve. The Promise resolves only when the loop is stopped somehow,
  // which we then immediately start our loop back up again.
  await onAnimationLoop(
    () => {
      if (updateSet.size === 0) return;
      updateSet.forEach(t => t.update());
      updateSet.clear();
    },
    undefined,
    Number.POSITIVE_INFINITY
  );

  updateLoop();
};

updateLoop();
