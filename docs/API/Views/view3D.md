# View3D

A View renders a perspective of a scene to a given surface or surfaces. The 3D view system assumes a y-axis up system. The view also assumes the camera is located in the middle of the viewport.
 
## Constructor(scene: LayerScene, options: TViewProps)

**scene: LayerScene**

The scene this view is displaying

**options: TViewProps**

TViewProps extends from IView3DProps while IView3DProps extends from IViewProps.

IView3DProps has no addtional attributes compared IViewProps

## Properties

**defaultProps: IView3DProps**

(static) Default value is

```
{
  key: "",
  camera: new Camera({
    type: CameraProjectionType.PERSPECTIVE,
    width: 100,
    height: 100,
    fov: Math.PI / 2,
    far: 100000,
    near: 1
  }),
  viewport: {
    left: 0,
    right: 0,
    bottom: 0,
    top: 0
  }
}
```

**projection: Projection3D**

These are the projection methods specific to rendering with this 3D system.


## Methods

**fitViewtoViewport(_surfaceDimensions: Bounds<never>, viewBounds: Bounds<View<IViewProps>>)**

This operation makes sure we have the view camera adjusted to the new viewport's needs.

For default behavior this ensures that the coordinate system has no distortion or perspective, orthographic, top left as 0,0 with +y axis pointing down.

**willUpdateProps(newProps: IView3DProps)**

Will set the camera of this view's projection to camera of newProps
  