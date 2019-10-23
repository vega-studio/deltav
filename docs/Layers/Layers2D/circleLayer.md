# CircleLayer

CircleLayer displays circles and provides controls for displaying them in interesting ways. Circle layer extends from Layer2D

## Props

**animate: { center: IAutoEasingMethod<Vec>; radius: IAutoEasingMethod<Vec>; color: IAutoEasingMethod<Vec>;}** (optional for animate and its all elements)

Provides easing animation for properties of [CircleInstance]

**scaleFactor(): number** (optional)

This sets a scaling factor for the circle's radius

**opacity(): number** (optional)

Opactiy of the layer as a whole

**usePoints: boolean** (optional)

When set, this causes the circles to be rendered utilizing the hardware POINTS mode.
