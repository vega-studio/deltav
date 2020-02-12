import { Node3D } from "./node-3d";
export declare class SceneGraph {
    readonly root: Node3D;
    private _root;
    /**
     * Sets the root node this scene graph will utilize
     */
    setRoot(node: Node3D): void;
}
