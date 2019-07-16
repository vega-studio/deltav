import { Attribute } from "./attribute";
export declare class Geometry {
    private _attributes;
    readonly attributes: Map<string, Attribute>;
    gl: {};
    maxInstancedCount: number;
    isInstanced: boolean;
    addAttribute(name: string, attribute: Attribute): void;
    removeAttribute(name: string): void;
    dispose(): void;
}
