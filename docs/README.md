# DeltaV documentation

These docs are written for agents working on the DeltaV source. Each file covers a single topic of
the system, and its frontmatter lists the source paths it `covers`, the commit it was `verified-at`
and its `related` docs. Start with this index, read only the docs relevant to your task, and
follow `related` when you need more context. The source is always the final authority: if a doc
contradicts the code, trust the code and fix the doc. Writing and update rules are in
[CONVENTIONS.md](CONVENTIONS.md); `bun docs/check-docs.ts --which <file>` tells you which docs cover a
source file.

### Overview

- [Architecture](overview/architecture.md) — How the DeltaV pieces fit together: surface, layers, instances, shaders, buffers and the GL layer, and the public exports.
- [Repository layout and tooling](overview/repository.md) — Folder layout, build, test, Storybook and type-declaration setup of the deltav repository.
- [Glossary](overview/glossary.md) — Definitions of the DeltaV vocabulary (instance, layer, view, scene, IO expansion, easing, picking) and the shared types in types.ts.
- [Testing](overview/testing.md) — How the browser test suite runs (jest, Vite, headless Chromium on SwiftShader), the analytic pixel-probe methodology, fixtures and the defect policy.

### Surface

- [Surface](surface/surface.md) — The Surface: the top-level object that owns the renderer, resources, scenes, layers and event managers, and its lifecycle.
- [Layer](surface/layer.md) — The Layer base class and createLayer: how a layer binds an instance provider to a shader and a buffer strategy.
- [Views and scenes](surface/views-and-scenes.md) — LayerScene and View: how scenes group layers and views define viewports, cameras and render targets.
- [Surface commands](surface/commands.md) — Surface commands and the CommandLayer: running imperative callbacks inside the render pipeline.
- [Render loop](surface/render-loop.md) — The per-frame pipeline: frame timing, change processing, buffer updates and draw order, and the constants that tune it.

### Instances

- [Instances](instances/instances.md) — The Instance base class and the observable decorator: how instance property changes are tracked for the GPU.
- [Instance providers](instances/instance-providers.md) — InstanceProvider and InstanceProviderWithList: adding, removing and streaming instance changes to layers.
- [Easing and animation](instances/easing-and-animation.md) — GPU-side easing of instance attributes: easing methods, easing props and the helpers that control animations.

### Shaders

- [Shader processing](shaders/shader-processing.md) — How layer shaders are assembled: templating, module imports and the processors that produce final GLSL.
- [Shader modules](shaders/shader-modules.md) — The shader module system and the built-in base modules a layer shader can import.
- [IO expansion](shaders/io-expansion.md) — Layer processing IO expansions: how attributes, uniforms and easing are expanded into generated shader code.
- [Authoring a layer](shaders/authoring-a-layer.md) — Step-by-step guide to writing a custom layer: attributes, uniforms, vertex data and shader templates, using the circle layer as the model.

### Buffers

- [Buffer management overview](buffers/overview.md) — The buffer manager and diff processor base classes and how a layer picks a buffering strategy.
- [Instance attribute strategies](buffers/instance-attribute-strategies.md) — Instanced attribute buffering, plain and packed: layout, growth and per-instance updates.
- [Vertex and uniform strategies](buffers/vertex-and-uniform-strategies.md) — Vertex attribute buffering, vertex packing and uniform buffering strategies and when each is used.
- [Instance diffing](buffers/instance-diffing.md) — The InstanceDiffManager: turning instance change lists into buffer updates each frame.

### GL

- [WebGL renderer](gl/renderer.md) — The WebGLRenderer and its stats: context setup, render passes and draw calls.
- [GL state and proxy](gl/state-and-proxy.md) — GLState and GLProxy: cached GL state, resource compilation, settings decoding and debugging helpers.
- [GPU resources](gl/gpu-resources.md) — Attribute, index buffer, uniform buffer, texture, render target and color buffer wrappers and their update model.
- [Scene, model and material](gl/scene-model-material.md) — The low-level GL scene graph: Scene, Model, Material, Geometry and the GL type definitions.

### Math

- [Vectors, matrices and quaternions](math/vectors-matrices-quaternions.md) — The functional vector, matrix and quaternion math libraries and their conventions.
- [Projection and geometry](math/projection-and-geometry.md) — Base projection, frustum, plane, ray and primitive shapes used for screen/world conversion and hit tests.

### Interaction

- [Event management](interaction/event-management.md) — User input handling: the event manager base, user input router and the interaction event types.
- [Picking](interaction/picking.md) — Instance picking: color picking shaders, layer interaction handlers and the picking event managers.
- [Camera controllers](interaction/camera-controllers.md) — The 2D camera controller and the 3D transform and swivel controllers that map input to camera motion.

### 2D

- [2D view and camera](2d/view-and-camera.md) — View2D, Camera2D and the 2D shader modules: world-to-screen projection for 2D scenes.
- [2D layers](2d/layers.md) — Catalog of the built-in 2D layers (arcs, circles, edges, images, rectangles, rings, vertex points) and their instance properties.
- [Labels](2d/labels.md) — The label layer: text instances built from glyphs, layout, truncation and the font resource dependency.

### 3D

- [3D scene graph](3d/scene-graph.md) — Transforms and the scene graph: hierarchical 2D/3D transforms, world nodes and how instances attach to them.
- [3D view and projection](3d/view-and-projection.md) — View3D, Camera and the 3D shader modules: perspective and orthographic projection for 3D scenes.
- [3D layers](3d/layers.md) — Catalog of the built-in 3D layers (cube, triangle) and their instance properties.

### Resources

- [Resource management](resources/resource-management.md) — The resource manager base and router: how layers request and share resources such as fonts, textures and color buffers.
- [Text and fonts](resources/text-and-fonts.md) — Font resources: font loading, glyph rendering, CPU SDF generation and font maps used by the label layer.
- [Textures and atlases](resources/textures-and-atlases.md) — Texture and atlas resources: packing images into atlases and exposing them to shaders.
- [Color buffers](resources/color-buffers.md) — Color buffer resources: render targets for off-screen output such as picking and post processing.

### React

- [React surface](react/react-surface.md) — The JSX surface: declaring surfaces, scenes, layers, resources and event managers as React components.
- [Post processing](react/post-processing.md) — The JSX post-processing components: render-to-texture chains and effects such as bloom, blur, trail and noise.
- [Utility layers](react/util-layers.md) — The utility layers in ui/src/util-layers, such as LogChangesLayer for debugging instance changes.

### Utilities

- [Library utilities](utilities/library-util.md) — The helpers in ui/src/util: layer and attribute factories, frame helpers, data structures and miscellaneous utilities.
- [Repository utilities](utilities/repo-util.md) — The generic helpers in the root util folder and where they are used.
