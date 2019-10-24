# GlyphLayer

## Props

**animate: {<br>&emsp;&emsp;anchor: IAutoEasingMethod<Vec>;<br>&emsp;&emsp;color: IAutoEasingMethod<Vec>;<br>&emsp;&emsp;offset: IAutoEasingMethod<Vec>;<br>&emsp;&emsp;origin: IAutoEasingMethod<Vec>;<br>}**

(optional for animate and its all elements)

Provides easing animation for properties of [GlyphInstance]

**resourceKey: string**

(optional) This is the font resource this pulls from in order to render the glyphs

**scaleMode: ScaleMode**

(optional) This is the scaling strategy the glyph will use when text is involved

**inTextArea: boolean**

(optional) This indicates whether a glyph is in a textArea

# GlyphInstance

## Constructor(options: GlyphInstanceOptions)

**options: GlyphInstanceOptions**

* anchor: Vec2
  (optional) Sets the position the glyph relative to an anchor location on an overrarching label
* character: string
  (optional) The character the glyph will render
* color: Vec4
  (optional) The color to tint the glyph
* depth: number
  (optional) Z distance of the glyph
* fontScale: number
  (optional) Sets the scale of the glyph compared to the font resource's rendering
* maxScale: number
  (optional) Sets the max scale of the glyph
* offset: Vec2
  (optional) Sets the top left location of this glyph's offset from it's origin
* origin: Vec2
  (optional) Sets the anchor point of the glyph to which the glyph scales and rotates about and is positioned
* padding: Vec2
  (optional) the amount of padding from the origin position to the anchor position
* onReady?: (glyph: GlyphInstance) => void
  (optional) Called when this instance is ready for rendering

## Properties

**anchor: Vec2**

Adjustment to position the glyph relative to an anchor location on an overrarching label

Default value is [0, 0]

**character: string**

This is the character the glyph will render

Default value is 'a'

**color: Vec4**

The color to tint the glyph

Default value is [1, 1, 1, 1]

**depth: number**

Z distance of the glyph

Default value is 0

**fontScale: number**

This is the scale of the glyph compared to the font resource's rendering. If the font resource is rendered at 32px, then this needs to be 20 / 32 to render the glyph at a font size of 20

Default value is 1

**maxScale: number**

When in BOUND_MAX mode, this controls how much scaling is allowed up to the base font size

Default value is 1

**offset: Vec2**

The top left location of this glyph's offset from it's origin

Default value is [0, 0]

**origin: Vec2**

This is the anchor point of the glyph to which the glyph scales and rotates about and is positioned

Default value is [0, 0]

**padding: Vec2**

This is the amount of padding from the origin position to the anchor position

Default value is [0, 0]

**parentLabel: LabelInstance**

The label this glyph is associated with (may NOT be associated at all)

**onReady?: (glyph: GlyphInstance) => void**

Called when this instance is ready for rendering

**request: IFontResourceRequest**

This is populated as a result of character updates

## Methods

**clone()**

Make a duplicate of this glyph

**resourceTrigger()**

This will trigger when the resource nmanager is ready to render this glyph
