# EdgeLayer

## Props

**animate : { end: IAutoEasingMethod<Vec>; start: IAutoEasingMethod<Vec>; startColor: IAutoEasingMethod<Vec>; endColor: IAutoEasingMethod<Vec>; control: IAutoEasingMethod<Vec>; thickness: IAutoEasingMethod<Vec>;}** (optional for animate and all its elements)

Porperties for animating attributes

**broadphase : EdgeBroadphase** (optional)

Allows adjustments for broadphase interactions for an edge

EdgeBroadphase has three options:

* ALL: Use this if the broad phase detection should use both width and height of the edge's bounds
* PASS_Y: Use this to ensure a test against the edge is performed if the mouse aligns with it on the x-axis
* PASS_X: Use this to ensure a test against the edge is performed if the mouse aligns with it on the y axis

**minPickDistance : number** (optional)

Any distance to the mouse from an edge that is less than this distance will be picked

**opacity : number** (optional)

The transparency of the layer as a whole. (Makes for very efficient fading of all elements)

**scaleType : EdgeScaleType** (optional)

If this is set, then the thickness of the line and the curvature of the line exists in screen space rather than world space.

EdgeScaleType has two options:

* NONE : All dimensions are within world space
* SCREEN_CURVE : The control points are a delta from the end points within screen space, and the line thickness is within screen space as well all measured in pixels. The scaleFactor scales both thickness and control delta values. The endpoints remain in world space

**type : EdgeType** (required)

specifies how the edge is formed

EdgeType has three options:

* LINE: Makes a straight edge with no curve
* BEZIER: Makes a single control point Bezier curve
* BEZIER2: Makes a two control point bezier curve
