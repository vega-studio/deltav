# Layer

## Props

ILayer2DProps extends from [ILayerProps], since no additional attributes are added to ILayer2DProps for now, ILayer2DProps is also referenced here.

**data: IInstanceProvider<T>**

(required) This is the data provider where the instancing data is injected and modified.

**baseShaderModules(<br>&emsp;&emsp;shaderIO: IShaderInitialization<T>,<br>&emsp;&emsp;layerModules: { fs: string[]; vs: string[] }<br>): { fs: string[]; vs: string[] }**

(optional) This allows for external overriding of the base shader modules for a layer. This can cause a layer to break if the overrides do not provide what the layer is expecting at the least.

**materialOptions: ILayerMaterialOptions**

(optional) Any pipeline declaring a layer cn manipulate a layer's default material settings as every pipeline can have some specific and significant needs the layer does not provide as a default.

**order: number**

(optional) Helps guarantee a rendering order for the layers. Lower numbers render first.

**picking: PickType**

(optional) This sets how instances can be picked via the mouse. This activates the mouse events for the layer IFF the value is not NONE.

**printShader: boolean**

(optional) Used for debugging. Logs the generated shader for the layer in the console.

### Events

**onMouseDown(info: IPickInfo<T>): void**

(optional) Executes when the mouse is down on instances (Picking type must be set)

**onMouseMove(info: IPickInfo<T>): void**

(optional) Executes when the mouse moves on instances (Picking type must be set)

**onMouseOut(info: IPickInfo<T>): void**

(optional) Executes when the mouse no longer over instances (Picking type must be set)

**onMouseOver(info: IPickInfo<T>): void**

(optional) Executes when the mouse is newly over instances (Picking type must be set)

**onMouseUp(info: IPickInfo<T>): void**

(optional) Executes when the mouse button is released when over instances (Picking type must be set)

**onMouseUpOutside(info: IPickInfo<T>): void**

(optional) Executes when the mouse was down on an instance but is released up outside of that instance (Picking type must be set)

**onMouseClick(info: IPickInfo<T>): void**

(optional) Executes when the mouse click gesture is executed over instances (Picking type must be set)

**onTouchAllEnd?(info: IPickInfo<T>): void**

(optional) Executes when there are no longer any touches that are down for the layer (Picking type must be set).

NOTE: This executes for touches being released inside and outside their respective instance.

**onTouchDown(info: IPickInfo<T>): void**

(optional) Executes when a touch is down on instances. Each touch will produce it's own event (Picking type must be set)

**onTouchUp(info: IPickInfo<T>): void**

(optional) Executes when a touch is up when over on instances. Each touch will produce it's own event (Picking type must be set)

**onTouchUpOutside(info: IPickInfo<T>): void**

(optional)Executes when a touch was down on an instance but is released up outside of that instance (Picking type must be set)

**onTouchMove(info: IPickInfo<T>): void**

(optional) Executes when a touch is moving atop of instances. Each touch will produce it's own event (Picking type must be set)

**onTouchOut(info: IPickInfo<T>): void**

(optional) Executes when a touch is moves off of an instance. Each touch will produce it's own event (Picking type must be set)

**onTouchOver(info: IPickInfo<T>): void**

(optional) Executes when a touch moves over instances while the touch is dragged around the screen. (Picking type must be set)

**onTouchAllOut(info: IPickInfo<T>): void;**

(optional) Executes when a touch moves off of an instance and there is no longer ANY touches over the instance (Picking type must be set)

**onTap(info: IPickInfo<T>): void**

(optional) Executes when a touch taps on instances. (Picking type must be set)
