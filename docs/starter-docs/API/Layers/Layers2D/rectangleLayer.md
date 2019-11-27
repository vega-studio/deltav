# RectangleLayer

RectangleLayer extends [Layer2D]

## IRectangleLayerProps

IRectangleLayerProps extends [ILayer2DProps]

**animate: {<br>&emsp;&emsp;color: IAutoEasingMethod<Vec>;<br>&emsp;&emsp;location: IAutoEasingMethod<Vec>;<br>}**

(optional for animate and all its elements)

Set the animation for properties of rectangleInstance

**scaleFactor(): number**

(optional) Scale factor determining the scale size of the rectangle

# RectangleInstance

RectangleInstance extends [Instance]

## Constructor(options: IRectangleInstanceOptions)

**options: IRectangleInstanceOptions**

IRectangleInstanceOptions extends [IInstanceOptions]

* anchor: Anchor

  (optional) The point on the rectangle which will be placed in world space via the x, y coords. This is also the point which the rectangle will be scaled around.

* depth: number

  (optional) Depth sorting of the rectangle (or the z value of the rectangle)

* scaling: ScaleMode

  (optional) Sets the way the rectangle scales with the world

* color: [number, number, number, number]

  (optional) The color the rectangle should render as

* position: Vec2

  (optional) The coordinate where the rectangle will be anchored to in world space

* size: Vec2

  (optional) The size of the rectangle as it is to be rendered in world space

## Properties

**color: [number, number, number, number]**

This is the rendered color of the rectangle

Default value is [0, 0, 0, 1]

**depth: number**

Depth sorting of the rectangle (or the z value of the rectangle)

Default value is 0

**maxScale: number**

When in BOUND_MAX mode, this allows the rectangle to scale up beyond it's max size

Default value is 1

**scale: number**

Scales the rectangle uniformly

Default value is 1

**scaling: ScaleMode**

Sets the way the rectangle scales with the world

Default value is ScaleMode.BOUND_MAX

**size: Vec2**

The size of the rectangle as it is to be rendered in world space

Default value is [1, 1]

**position: Vec2**

The coordinate where the rectangle will be anchored to in world space

Default value is [0, 0]

## Methods

**get anchor()**

Gets the anchor value

**setAnchor(anchor: Anchor)**

This applies a new anchor to this rectangle and properly determines it's anchor position on the rectangle
