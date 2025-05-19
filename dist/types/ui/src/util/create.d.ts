/**
 * This file contains all of the utilities for creating common object types
 */
import { createView } from "../surface/view.js";
import { createAttribute } from "./create-attribute.js";
import { createLayer } from "./create-layer.js";
import { createUniform } from "./create-uniform.js";
import { createVertex } from "./create-vertex.js";
/**
 * Quick reference to the creation methods commonly used.
 */
export declare const create: {
    layer: typeof createLayer;
    view: typeof createView;
    vertex: typeof createVertex;
    uniform: typeof createUniform;
    attribute: typeof createAttribute;
};
