/**
 * This file contains all of the utilities for creating common object types
 */
import { createAttribute } from "./create-attribute";
import { createLayer } from "./create-layer";
import { createUniform } from "./create-uniform";
import { createVertex } from "./create-vertex";
import { createView } from "../surface/view";

/**
 * Quick reference to the creation methods commonly used.
 */
export const create = {
  layer: createLayer,
  view: createView,
  vertex: createVertex,
  uniform: createUniform,
  attribute: createAttribute,
};
