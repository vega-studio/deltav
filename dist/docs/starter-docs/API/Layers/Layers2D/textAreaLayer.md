# TextAreaLayer

TextAreaLayer extends [Layer2D]

## ITextAreaLayerProps

ITextAreaLayerProps extends [ILayer2DProps]

**animateLabel:{<br>&emsp;&emsp;anchor: IAutoEasingMethod<Vec>;<br>&emsp;&emsp;color: IAutoEasingMethod<Vec>;<br>&emsp;&emsp;offset: IAutoEasingMethod<Vec>;<br>&emsp;&emsp;origin: IAutoEasingMethod<Vec>;<br>}**

(optional for animateLabel and all its elements)

Animation methods for various properties of the glyphs

**animateBorder: {<br>&emsp;&emsp;color: IAutoEasingMethod<Vec>;<br>&emsp;&emsp;location: IAutoEasingMethod<Vec>;<br>}**

(optional for animateLabel and all its elements)

Animation methods fro various properties of the borders

**customGlyphLayer: ILayerConstructionClass<GlyphInstanceIGlyphLayerOptions<GlyphInstance>>**

(optional) A custom layer to handle rendering glyph instances

**resourceKey: string**

(optional) String identifier of the resource font to use for the layer

**whiteSpaceKerning: number**

(optional) This number represents how much space each whitespace character represents

**scaling: ScaleMode**

(optional) Sets the scaling mode of textArea

Scaling has three options:

* ALWAYS: The size of the image will be tied to world space
* BOUND_MAX: The image will scale to it's font size then stop growing
* NEVER: The image will always retain it's font size on screen

# TextAreaInstance

TextAreaInstance extends [LabelInstance]

## Constructor(options: ITextAreaInstanceOptions)

**options: ITextAreaInstanceOptions**

ITextAreaInstanceOptions extends [ITextAreaInstanceOptions]

* alignments: TextAlignment

  (optional) Sets the alignment of TextArea

  TextAlignment has three options: LEFT, RIGHT, CENTERED

* borderWidth: number

  (optional) Sets thickness of the border is needed

* hasBorder: boolean

  (optional) Decides whether the border of textArea is included

* letterSpacing: number

  (optional) Sets the distance between letters in a word

* lineHeight: number

  (optional) Sets the distance between lines in a textArea

* maxHeight: number

  (optional) This sets max height the text area can render. Any text beyond this height will not be rendered. This also establishes the borders' height to be rendered if included

* padding: Vec1Compat

  (optional) This sets distance from top, left, right, bottom of border to content of text

* wordWrap: WordWrap

  (optional) This decides the way to wrap a word whether this word exceeds maxWidth

  WordWrap has three options:

  * NONE: New lines ONLY happen when an explicit newline character ('\n', '\r', '\n\r') occurs. Lines that exceed the maxWidth will be truncated.
  * CHARACTER: Newlines happen on newline characters OR they happen when the row exceeds maxWidth and some characters stay in this line while the rest continue on the next line.
  * WORD: Newlines happen on newline characters OR they happen when the row exceeds maxWidth and the whole word continues on the next line.

## Properties

**maxHeight: number**

Specifies the max height the text area can become. If this is exceeded, the final line in the text area will end with ellipses.

Default value is 0

**lineHeight: number**

This specifies how tall a line should be for each line

Default value is 0

**wordWrap: WordWrap**

This indicates if a single line of text should wrap or not. If not, the first word that goes out of bounds will be removed and replaced with ellipses. If true, excess words in a single line will wrap down to the next line to stay within the space allowed.

Default value is WordWrap.NONE

**alignment: TextAlignment**

This changes how the alignment for the text within the region will appear.

Default value is TextAlignment.LEFT

**labels: TextAreaLabel[]**

When onReady is called, this will be populated with all of the labels used to compose this text area. SpecialLetter will be used when laying out labels, it may indicates a new line

Default value is []

**newLabels: LabelInstance[]**

This will be used to hold new labels when a label should be divided into two labels because label is at the end a line.

Default value is []

**borders: BorderInstance[]**

This holds the borders of textArea

Default value is []

**padding: Vec1Compat**

Stores paddings for the text area, [top, right, bottom, left]

Default value is [0, 0, 0, 0]

**borderWidth: number**

Width of borders

Default value is 6

**hasBorder: boolean**

Whether the textArea has border

Default value is true

**spaceWidth: number**

Width of space in a textArea

Default value is 0
