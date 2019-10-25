# LabelLayer

LabelLayer extends [Layer2D]

## LabelLayerProps

LabelLayerProps extends [Layer2DProps]

**animate: {<br>&emsp;&emsp;anchor: IAutoEasingMethod<Vec>;<br>&emsp;&emsp;color: IAutoEasingMethod<Vec>;<br>&emsp;&emsp;offset: IAutoEasingMethod<Vec>;<br>&emsp;&emsp;origin: IAutoEasingMethod<Vec>;<br>}**

(optional for animate and all its elements)

Animation methods for various properties of the glyphs

**customGlyphLayer?: ILayerConstructionClass<GlyphInstance, IGlyphLayerOptions<GlyphInstance>>**

(optional) A custom layer to handle rendering glyph instances

**resourceKey: string**

(optional) String identifier of the resource font to use for the layer

**scaleMode: ScaleMode**

(optional) The scaling strategy the labels will use wheh scaling the scene up and down

ScaleMode has three options:

* ALWAYS: The size of the image will be tied to world space
* BOUND_MAX: The image will scale to it's font size then stop growing
* NEVER: The image will alwyas retain it's font size on screen

**truncation: string**

(optional) This defines what characters to use to indicate truncation of labels when needed. This
defaults to ellipses or three periods '...'

**inTextArea: boolean**

(optional) This indicates whether a label is in a textarea

# LabelInstance

LabelInstance extends [Instance]

## Constructor(options: ILabelInstanceOptions)

**options: ILabelInstanceOptions**

ILabelInstanceOptions extends [InstanceOptions]

* color: [number, number, number, number]

  (required) The color the label should render as

* text: string

  (required) The text rendered by this label

* origin: Vec2

  (required) The xy coordinate where the label will be anchored to in world space

* anchor: Anchor

  (optional) The point on the label which will be placed in world space via the x, y coords. This is also the point which the label will be scaled around

* depth: number

  (optional) Depth sorting of the label (or the z value of the label)

* fontSize: number

  (optional) The font size of the label in px

* maxWidth: number

  (optional) When this is set labels will only draw the label up to this size. If below, the label will automatically truncate with ellipses

* maxScale: number

  (optional) When in BOUND_MAX mode, this allows the label to scale up beyond it's max size

* scale: number

  (optional) Scales the label uniformly

* preload: boolean

  (optional) Special flag for the instance that will cause the instance to not render any glyphs but will ensure the label's Kerning is calculated

* letterSpacing: number

  (optional) Spacing width between letters in a label

* onReady(instance: LabelInstance): void

  (optional) Event when the label is completely ready to render all of it's glyphs

## Properties

**color: [number, number, number, number]**

This is the rendered color of the label

Default value is [0, 0, 0, 1]

**text: string**

The rendered text by this label

Default value is an empty string

**origin: Vec2**

The xy coordinate where the label will be anchored to in world space

Default value is [0, 0]

**anchor: Anchor**

This is the anchor location relative to the label's render space

Default value is:

```
{
    padding: 0,
    paddingDirection: [0, 0],
    type: AnchorType.TopLeft
    x: 0,
    y: 0
}
```

**depth: number**

Depth sorting of the label (or the z value of the label)

Default value is 0

**fontSize: number**

Font size in world coordinates. This causes scaling relative to the base font resource available. IE- If the font resource is rendered at 32 and this is 16, then the output rendering will be glyphs that are 50% the size of the rendered glyph in the font map. This can cause artefacts based on the rendering strategy used.

Default value is 12

**maxWidth: number**

This is the maximum width the label can take up. If this is exceeded the label gets truncated. A max width of 0 or less is unbounded and will not truncate the text. When a max width is specified, there will always be a minimum requirement to show ellipses which inevitably causes a min width to arise and is dependent on the font in use.

Default value is 0

**maxScale: number**

When in BOUND_MAX mode, this controls how much scaling is allowed up to the base font size

Default value is 1

**scale: number**

Scales the label uniformly

Default value is 1.0

**letterSpacing: number**

Spacing width between letters in a label

Default value is 0

**onReady(instance: LabelInstance) => void**

This executes when the label is finished waiting for it's glyphs to be ready to render

**parentTextArea: TextAreaInstance**

The text area this label is associated with (may NOT be associated at all)

**preload: boolean**

Special flag for the instance that will cause the instance to not render any glyphs but will ensure the label's Kerning is calculated

Default value is false

**glyphs: GlyphInstance[]**

After the label has been rendered, this will be populated with all of the glyphs that have been created for the label. Using this you can manipulate each character very easily.

NOTE: it helps to use nextFrame() to wait for this to be populated after the label has been mounted.

Default value is []

**size: Size**

After the label has been rendered, this will be populated with the calculated width and height of the label

Default value is [0, 0]

**truncatedText: string**

If a maxWidth is specified, there is a chance the text will be truncated. This provides the calculated truncated text. If not populated, then no truncation has happened.

Default value is an empty string

## Methods

**getWidth(): number**

Returns width of label

**setAnchor(anchor: Anchor)**

This applies a new anchor to this label and properly determines it's anchor position on the label

**subTextGlyphs(text: string): GlyphInstance[]**

Looks for the subtext provided, then provides the glyphs for that subtext if any
