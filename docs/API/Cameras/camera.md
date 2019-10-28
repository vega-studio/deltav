# Camera

## Constructor(options: ICameraOptions)

**options: ICameraOptions**

ICameraOptions can be ICameraOrthographicOptions or ICameraPerspectiveOptions with a callback onViewChange

* ICameraOrthographicOptions
  * type: CameraProjectionType.ORTHOGRAPHIC

    Forced type requirement, indicates orthographic projection
  * left: number

    (required) Left border of the view range
  * right: number

    (required) Right border of the view range
  * top: number

    (required) Top border of the view range
  * bottom: number

    (required) Bottom border of the view range
  * near: number

    (required) Near border of the view range
  * far: number

    (required) Far border of the view range

* ICameraPerspectiveOptions
  * type: CameraProjectionType.PERSPECTIVE

    Forced type requirement, indicates perspective projection
  * fov: number

    (required) Field of view in radians
  * width: number

    (required) Width of the render space
  * height: number

    (required) Height of the render space
  * near: number

    (required) The near clipping plane
  * far: number

    (requied) The far clipping plane

* onViewChange(camear: Camera, viewId: string): void

  (optional) callback when view is changed

## Properties

**animationEndTime: number**

This is the calculated timestamp at which this camera is 'at rest' and will no longer trigger updates
 
Default value is 0

**needsViewDrawn: boolean**

Indicates the view's associated with this camera should be redrawn

Default value is true

**needsBroadcast: boolean**

Flag indicating the camera needs to broadcast changes applied to it

Default value is false

**viewChangeViewId: string**

The id of the view to be broadcasted for the sake of a change

Default value is empty string

**transform: Transform**

This is the transform that places the camera within world space

Default value is new Transform()

## Methods

**get id()**

Provide an identifier for the camera to follow the pattern of most everything in this framework.

**broadcast(viewId: string)**

Performs the broadcast of changes for the camera if the camera needed a broadcast.
   
**makeOrthographic()**

(static) Quick generation of an camera with  othographic properties.

**makePerspective(options?: Partial<ICameraPerspectiveOptions>)**

(static) Quick generation of a camera with perspective properties

**get projectionType()**

Returns the expected projection style of the camera

**get projection()**

Returns the computed projection of the camera

**get view()**

Returns the computed view transform of the camera

**get needsUpdate()**

Flag indicating the transforms for this camera need updating

**get position()**

**set position(val: Vec3)**

Gets and Sets the poistion of the camera within the world

**lookAt(position: Vec3, up: Vec3)**

Sets the camera to look at a position with up dircection. This in conjunction with 'roll' defines the orientation of the camera viewing the world.

**get scale()**

**set scale(val: Vec3)**

This is a scale distortion the camera views the world with. A scale of 2 along an axis, means the camera will view 2x the amount of the world along that axis (thus having a visual compression if the screen dimensions do not change).

This also has the added benefit of quickly and easily swapping axis directions by simply making the scale -1 for any of the axis.

**get projectionOptions**
**set projectionOptions(val: ICameraOptions)**

Options used for making the projection of the camera. Set new options to update the projection.

Getting the options returns a copy of the object and is not the internal object itself.

**get viewProjection()**

Provides the combined view projection matrices. Applies view first then the projection multiply(P, V).

**resolve()**

This marks the camera's changes as resolved and responded to.

**update(force: boolean)**

force is optional. 

Updates the transform matrices associated with this camera.

**updateProjection()**

Takes the current projection options and produces the projection matrix needed to project elements to the screen.
   
# Camera2D

Camera2D extends Camera.

Camera2D is a complex camera that layers simpler 2D concepts over an actual 3D projection camera. This camera FORCES the orthographic projection type to work with the 2D layering system created.

Essentially this Camera is a two layer concept rolled into one. This is done this way to make the front end API simpler to use and understand while providing ease of use and conveniences for the 2D layer system.

## constructor(options: IControl2DOptions) 

**options: IControl2DOptions**

(optional) Constructor forces 2d camera to be an orthographic projection type and generates the controller that manipulates 2D world.

* IControl2DOptions

  * offset: Vec3

    (optional) The world space offset of elements in the chart

  * scale: Vec3

    (optional) The world space scaling present in the chart

## Properties

**control2D: Control2D**

These are the 2d controls to make manipulating a 2D world easier

## Methods

**get scale2D()**

Gets the scale of 2d control

**get offset()**

Gets the offset of 2d control


 