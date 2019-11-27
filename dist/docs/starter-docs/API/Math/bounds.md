# Bounds

This class is used to generate a simple bound shape.

## Constructor(options: IBoundsOptions)

**options: IBoundsOptions**

* x: number

  (optional) Top left x position

* y: number

  (optional) Top left y position

* width: number

  (optional) Width covered

* height: number

  (optional) Height covered

* left: number

  (optional) Specifies the left side of bounds

* right: number

  (optional) Specifies the right side of bounds

* top: number

  (optional) Specifies the top side of bounds

* bottom: number

  (optional) Specifies the bottom side of bounds

## Properties

**x: number**

X position of bounds' top left corner.

Default value is 0.

**y: number**

Y position of bounds' to left corner.

Default value is 0.

**width: number**

Width of bounds

Default value is 0.

**height: number**

Height of bounds

Default value is 0.

**d:T**

It specifies the data type associated with this shape.

## Methods

**get area()**

Returns the area of bounds.

**get bottom()**

Returns the bottom side of bounds.

**get left()**

Returns the left side of bounds.

**get mid(): Vec2**

Returns the center point of bounds.

**get right()**

Returns the right side of bounds.

**get top()**

Returns the top side of bounds.

**get location(): Vec2**

Returns top left position of the bounds.

**emptyBound<T>()**

(static) Returns an empty Bounds object.

**containsPoint(point: Vec2)**

Checks to see if a point in within this bounds object.

**encapsulate(item: Bounds<any> | Vec2)**

Grows this bounds object to cover the space of the provided bounds object or point.

**encapsulateAll(all: Bounds<any>[] | Vec2[])**

Grows the bounds (if needed) to encompass all bounds or points provided.

**fits(bounds: Bounds<T>): 0 | 1 | 2**

Checks to see if the provided bounds object could fit within the dimensions of this bounds object.

This ignores position and just checks width and height.

Returns:

* 0: it doesn't fit
* 1: it fits perfectly
* 2: it just fits

**hitBounds(bounds: Bounds<any>)**

Checks if a bounds object intersects another bounds object.

Returns:

* true: There is intersection

* false: There is no intersection

**isInside(bounds: Bounds<any>): boolean**

Sees if the provided bounds is completely within this bounds object. Unlike fits() this takes position into account.

Returns:

* true: The provide bounds is within this bounds object

* false: The provide bounds is not within this bounds object

**toString()**

Easy readout of this Bounds object.
