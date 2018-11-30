import { Model } from "./model";

/**
 * This is an object that contains a list of buffers and state for those buffers to
 * be rendered together.
 */
export class SceneContainer {
  /** The models this scene will render */
  models: Model[] = [];

  /**
   * Add a model to be rendered within the scene
   */
  add(model: Model) {
    this.models.push(model);
  }

  /**
   * Remove a model from the scene
   */
  remove(model: Model) {
    const index = this.models.indexOf(model);
    if (index > -1) this.models.splice(index, 1);
  }
}
