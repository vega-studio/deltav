# RingLayer

RingLayer extends [Layer2D]

## IRingLayerProps

IRingLayerProps extends [ILayer2DProps]

**animate: {<br>&emsp;&emsp;color: IAutoEasingMethod<Vec>;<br>&emsp;&emsp;center: IAutoEasingMethod<Vec>;<br>&emsp;&emsp;radius: IAutoEasingMethod<Vec>;<br>}**

(optional for animate and its all elements)

Provides easing animation for properties of [RingInstance]

**scaleFactor(): number**

(optional) Sets a scaling factor for the circle's radius

# RingInstance

RingInstance extends [Instance]

## Constructor(options: IRingInstanceOptions)

**options: IRingInstanceOptions**

IRingInstanceOptions extends [IInstanceOptions]

* center: Vec2

  (optional) The center of the ring

* color: [number, number, number, number]

  (optional) The color of this ring

* depth: number

  (optional) The z depth of the ring (for draw ordering)

* radius: number

  (optional) The outer radius of the ring

* thickness: number

  (optional) The thickness of the ring

## Properties

**color: [number, number, number, number]**

The color of this ring

Default value is [1.0, 1.0, 1.0, 1.0]

**center: Vec2**

The center of the ring

Default value is [0, 0]

**depth: number**

The z depth of the ring (for draw ordering)

Default value is 0

**radius: number**

The outer radius of the ring

Default value is 0

**thickness: number**

The thickness of the ring

Default value is 1

## Methods

**get width()**

Returns width of ringInstance (2 x radius)

**get height()**

Returns height of ringInstance (2 x radius)

**get innerRadius()**

Returns radius of the inner circle of ring
