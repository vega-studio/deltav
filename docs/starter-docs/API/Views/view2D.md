# View2D

A 2D view renders a perspective of a scene to a given surface or surfaces

Class View2D extends from class View

## constructor(scene: LayerScene, options: TViewProps)

**scene: LayerScene**

The scene this view is displaying

**options: TViewProps**

TViewProps extends from IView2DProps while IView2DProps extends from IViewProps.

IView2DProps has one additional attributes compared IViewProps

* camera: Camera2D

  (required) Redefine the camera applied to this view to ensure it's a 2D camera.

## Properties

**defaultProps: IView2DProps**

(static) Default value is

```
{
  key: "",
  camera: new Camera2D(),
  viewport: {
    left: 0,
    right: 0,
    bottom: 0,
    top: 0
  }
}
```

**projection: Projection2D**

These are the projection methods specific to rendering with this 2D system.

Default value is new Projection2D()

## Methods

**fitViewtoViewport(_surfaceDimensions: Bounds<never>, viewBounds: Bounds<View<IViewProps>>)**

This operation makes sure we have the view camera adjusted to the new viewport's needs.

For default behavior this ensures that the coordinate system has no distortion or perspective, orthographic, top left as 0,0 with +y axis pointing down

**willUpdateProps(newProps: IView2DProps)**

Will set the camera of this view's projection to camera of newProps
  