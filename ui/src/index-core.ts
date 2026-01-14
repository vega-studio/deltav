// Instance providers and base instancing
export * from "./instance-provider/index.js";

// Math utilities
export * from "./math/index.js";

// Camera utilities
export * from "./util/camera.js";

// 3D Scene Graph (instances and transforms)
export * from "./3d/scene-graph/index.js";
export {
  Instance2D,
  type IInstance3DOptions as IInstance2DOptions,
} from "./3d/scene-graph/instance-2d.js";

// 2D Layer Instances (detached from rendering system)
export * from "./2d/layers/arcs/arc-instance.js";
export * from "./2d/layers/circles/circle-instance.js";
export * from "./2d/layers/edges/edge-instance.js";
export * from "./2d/layers/images/image-instance.js";
// Export ImageInstanceResource type (type-only, no runtime dependency on layers)
export type {
  ImageInstanceResource,
  ImageVideoResource,
} from "./2d/layers/images/image-layer.js";
export * from "./2d/layers/labels/border-instance.js";
export * from "./2d/layers/labels/glyph-instance.js";
export * from "./2d/layers/labels/label-instance.js";
export * from "./2d/layers/labels/text-area-instance.js";
export * from "./2d/layers/rectangle/rectangle-instance.js";
export * from "./2d/layers/rings/ring-instance.js";

// 3D Layer Instances (detached from rendering system)
export * from "./3d/layers/cube/cube-instance.js";
export * from "./3d/layers/triangle/triangle-instance.js";

// DOM-independent utility functions
export * from "./util/array.js";
export * from "./util/common-filters.js";
export * from "./util/common-operations.js";
export * from "./util/common-options.js";
export * from "./util/console-utils.js";
export * from "./util/create.js";
export * from "./util/create-attribute.js";
export * from "./util/create-layer.js";
export * from "./util/create-uniform.js";
export * from "./util/create-vertex.js";
export * from "./util/easing-props.js";
export * from "./util/easing-util.js";
export * from "./util/frame.js";
export * from "./util/identify-by-key.js";
export * from "./util/promise-resolver.js";
export * from "./util/quad-tree.js";
export * from "./util/reactive-diff.js";
export * from "./util/remove-comments.js";
export * from "./util/resource-pool.js";
export * from "./util/shader-templating.js";
export * from "./util/shallow-compare.js";
export * from "./util/uid.js";
export * from "./util/wait.js";
