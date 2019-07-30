import { Node3D } from "./node-3d";
export declare class SceneGraph {
    readonly root: Node3D;
    private _root;
    setRoot(node: Node3D): void;
}
