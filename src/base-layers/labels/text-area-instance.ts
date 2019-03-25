import { observable } from "../../instance-provider/observable";
import { GlyphInstance } from "./glyph-instance";
import { LabelInstance } from "./label-instance";

/**
 * Alignment mode for text within a region.
 */
export enum TextAlignment {
  LEFT,
  RIGHT,
  CENTERED
}

/**
 * This defines a multi-line area that renders text. This is essentially a label
 * with added properties to handle multi-lining.
 */
export class TextAreaInstance extends LabelInstance {
  /**
   * Specifies how tall the text area can become. If this is exceeded, the final line
   * in the text area will end with ellipses.
   */
  @observable maxHeight: number = 0;
  /**
   * The line height of each line starts at the font size specified for the text area.
   * This property is an offset to that size so custom spacing can be achieved easily between
   * each row of text.
   */
  @observable lineHeight: number = 0;
  /**
   * This indicates if a single line of text should wrap or not. If not, the first word that goes
   * out of bounds will be removed and replaced with ellipses. If true, excess words in a single line
   * will wrap down to the next line to stay within the space allotted.
   */
  @observable lineWrap: boolean = true;
  /**
   * This changes how the alignment for the text within the region will appear.
   */
  @observable alignment: TextAlignment = TextAlignment.LEFT;

  /** When onReady is called, this will be populated with all of the labels used to compose this text area */
  labels: LabelInstance[] = [];

  /**
   * When onReady is called and the labels property is populated. This returns the glyphs that are rendered
   * for this text area.
   *
   * NOTE: This is pretty expensive for large amounts of text.
   */
  get glyphs() {
    let glyphs: GlyphInstance[] = [];

    for (let i = 0, iMax = this.labels.length; i < iMax; ++i) {
      glyphs = glyphs.concat(this.labels[i].glyphs);
    }

    return glyphs;
  }
}
