# EdgeLayer

## Props

**animate : { <br>&emsp;&emsp;end: IAutoEasingMethod<Vec>; <br>&emsp;&emsp;start: IAutoEasingMethod<Vec>; <br>&emsp;&emsp;startColor: IAutoEasingMethod<Vec>; <br>&emsp;&emsp;endColor: IAutoEasingMethod<Vec>; <br>&emsp;&emsp;control: IAutoEasingMethod<Vec>; <br>&emsp;&emsp;thickness: IAutoEasingMethod<Vec>;<br>}**

(optional for animate and all its elements)

Porperties for animating attributes

**broadphase : EdgeBroadphase**

(optional) Allows adjustments for broadphase interactions for an edge

EdgeBroadphase has three options:

* ALL: Use this if the broad phase detection should use both width and height of the edge's bounds
* PASS_Y: Use this to ensure a test against the edge is performed if the mouse aligns with it on the x-axis
* PASS_X: Use this to ensure a test against the edge is performed if the mouse aligns with it on the y axis

**minPickDistance : number**

(optional) Any distance to the mouse from an edge that is less than this distance will be picked

**opacity : number**

(optional) The transparency of the layer as a whole. (Makes for very efficient fading of all elements)

**scaleType : EdgeScaleType**

(optional) If this is set, then the thickness of the line and the curvature of the line exists in screen space rather than world space.

EdgeScaleType has two options:

* NONE : All dimensions are within world space
* SCREEN_CURVE : The control points are a delta from the end points within screen space, and the line thickness is within screen space as well all measured in pixels. The scaleFactor scales both thickness and control delta values. The endpoints remain in world space

**type : EdgeType**

(required) specifies how the edge is formed

EdgeType has three options:

* LINE: Makes a straight edge with no curve
* BEZIER: Makes a single control point Bezier curve
* BEZIER2: Makes a two control point bezier curve

# EdgeInstance

## Constructor(options: IEdgeInstanceOptions)

**options: IEdgeInstanceOptions**

* start: Vec2

  (required) Beginning point of the edge.

* end: Vec2

  (required) End point of the edge.

* control: Vec2[]

  (optional) This is the list of control points

* depth: number

  (optional) The z depth of the edge (for draw ordering)

* startColor: Vec4

  (optional) Start color of the edge

* endColor: Vec4

  (optional) End color of the edge

* thickness: Vec2

  (optional) Start width of the edge

## Properties

**control: Vec2[]**

This is the list of control points

Default value is [[0, 0], [0, 0]]

**depth: number**

The z depth of the edge (for draw ordering)

Default value is 0

**end: Vec2**

End point of the edge

Default value is [0, 0]

**endColor: Vec4**

End color of the edge

Default value is [1.0, 1.0, 1.0, 1.0]

**start: Vec2**

Beginning point of the edge

Default value is [0, 0]

**startColor: Vec4**

Start color of the edge

Default value is [1.0, 1.0, 1.0, 1.0]

**thickness: Vec2**

Start width of the edge

Default value is [1.0, 1.0]

## Methods

**get length()**

Calculates length from beginning point to end point

**get midpoint()**

Calculates the midpoint of the edge

**get perpendicular()**

Calculates a perpendicular direction vector to the edge

**setEdgeThickness(thickness: number)**

Applies the edge width to the start and end

**setColor(color: Vec4)**

Applies the color to the start and end
