# ArcLayer

ArcLayer displays arcs and provides controls for displaying them in interesting ways. ArcLayer extends from Layer2D

## Props

**animate?: { angle?: IAutoEasingMethod<Vec>; angleOffset?: IAutoEasingMethod<Vec>; center?: IAutoEasingMethod<Vec>; colorEnd?: IAutoEasingMethod<Vec>; colorStart?: IAutoEasingMethod<Vec>; radius?: IAutoEasingMethod<Vec>; thickness?: IAutoEasingMethod<Vec>;};** (optional for animate and its all elements)

Provides easing animation for properties of [ArcInstance]

**scaleType: ArcScaleType** (optional)

This specifies the scale Type of arc

ArcScaleType has two options:

* NONE: All dimensions are within world space
* SCREEN_CURVE: The thickness of the arc is in screen space. Thus, camera zoom changes will not affect it and must be controlled by scaleFactor alone.
