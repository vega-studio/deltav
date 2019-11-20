# Terms

## Instance

* An instance is a single element of certain shape or item that will be displayed in given environment.
* It should have some basic properties of a shape such as size, position, color and so on.
* Every time a developer needs to extends the customized instance from Instance class and set the necessary properties that can describe the shape.
* Instances are very easy to use and completely detached from rendering process. Developers can create, add, modify and remove instances at any phase of a rendering process.

## InstanceProvider

* An instanceProvider is the glue between rendering pipeline and the manipulated instances.
* It is the data source of all the layers and the data holder of all the instances.
* During the rendering process, instances can be added or removed at any time.
* An instanceProvider can be constructed by instances or as an empty holder which will be expected data to be added later.
* An instanceProvider can be cleared and destroyed by simply calling clear() and destroy() functions.

## Layer

* A layer is the platform to display instances. Developers can create the layer by setting the data to display, how data will be displayed and what interactions or animations will be attached to instances. Developers also needs to implement shaders associated with the shapes to display.
* A layer will be created by createLayer() method.

### Layer Props

* Properties that are injected into a layer for it to react to. These are injected into the layer when createLayer() is invoked.
* All layers have a data property and a materialOptions property to override default material options.

## Surface

* Surface helps developers to fill the provide htmlCanvasElement with customized contents. It is the foundation and creation point of rendering pipelines while pipeline implements views and layers with data and set-ups from surface. It connects developers specified cameras, events and resources for rendering texts, images or videos. There are some concepts which are already set up within it, such as monitoring resizing, waiting for a valid size to be present, a render loop tied into requestAnimationFrame.

## Scene

* A Scene is an abstract space geometry from a shader can be injected into. Layers are how geometry gets injected into a Scene.

## View

* A View is a given viewing angle of a Scene with a specific Camera projection and is projected to some type of target.
* A simple View would be a camera looking at a Scene that contains a box and is projected to fill the entire render space of the canvas.
* View can be more complicated and render to offscreen target resources or render to multiple offscreen target resources.
