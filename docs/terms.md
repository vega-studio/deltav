# Terms

## Instance

* An instance is a single element of certain shape or item that will be displayed in given environment.
* It should have some basic properties of a shape such as size, position, color and so on.
* Everytime a customer needs to extends the customized instance from Instance class and set the necessary properties that can describe the shape.
* Instances are very easy to use and completely detached from rendering process. Customer can create, add, modify and remove instances at any phase of a rendering process.

## InstanceProvider

* An instanceProvider is the glue between rendering pipeline and the manipulated instances.
* It is the data source of all the layers and the data holder of all the instances.
* During the rendering process, instances can be added or removed at any time.
* An instanceProvider can be constructed by instances or as an empty holder which will be expected data to be added later.
* An instanceProvider can be cleared and destroyed by simply calling clear() and destroy() functions.

## Layer

* A layer is the platform to display instances. Customer can create the layer by setting the data to display, how data will be displayed and what interactions or animations will be attached to instances. Customer also needs to implement shaders associated with the shapes to display.
* A layer will be created by createLayer() method.

### Layer Props

#### Properties

* baseShaderModules( shaderIO: IShaderInitialization<T>, layerModules: { fs: string[]; vs: string[] }): { fs: string[]; vs: string[] }
* (option) This allows for external overriding of the base shader modules for a layer. This can cause a layer to break if the overrides do not provide what the layer is expecting at the least.
* data: IInstanceProvider<T>
* (required) This is the data provider where the instancing data is injected and modified.
* materialOptions: ILayerMaterialOptions
* (option) Any pipeline declaring a layer can manipulate a layer's default material settings as every pipeline can have some specific and significant needs the layer does not provide as a default.
* order: number
* (option) Helps guarantee a rendering order for the layers. Lower numbers render first.
* picking: PickType
* (option) This sets how instances can be picked via the mouse. This activates the mouse events for the layer IFF the value is not NONE.
* printShader: boolean
* (option) Used for debugging. Logs the generated shader for the layer in the console.

#### Events

* onMouseDown(info: IPickInfo<T>): void
* (option) Executes when the mouse is down on instances (Picking type must be set)
* onMouseMove(info: IPickInfo<T>): void
* (option) Executes when the mouse moves on instances (Picking type must be set)
* onMouseOut(info: IPickInfo<T>): void
* (option) Executes when the mouse no longer over instances (Picking type must be set)
* onMouseOver?(info: IPickInfo<T>): void
* (option) Executes when the mouse is newly over instances (Picking type must be set)
* onMouseUp(info: IPickInfo<T>): void
* (option) Executes when the mouse button is released when over instances (Picking type must be set)
* onMouseUpOutside(info: IPickInfo<T>): void
* (option) Executes when the mouse was down on an instance but is released up outside of that instance (Picking type must be set)
* onMouseClick(info: IPickInfo<T>): void
* (option) Executes when the mouse click gesture is executed over instances (Picking type must be set)
* onTouchAllEnd(info: IPickInfo<T>): void
* (option) Executes when there are no longer any touches that are down for the layer (Picking type must be set). This executes for touches being released inside and outside their respective instance.
* onTouchDown(info: IPickInfo<T>): void
* (option) Executes when a touch is down on instances. Each touch will produce its own event (Picking type must be set)
* onTouchUp(info: IPickInfo<T>): void
* (option) Executes when a touch is up when over on instances. Each touch will produce its own event (Picking type must be set)
* onTouchUpOutside?(info: IPickInfo<T>): void
* (option) Executes when a touch was down on an instance but is released up outside of that instance (Picking type must be set)
* onTouchMove(info: IPickInfo<T>): void
* (option) Executes when a touch is moving atop of instances. Each touch will produce its own event (Picking type must be set)
* onTouchOut(info: IPickInfo<T>): void
* (option) Executes when a touch is moves off of an instance. Each touch will produce its own event (Picking type must be set)
* onTouchOver(info: IPickInfo<T>): void
* (option) Executes when a touch moves over instances while the touch is dragged around the screen. (Picking type must be set)
* onTouchAllOut(info: IPickInfo<T>): void
* (option) Executes when a touch moves off of an instance and there is no longer ANY touches over the instance (Picking type must be set)
* onTap(info: IPickInfo<T>): void
* (option) Executes when a touch taps on instances. (Picking type must be set)

## Surface

* Surface helps customers to fill the provide htmlCanvasElement with customized contents. It is the foundation and creation point of rendering pipelines while pipeline implements views and layers with data and set-ups from surface. It connects customers' specified cameras, events and resources for rendering texts, images or videos. There are some concepts which are already set up within it, such as monitoring resizing, waiting for a valid size to be present, a render loop tied into rquestAnimationFrame.
