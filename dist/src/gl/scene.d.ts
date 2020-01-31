import { Model } from "./model";
/**
 * This is an object that contains a list of buffers and state for those buffers to
 * be rendered together.
 */
export declare class Scene {
    /** The models this scene will render. They will be rendered in the order they were insertted */
    models: Set<Model>;
    /**
     * Add a model to be rendered within the scene
     */
    add(model: Model): void;
    /**
     * Remove a model from the scene
     */
    remove(model: Model): void;
}
