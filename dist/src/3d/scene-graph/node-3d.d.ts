import { Node } from "./node";
/**
 * Expresses an item in the 3D world within a SceneGraph. Allows the concept of parent child relationships and provides
 * calculated world transforms as the culmination of the relationships.
 */
export declare class Node3D extends Node<Node3D> {
    /** The transform in local space of this node. If there is no parent, this transform === the world transform */
    readonly local: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
    private _local;
    /** The parent node of this node */
    readonly parent: Node3D | null;
    private _parent;
    /**
     * The world transform matrix computed for this node. This is the transform used to position objects within
     * the world. This returns the local transform if no world transform is computed for this node (ie- this node has
     * no parent).
     */
    readonly world: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
    private _world;
    willMount(): void;
    didMount(): void;
}
