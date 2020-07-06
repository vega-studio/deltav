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
export interface ITransformBase {
}
/** Flags an object for an update cycle */
export declare const scheduleUpdate: any;
/** Removes an object from needing a scheduled update */
export declare const resolveUpdate: any;
