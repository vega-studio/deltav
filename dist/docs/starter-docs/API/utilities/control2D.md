# Control2D

  Controls for 2D world manipulation

## Constructor(camera: Camera2D, options: IControl2DOptions)

  **camera: Camera2D**

  (required) 2D camera this control will manipulate

  **options: IControl2DOptions**

  (optional) Options that will set up the camera

## Properties

  **animation: IAutoEasingMethod<Vec3>**

  The animation set to this camer to animate its scale and offset

  Default value is AutoEasingMehtod.immediate(0)

  **animationEndTime: number**

  Records when the end of animation for the camera will be completed

  Default value is 0

  **camera: Camera2D**

  The 2d camear to work with

  **surface: Surface**

  The surface the camera is controlled by

## Methods

**broadcast(viewId: string)**

Performs the broadcast of changes for the camera if the camera needs a broadcast

**setId(id: number)**

Sets the id of this camera

**centerOn(viewId: string, position: Vec3)**

Adjust offset to set the middle at the provided loaction relative to a provided view



**get needsViewDrawn()**

Returns whether the view needs drawn

**getOffset()**

Gets the source offset value. This is a non-animated version of the offset

**get offset()**

Retrieves the animated value of the offset of the camera

**setOffset(offset: Vec3)**

Sets the location of the camera by adjusting the offsets to match, whatever is set for the "animiation" property determines the animation

**get scale()**

Retrieves the animated scale.

**getScale()**

Gets the source scale value. This is straight end scale value.

**setScale(scale: Vec3)**

Sets and animates the scale of the camera. Whatever is set for the "animation" property determines the animation.

**setViewChangeHandler(handler: Control2D["onViewChange"])**

Applies the handler for broadcasting view changes from the camera

**resolve()**

Resolves all flags indicating updates needed

**update()**

Redraw the view.

