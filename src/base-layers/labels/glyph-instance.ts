import { LabelInstance } from "src/base-layers/labels/label-instance";
import { IFontResourceRequest } from "src/resources";
import {
  IInstanceOptions,
  Instance,
  observable
} from "../../instance-provider";
import { Omit } from "../../types";
import { Vec2, Vec4 } from "../../util/vector";

export type GlyphInstanceOptions = Omit<
  Partial<GlyphInstance>,
  "resourceTrigger" | keyof Instance
> &
  IInstanceOptions;

/**
 * Instance representing a single glyph being rendered.
 */
export class GlyphInstance extends Instance {
  /** Adjustment to position the glyph relative to an anchor location on an overrarching label */
  @observable anchor: Vec2 = [0, 0];
  /** This is the character the glyph will render. */
  @observable character: string = "a";
  /** The color to tint the glyph */
  @observable color: Vec4 = [1, 1, 1, 1];
  /** Z distance of the glyph */
  @observable depth: number = 0;
  /**
   * This is the scale of the glyph compared to the font resource's rendering. If the font resource
   * is rendered at 32px, then this needs to be 20 / 32 to render the glyph at a font size of 20.
   */
  @observable fontScale: number = 1;
  /** The top left location of this glyph offset from it's origin */
  @observable offset: Vec2 = [0, 0];
  /** This is the anchor point of the glyph to which the glyph scales and rotates about and is positioned */
  @observable position: Vec2 = [0, 0];

  /** The label this glyph is associated with (may NOT be associated at all) */
  parentLabel?: LabelInstance;
  /** Fires when this instance is ready for rendering */
  onReady?: (glyph: GlyphInstance) => void;
  /** This is populated as a result of character updates */
  request: IFontResourceRequest;
  /**
   * This records the number of whitespace characters the precedes this glyph. While this does nothing for
   * rendering an individual glyph, this helps anything managing this glyph make smarter decisions about how
   * to place the glyph.
   */
  whiteSpace: number = 0;

  constructor(options: GlyphInstanceOptions) {
    super(options);

    this.position = options.position || this.position;
    this.offset = options.offset || this.offset;
    this.character = options.character || this.character;
    this.color = options.color || this.color;
    this.onReady = options.onReady;
  }

  /**
   * This will trigger when the resource nmanager is ready to render this glyph.
   */
  resourceTrigger() {
    this.offset = this.offset;
    this.position = this.position;
    this.character = this.character;
    this.color = this.color;

    // Indicate this glyph is getting ready to render to the screen
    if (this.onReady) this.onReady(this);
  }
}
