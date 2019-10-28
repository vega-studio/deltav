# BasicCamera2DController

Class BasicCamera2DController extends SimpleEventHandler. 

This class provides some very basic common needs for a camear control system. This is not a total solution for every scenario. This should just handle most basic needs.

## Constructor(options: IBasicCamera2DControllerOptions)

**options: IBasicCamera2DControllerOptions**

* bounds: ICameraBoundsOptions
  * ICameraBoundsOptions

    (optional) Takes in the options to be used for creating a new ViewBounds object on this controller.
 
    * anchor: CameraBoundsAnchor

      (required) How the bounded world space should anchor itself within the view when the projected world space to the screen is smaller than the view
    
    * scaleMin: Vec3

      (optional) Minimum settings the camera can scale to

    * scaleMax: Vec3

      (optional) Maximum setttings the camera can scale to

    * screenPadding: { left: number; right: number; top: number; bottom: number}

      (required) The actuall screen pixels the bounds can exceed when the camera's view has reached the bounds of the world

    * view: string

      (required) This is the view for which the bounds applies towards

    * worldBounds

      (required) The area the camera is bound inside
  
  * camera: Camera2D

    (required) This is the camera this controller will manipulate

  * ignoreCoverViews: boolean

    (optional) When this is set to true, the start view can be targetted even when behind other views
  
  * onRangeChanged(camera: Camera2D, projections: BaseProjection<any>): void

    (optional) This is a handler for when the camera has applied changes to the visible range of what is seen. Which most likely means offset or scale has been altered.
  
  * panFilter(offset: [number, number, number], view: View<IViewProps>, allViews: View<IViewProps>[]): [number, number, number]

    (optional) This provides a control to filter panning that will be applied to the camera. The input and output of this will be the delta value to be applied

  * scaleFactor: number

    (optional) This adjusts how fast scaling is applied from the mouse wheel

  * scaleFilter(scale: [number, number, number], view: View<IViewProps>, allViews: View<IViewProps>[]): [number, number, number]

    (optional) This provides a control to filter scaling that will be applied to the camera. The input and output of this will be the delta value to be applied
  
  * startView: string | string[]

    (optional) This is the view that MUST be the start view from the events. If not provided, then dragging anywhere will adjust the camera. This MUST be set for onRangeChange to broadcast animated camera movements.

  * twoFingerPan: boolean

    (optional) When this is set, it will require two fingers to be down at minimum to pan the camera

  * wheelShouldScroll: boolean

    (optional) This specifies whether a view can be scrolled by wheel.If this is not specified or set false, the view can be zoomed by wheel

## Properties

**ignoreCoverViews: boolean**

When this is set to true, the start view can be targetted even when behind other views

**isPanning: boolean**

Informative property indicating the controller is panning the chart or not

Default value is false

**isScaling: boolean**

Informative property indicationt he controller is scaling via touch gesture

Default value is false

**scaleFactor: number**

The rate scale is adjusted with the mouse wheel

**startViews: string[]**

The view that must be the start or focus of the interactions in order for the interactions to occur

Default value is []

**wheelShouldScroll: boolean**

Whether a view can be scrolled by wheel

**twoFingerPan: boolean**

Indicates if panning will happen with two or more fingers down instead of one
  
## Methods

**get uid()**

Unique identifier of this controller

**get camera()**

Returns the camera this controller will manipulate

**applyBounds()**

Corrects camera offset to respect the current bounds and anchor

**applyScaleBounds()**

Corrects camera scale to respect the current bounds and anchor

**anchoredByBoundsHorizontal( targetView: View<IViewProps>, bounds: ICameraBoundsOptions)**

Calculation for adhering to an anchor - x-axis offset only

**anchoredByBoundsVertical(targetView: View<IViewProps>, bounds: ICameraBoundsOptions)**

Calculation for adhering to an anchor - y-axis offset only

**boundsHorizontalOffset(targetView: View<IViewProps>, bounds: ICameraBoundsOptions)**

Returns offset on x-axis due to current bounds and anchor

**boundsVerticalOffset(targetView: View<IViewProps>, bounds: ICameraBoundsOptions)**

Returns offset on y-axis due to current bounds and anchor

**centerOn(viewId: string, position: Vec3)**

Centers the camera on a position. Must provide a reference view

**filterTouchesByValidStart(touches: ISingleTouchInteraction[])**

This filters a set of touches to be touches that had a valid starting view interaction.

**getRange(viewId: string): Bounds<never>**

Evaluates the world bounds the specified view is observing

**handleMouseDown(e: IMouseInteraction)**

Used to aid in handling the pan effect and determine the contextual view targetted.

**handleTouchDown(e: ITouchInteraction)**

Aids in understanding how the user is interacting with the views. If a single touch is present, we're panning. If multiple touches are present, we're panning and we're zooming**

**handleMouseUp(_e: IMouseInteraction)**

Used to aid in handling the pan effect. Stops panning operations when mouse is up.

**handleTouchUp(e: ITouchInteraction)**

Used to stop panning and scaling effects

**handleTouchCancelled(e: ITouchInteraction)**

Used to stop panning and scaling effects when touches are forcibly ejected from existence.
   

**handleDrag(e: IMouseInteraction)**

Applies a panning effect by adjusting the camera's offset

**handleTouchDrag(e: ITouchInteraction)**

Applies panning effect from single or multitouch interaction.

**handleWheel(e: IMouseInteraction)**

Applies a scaling effect to the camera for mouse wheel events

**get pan(): Vec3**

Retrieves the current pan of the controlled camera

**get scale(): Vec3**

Retrieves the current scale of the camera

**setBounds(bounds: ICameraBoundsOptions)**

Sets bounds applicable to the supplied view. If no view is supplied, it uses the first in the startViews array

**setOffset(viewId: string, offset: Vec3)**

Tells the controller to set an explicit offset for the camera. Must provide a reference view.

**setRange(newWorld: Bounds<{}>, viewId: string)**

This lets you set the visible range of a view based on the view's camera. This will probably not work as expected if the view indicated and this controller do not share the same camera.
   
**setRangeChangeHandler(handler: BasicCamera2DController["onRangeChanged"])**

Applies a handler for the range changing