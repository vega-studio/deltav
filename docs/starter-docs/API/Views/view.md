# View 

View class extends from IdentifyByKey.

A View renders a perspective of a scene to a given surface or surfaces.

## Constructor(scene: LayerScene, props: TViewProps)

Parameters:

**scene: LayerScene**

The scene this view is displaying

**props: TViewProps**

TViewProps extends from IViewProps. This defines the input metrics of a view for a scene.

IViewProps has following attributes:

* background: Color

  (optional) The background color that gets cleared out for this view.

* camera: Camera

  (required) This is the 3D camera used to create a vantage point in the 3D world and project its viewpoint to the 2d screen

* clearFlags: ClearFlags[]

  (optional) This sets what buffers get cleared by webgl before the view is drawn in it's space.

* order: number

  (optional) Helps assert a guaranteed rendering order if needed. Lower numbers render first.

* viewport: AbsolutePosition

  (required) This specifies the bounds on the canvas this camera will render to. This allows rendering a little square in the bottom right showing a minimap.

## Properties

**defaultProps: IViewProps**

(static) Default viewProps:

```
{
  key: "",
  camera: Camera.makeOrthographic(),
  viewport: { left: 0, right: 0, top: 0, bottom: 0 }
}
```

**animationEndTime: number**

End time of animation

Default value is 0

**depth: number**

This is the depth of the view. The higher the depth represents which layer is on top. Zero always represents the default view.

Default value is 0

**lastFrameTime: number**

Last frame time this view was rendered under

Default value is 0

**needsDraw: boolean**

This is the flag to see if a view needs draw

Default value is false

**optimizeRendering: boolean**

This is a flag for various processes to indicate the view is demanding optimal rendering performance over other processes.

This is merely a hinting device and does not guarantee better performance at any given moment.

Default value is false

**pixelRatio: number**

This is set to ensure the projections that happen properly translates the pixel ratio to normal Web coordinates

Default value is 1

**props: TViewProps**

The props applied to this view

**scene: LayerScene**

The scene this view is displaying

**projection: BaseProjection<View<TViewProps>>**

This establishes the projection methods that can be used to project geometry between the screen and the world

## Methods

**get screenBounds()**
**set screenBounds(val: Bounds<View<TViewProps>>)**

Gets and sets screenBounds of this view's projection

**get viewBounds()**
**set viewBounds(val: Bounds<View<TViewProps>>)**

Gets and sets viewBounds of this view's projection

**get clearFlags()**

Retrieves the clearflag prop assigned to the view and provides a default

**get order()**

Retrieves the order prop assigned to the view and provides a default
   
**fitViewtoViewport(_surfaceDimensions: Bounds<never>,    viewBounds:Bounds<View<IViewProps>>): void**

(abstract) This operation makes sure we have the view camera adjusted to the new viewport's needs. For default behavior this ensures that the coordinate system has no distortion, orthographic, top left as 0,0 with +y axis pointing down.

**shouldDrawView(oldProps: TViewProps, newProps: TViewProps)**

This method returns a flag indicating whether or not the view should trigger a redraw.

By default, a redraw is triggered (this returns true) when a shallow comparison of the current props and the incoming props are different.

This method can be overridden to place custom logic at this point to indicate when redraws should happen.

NOTE: This should be considered for redraw logic centered around changes in the view itself.

There ARE additional triggers in the system that causes redraws. This method just aids in ensuring necessary redraws take place for view level logic and props.
  
**willUpdateProps(_newProps: IViewProps)**

Lifecycle: Fires before the props object is updated with the newProps. Allows view to respond to diff changes.

There is no operation for the base behavior

**didUpdateProps()**

Lifecycle: Executes after props have been updated with new contents.

There is no operation for the base behavior

