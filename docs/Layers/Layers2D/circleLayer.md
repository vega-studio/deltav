# CircleLayer

CircleLayer displays circles and provides controls for displaying them in interesting ways.

Circle layer extends from [Layer2D]

## ICircleLayerProps

ICircleLayerProps extends [ILayer2DProps]

**animate: { <br>&emsp;&emsp;center: IAutoEasingMethod<Vec>; <br>&emsp;&emsp;radius: IAutoEasingMethod<Vec>; <br>&emsp;&emsp;color: IAutoEasingMethod<Vec>;<br>}**

(optional for animate and its all elements)

Provides easing animation for properties of [CircleInstance]

**scaleFactor(): number**

(optional) This sets a scaling factor for the circle's radius

**opacity(): number**

(optional) Opactiy of the layer as a whole

**usePoints: boolean**

(optional) When set, this causes the circles to be rendered utilizing the hardware POINTS mode.

# CircleInstance

CircleInstance extends [Instance]

## constructor (options: ICircleInstanceOptions)

**options: ICircleInstanceOptions**

ICircleInstanceOptions extends [IInstanceOptions]

* center: Vec2

  (required) Center position of the circle

* radius: number

  (requied) The radius of the cirlce

* color: [number, number, number, number]

  (optional) The color of this circle

* depth: number

  (optional) The z depth of the circle (for draw ordering)

## Properties

**color: [number, number, number, number]**

The color of this circle

Default value is [1.0, 1.0, 1.0, 1.0]

**depth: number**

The z depth of the circle (for draw ordering)

Default value is 0

**radius: number**

The radius of the circle

Default value is 0

**center: Vec2**

Center position of the circle

Default value is [0, 0]

## Methods

**get width()**

returns width of circle (radius x 2)

**get height()**

returns height of circle (radius x 2)
