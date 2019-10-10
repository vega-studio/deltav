import { Model } from './model';

/**
 * This is an object that contains a list of buffers and state for those buffers to
 * be rendered together.
 */
export class Scene {
  /** The models this scene will render. They will be rendered in the order they were insertted */
  models = new Set<Model>();

  /**
   * Add a model to be rendered within the scene
   */
  add(model: Model) {
    this.models.add(model);
  }

  /**
   * Remove a model from the scene
   */
  remove(model: Model) {
    this.models.delete(model);
  }
}
