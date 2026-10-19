import { registerFixture } from "../fixture-registry.js";
import { rawGLFixture } from "./raw-gl.js";

/**
 * Leak control: the same context, buffer and texture as leaky-raw, deleted
 * and the context lost on unmount.
 */
registerFixture("leak-control/clean-raw", rawGLFixture(true));
