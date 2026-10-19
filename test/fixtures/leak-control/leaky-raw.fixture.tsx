import { registerFixture } from "../fixture-registry.js";
import { rawGLFixture } from "./raw-gl.js";

/** Leak control: a raw WebGL2 context, buffer and texture never released. */
registerFixture("leak-control/leaky-raw", rawGLFixture(false));
