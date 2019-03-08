import { Model } from "./model";
export declare class Scene {
    models: Set<Model>;
    add(model: Model): void;
    remove(model: Model): void;
}
