# ArcLayer

ArcLayer displays arcs and provides controls for displaying them in interesting ways. ArcLayer extends from Layer2D

## Props

**animate: { <br>&emsp;&emsp;angle: IAutoEasingMethod<Vec>; <br>&emsp;&emsp;angleOffset: IAutoEasingMethod<Vec>; <br>&emsp;&emsp;center: IAutoEasingMethod<Vec>; <br>&emsp;&emsp;colorEnd: IAutoEasingMethod<Vec>; <br>&emsp;&emsp;colorStart: IAutoEasingMethod<Vec>; <br>&emsp;&emsp;radius: IAutoEasingMethod<Vec>; <br>&emsp;&emsp;thickness: IAutoEasingMethod<Vec>;<br>}**

(optional for animate and its all elements)

Provides easing animation for properties of [ArcInstance]

**scaleType: ArcScaleType**

(optional) This specifies the scale Type of arc

ArcScaleType has two options:

* NONE: All dimensions are within world space
* SCREEN_CURVE: The thickness of the arc is in screen space. Thus, camera zoom changes will not affect it and must be controlled by scaleFactor alone.

# ArcInstance

## Constructor(options: IArcInstanceOptions)

**options: IArcInstanceOptions**

* angle: Vec2

  (required) The start and end angle of the arc

* center: Vec2

  (required) The center point where the arc wraps around

* colorEnd: Vec4

  (optional) This is the end color of the arc

* colorStart: Vec4

  (optional) This is the start color of the arc

* depth: number

  (optional) Depth sorting of the arc (or the z value of the lable)

* radius: number

  (required) The radius of how far the middle of the arc is from the center point

* thickness?: Vec2

  (optional) The start to end thickness of the arc

## Properties

**angle: Vec2**

The start and end angle of the arc

Default value is [0, Math.PI]

**colorEnd: Vec4**

This is the end color of the arc

Default value is [1, 1, 1, 1]

**colorStart: Vec4**

This is the start color of the arc

Default value is [1, 1, 1, 1]

**center: Vec2**

The center point where the arc wraps around

Default value is [0, 0]

**depth: number**

Depth sorting of the arc (or the z value of the arc)

Default value is 0

**angleOffset: number**

An offset to apply to the angle. This makes it easy to animate the arc or set a point of reference
for angle 0

Default value is 0

**radius: number**

The radius of how far the middle of the arc is from the center point

Default value is 1

**thickness: Vec2**

The start to end thickness of the arc

Default value is [5, 5]
