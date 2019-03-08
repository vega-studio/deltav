import { Attribute } from "src/gl/attribute";
export declare class Geometry {
    private _attributes;
    readonly attributes: Map<string, Attribute>;
    gl: {};
    maxInstancedCount: number;
    addAttribute(name: string, attribute: Attribute): void;
    removeAttribute(name: string): void;
    dispose(): void;
}
