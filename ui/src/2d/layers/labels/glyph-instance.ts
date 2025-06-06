import {
  IInstanceOptions,
  Instance,
  makeObservable,
  observable,
} from "../../../instance-provider";
import { Vec2, Vec4 } from "../../../math/vector.js";
import { IFontResourceRequest } from "../../../resources";
import { Omit } from "../../../types.js";
import { LabelInstance } from "./label-instance.js";

export type GlyphInstanceOptions = Omit<
  Partial<GlyphInstance>,
  "resourceTrigger" | keyof Instance | "parentLabel" | "request"
> &
  IInstanceOptions;

/**
 * Instance representing a single glyph being rendered.
 */
export class GlyphInstance extends Instance {
  /** Adjustment to position the glyph relative to an anchor location on an overrarching label */
  @observable anchor: Vec2 = [0, 0];
  /** This is the character the glyph will render. */
  @observable character = "a";
  /** The color to tint the glyph */
  @observable color: Vec4 = [1, 1, 1, 1];
  /** Z distance of the glyph */
  @observable depth = 0;
  /**
   * This is the scale of the glyph compared to the font resource's rendering. If the font resource
   * is rendered at 32px, then this needs to be 20 / 32 to render the glyph at a font size of 20.
   */
  @observable fontScale = 1;
  /** When in BOUND_MAX mode, this controls how much scaling is allowed up to the base font size */
  @observable maxScale = 1;
  /** The top left location of this glyph's offset from it's origin */
  @observable offset: Vec2 = [0, 0];
  /** This is the anchor point of the glyph to which the glyph scales and rotates about and is positioned */
  @observable origin: Vec2 = [0, 0];
  /** This is the amount of padding from the origin position to the anchor position */
  @observable padding: Vec2 = [0, 0];

  /** The label this glyph is associated with (may NOT be associated at all) */
  parentLabel?: LabelInstance;
  /** Fires when this instance is ready for rendering */
  onReady?: (glyph: GlyphInstance) => void;
  /** This is populated as a result of character updates */
  request?: IFontResourceRequest;

  constructor(options: GlyphInstanceOptions) {
    super(options);
    makeObservable(this, GlyphInstance);

    this.origin = options.origin || this.origin;
    this.offset = options.offset || this.offset;
    this.character = options.character || this.character;
    this.color = options.color || this.color;
    this.maxScale = options.maxScale || this.maxScale;
    this.padding = options.padding || this.padding;
    this.anchor = options.anchor || this.anchor;
    this.onReady = options.onReady;
  }

  /**
   * Make a duplicate of this glyph
   */
  clone() {
    const glyph = new GlyphInstance(this);
    glyph.onReady = this.onReady;
    glyph.request = this.request;
  }

  /**
   * This will trigger when the resource nmanager is ready to render this glyph.
   */
  resourceTrigger() {
    // eslint-disable-next-line no-self-assign
    this.offset = this.offset;
    // eslint-disable-next-line no-self-assign
    this.origin = this.origin;
    // eslint-disable-next-line no-self-assign
    this.character = this.character;
    // eslint-disable-next-line no-self-assign
    this.color = this.color;

    // Indicate this glyph is getting ready to render to the screen
    if (this.onReady) this.onReady(this);
  }
}
