import { observable } from "../../../instance-provider";
import {
  IInstanceOptions,
  Instance
} from "../../../instance-provider/instance";
import { isWhiteSpace, Size } from "../../../types";
import { Vec2 } from "../../../util";
import { Anchor, AnchorType } from "../../types";
import { GlyphInstance } from "./glyph-instance";
import { TextAreaInstance } from "./text-area-instance";

export interface ILabelInstanceOptions extends IInstanceOptions {
  /**
   * The point on the label which will be placed in world space via the x, y coords. This is also the point
   * which the label will be scaled around.
   */
  anchor?: Anchor;
  /** The color the label should render as */
  color: [number, number, number, number];
  /** Depth sorting of the label (or the z value of the label) */
  depth?: number;
  /** The font size of the label in px */
  fontSize?: number;
  /** When this is set labels will only draw the label up to this size. If below, the label will automatically truncate with ellipses */
  maxWidth?: number;
  /** When in BOUND_MAX mode, this allows the label to scale up beyond it's max size */
  maxScale?: number;
  /** Scales the label uniformly */
  scale?: number;
  /** The text rendered by this label*/
  text: string;
  /** The x coordinate where the label will be anchored to in world space */
  origin: Vec2;
  /**
   * Special flag for the instance that will cause the instance to not render any glyphs but will ensure the label's
   * Kerning is calculated.
   */
  preload?: boolean;
  /** Spacing width between letters in a label */
  letterSpacing?: number;
  /** Event when the label is completely ready to render all of it's glyphs */
  onReady?(instance: LabelInstance): void;
}

/**
 * This generates a new label instance which will render a single line of text for a given layer.
 * There are restrictions surrounding labels due to texture sizes and rendering limitations.
 */
export class LabelInstance extends Instance {
  /** This is the rendered color of the label */
  @observable color: [number, number, number, number] = [0, 0, 0, 1];
  /** Depth sorting of the label (or the z value of the label) */
  @observable depth: number = 0;
  /**
   * Font size in world coordinates. This causes scaling relative to the base font resource available.
   * IE- If the font resource is rendered at 32 and this is 16, then the output rendering will
   *     be glyphs that are 50% the size of the rendered glyph in the font map. This can cause
   *     artefacts based on the rendering strategy used.
   */
  @observable fontSize: number = 12;
  /** When in BOUND_MAX mode, this controls how much scaling is allowed up to the base font size */
  @observable maxScale: number = 1;
  /**
   * This is the maximum width the label can take up. If this is exceeded the label gets truncated.
   * A max width of 0 or less is unbounded and will not truncate the text. When a max width is specified,
   * there will always be a minimum requirement to show ellipses which inevitably causes a min width to
   * arise and is dependent on the font in use.
   */
  @observable maxWidth: number = 0;
  /** The x coordinate where the label will be anchored to in world space */
  @observable origin: Vec2 = [0, 0];
  /** Scales the label uniformly */
  @observable scale: number = 1.0;
  /** The rendered text for the label. */
  @observable text: string = "";
  /** Spacing between letters in a label */
  @observable letterSpacing: number = 0;

  /** This executes when the label is finished waiting for it's glyphs to be ready to render */
  onReady?: (label: LabelInstance) => void;
  /** The text area this label is associated with (may NOT be associated at all) */
  parentTextArea?: TextAreaInstance;
  /**
   * Special flag for the instance that will cause the instance to not render any glyphs but will ensure the label's
   * Kerning is calculated.
   */
  preload: boolean = false;
  /**
   * After the label has been rendered, this will be populated with all of the glyphs that
   * have been created for the label. Using this you can manipulate each character very easily.
   *
   * NOTE: it helps to use nextFrame() to wait for this to be populated after the label has been mounted.
   */
  glyphs: GlyphInstance[] = [];
  /**
   * After the label has been rendered, this will be populated with the calculated width and height of the
   * label.
   */
  size: Size = [0, 0];

  /**
   * If a maxWidth is specified, there is a chance the text will be truncated.
   * This provides the calculated truncated text. If not populated, then no truncation
   * has happened.
   */
  truncatedText: string = "";

  /** This is the anchor location relative to the label's render space */
  @observable
  anchor: Anchor = {
    padding: 0,
    paddingDirection: [0, 0],
    type: AnchorType.TopLeft,
    x: 0,
    y: 0
  };

  constructor(options: ILabelInstanceOptions) {
    super(options);

    this.anchor = options.anchor || this.anchor;
    this.color = options.color || this.color;
    this.depth = options.depth || this.depth;
    this.fontSize = options.fontSize || this.fontSize;
    this.maxScale = options.maxScale || this.maxScale;
    this.maxWidth = options.maxWidth || 0;
    this.onReady = options.onReady;
    this.origin = options.origin;
    this.preload = options.preload || false;
    this.scale = options.scale || this.scale;
    this.text = options.text || this.text;
    this.letterSpacing = options.letterSpacing || this.letterSpacing;

    // Make sure the anchor is set to the appropriate location
    options.anchor && this.setAnchor(options.anchor);
  }

  getWidth(): number {
    return this.size[0];
  }

  /**
   * This applies a new anchor to this label and properly determines it's anchor position on the label
   */
  setAnchor(anchor: Anchor) {
    const newAnchor = {
      padding: anchor.padding || 0,
      type: anchor.type,
      x: anchor.x || 0,
      y: anchor.y || 0
    };

    // Apply the anchor
    this.anchor = newAnchor;
  }

  /**
   * Looks for the subtext provided, then provides the glyphs for that subtext if any.
   */
  subTextGlyphs(text: string): GlyphInstance[] {
    const glyphs: GlyphInstance[] = [];
    const index = this.text.indexOf(text);
    // The substring must exist within the text.
    if (index < 0) return glyphs;
    // Current glyph index we are at as white space does not receive a glyph.
    let glyphIndex = 0;

    for (
      let i = 0, iMax = Math.min(this.text.length, index + text.length);
      i < iMax;
      ++i
    ) {
      if (!isWhiteSpace(this.text[i])) {
        glyphIndex++;

        if (i >= index) {
          glyphs.push(this.glyphs[glyphIndex]);
        }
      }
    }

    return glyphs;
  }

  /**
   * Trigger for when resources are prepped for this instance
   */
  resourceTrigger() {
    // No triggers are needed for the label instance as it's a wrapper for glyphs.
    // The only trigger needed is when the active flag is altered by the manager.
  }
}
