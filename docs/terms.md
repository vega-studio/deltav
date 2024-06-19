# Terms

## Instance

- An instance is a single element of certain shape or item that will be
  displayed in given environment.
- It should have some basic properties of a shape such as size, position, color
  and so on.
- Every time a developer needs to extend the customized instance from Instance
  class and set the necessary properties that can describe the shape.
- Instances are very easy to use and completely detached from the rendering
  process. Developers can create, add, modify and remove instances at any phase
  of a rendering process.

## InstanceProvider

- An InstanceProvider is the glue between rendering pipeline and the manipulated
  instances.
- It is the data source of all the layers and the data holder of all the
  instances.
- Instances can be added or removed at any time.
- An InstanceProvider can be constructed with instances or as an empty holder
  which will be expected data to be added later.
- An InstanceProvider can be cleared quickly by calling clear()

## Layer

- A layer is the platform to display instances. Developers can create the layer
  by setting the data to display, how data will be displayed and what
  interactions or animations will be attached to instances. Developers also
  need to implement shaders associated with the shapes to display.
- TL;DR - Layer is glue between Instances and Shaders. They can also help manage
  resource requests or delegate instances to other layers.
- A layer will be created by createLayer() method (this is abstracted with
  convenience items such as LayerJSX).

### Layer Props

- Properties that are injected into a layer for it to react to. These are
  injected into the layer when createLayer() is invoked.
- All layers have a data property and a materialOptions property to override
  default material options.

## Surface

- Surface helps developers to fill the provide htmlCanvasElement with customized
  contents. It is the foundation and creation point of rendering pipelines. It
  connects developers specified cameras, events and resources for rendering
  texts, images or videos. There are some concepts which are already set up
  within it, such as monitoring resizing, waiting for a valid size to be
  present, a render loop tied into requestAnimationFrame.

## Scene

- A Scene is an abstract container that holds views and layers for rendering to
  the screen.

## View

- A View is a given viewing angle of a Scene with a specific Camera projection
  and is projected to some type of target with a given viewport.
- View can be more complicated and render to offscreen target resources or
  render to multiple offscreen target resources.
- Responsible for other odds and ends clearing buffers before rendering.
- Can remap buffer output target names to other buffer target names. Got a layer
  with weird buffer target? Remap them! Want a Layer's "glow" output rendered to
  a "color" target? REMAP!
