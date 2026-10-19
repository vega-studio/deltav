# DeltaV

DeltaV (`deltav` on npm) is a TypeScript WebGL2 framework for rendering large, dynamic data
visualizations: data is expressed as instances, layers turn instances into GPU buffers and
generated shaders, and only the instances that changed are re-uploaded each frame. The library
source is in `ui/src`, Storybook demos in `ui/stories`, the jest + headless Chromium test suite
in `test/`, and generic helpers in the root `util/` folder.

## Commands

- `bun install` — install dependencies (no lockfile is saved, see `bunfig.toml`; build tooling
  comes from the `devops` git dependency).
- `bun run ts` — typecheck.
- `bun run test` — run the jest test suite.
- `bun run dev` — start Storybook with the demos on http://localhost:6006.

Ticketing and planning rules for agents live in `.claude/rules/`.

## Documentation

`docs/` is written for agents. It is split into small single-topic files, each with frontmatter
listing the source paths it `covers` and the commit it was `verified-at`, so an agent reads only
the docs it needs and can tell which docs a source change affects.

- Start at `docs/README.md` (the index) and read only the docs relevant to your task.
- Before changing source, run `bun docs/check-docs.ts --which <files>`; update the docs it lists,
  and their `verified-at`, in the same commit as the source change.
- Run `bun docs/check-docs.ts` before committing; it must exit 0.
- Read `docs/CONVENTIONS.md` before writing or editing a doc.
- Never put specification in this file: a new doc gets only a one-line entry in the map below
  (and a line in `docs/README.md`).

Map of the docs:

Overview:
- docs/overview/architecture.md — architecture
- docs/overview/repository.md — repository layout and tooling
- docs/overview/glossary.md — glossary
- docs/overview/testing.md — test suite and correctness methodology
- docs/overview/toolchain.md — toolchain

Surface:
- docs/surface/surface.md — surface
- docs/surface/layer.md — layer
- docs/surface/views-and-scenes.md — views and scenes
- docs/surface/commands.md — surface commands
- docs/surface/render-loop.md — render loop

Instances:
- docs/instances/instances.md — instances
- docs/instances/instance-providers.md — instance providers
- docs/instances/easing-and-animation.md — easing and animation

Shaders:
- docs/shaders/shader-processing.md — shader processing
- docs/shaders/shader-modules.md — shader modules
- docs/shaders/io-expansion.md — io expansion
- docs/shaders/authoring-a-layer.md — authoring a layer

Buffers:
- docs/buffers/overview.md — buffer management overview
- docs/buffers/instance-attribute-strategies.md — instance attribute strategies
- docs/buffers/vertex-and-uniform-strategies.md — vertex and uniform strategies
- docs/buffers/instance-diffing.md — instance diffing

GL:
- docs/gl/renderer.md — webgl renderer
- docs/gl/state-and-proxy.md — gl state and proxy
- docs/gl/gpu-resources.md — gpu resources
- docs/gl/scene-model-material.md — scene, model and material

Math:
- docs/math/vectors-matrices-quaternions.md — vectors, matrices and quaternions
- docs/math/projection-and-geometry.md — projection and geometry

Interaction:
- docs/interaction/event-management.md — event management
- docs/interaction/picking.md — picking
- docs/interaction/camera-controllers.md — camera controllers

2D:
- docs/2d/view-and-camera.md — 2d view and camera
- docs/2d/layers.md — 2d layers
- docs/2d/labels.md — labels

3D:
- docs/3d/scene-graph.md — 3d scene graph
- docs/3d/view-and-projection.md — 3d view and projection
- docs/3d/layers.md — 3d layers

Resources:
- docs/resources/resource-management.md — resource management
- docs/resources/text-and-fonts.md — text and fonts
- docs/resources/textures-and-atlases.md — textures and atlases
- docs/resources/color-buffers.md — color buffers

React:
- docs/react/react-surface.md — react surface
- docs/react/post-processing.md — post processing
- docs/react/util-layers.md — utility layers

Utilities:
- docs/utilities/library-util.md — library utilities
- docs/utilities/repo-util.md — repository utilities
