import React from "react";
import type { Vec4 } from "../../../../math/vector.js";
import { type IDrawJSX } from "./draw-jsx.js";
export interface IDrawDebugJSX {
    /**
     * List of all textures we should render to the screen in a grid. Supports up
     * to 16.
     */
    inputs: (string | {
        key: string;
        position?: boolean;
        depth?: boolean;
        channels?: IDrawJSX["channel"][];
    })[];
    /** The background clear color of the textures when rendered to the screen */
    background: Vec4;
}
/**
 * Debug textures quickly by rendering them to the screen in a grid.
 */
export declare function DrawDebugJSX(props: IDrawDebugJSX): React.JSX.Element;
