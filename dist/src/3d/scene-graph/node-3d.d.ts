import { Node } from "./node";
export declare class Node3D extends Node<Node3D> {
    readonly local: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
    private _local;
    readonly parent: Node3D | null;
    private _parent;
    readonly world: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
    private _world;
    willMount(): void;
    didMount(): void;
}
