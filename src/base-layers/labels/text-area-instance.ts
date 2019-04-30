import { Vec2 } from "src/util";
import { observable } from "../../instance-provider/observable";
import { RectangleInstance } from "../rectangle";
import { GlyphInstance } from "./glyph-instance";
import { ILabelInstanceOptions, LabelInstance } from "./label-instance";

/**
 * Alignment mode for text within a region.
 */
export enum TextAlignment {
  LEFT,
  RIGHT,
  CENTERED
}

/**
 * WordWrap mode
 * NONE: New lines ONLY happen when an explicit newline character ('\n', '\r', '\n\r') occurs.
 *       Lines that exceed the maxWidth will be truncated.
 * NORMAL: Newlines happen on newline characters OR they happen when the row exceeds maxWidth
 *         and thus continue on the next line
 */
export enum WordWrap {
  NONE,
  NORMAL
}

/** SpecialLetter such as NEWLINE */
export enum SpecialLetter {
  NEWLINE
}

export interface ITextAreaInstanceOptions extends ILabelInstanceOptions {
  maxHeight?: number;
  lineHeight?: number;
  lineWrap?: WordWrap;
  alignment?: TextAlignment;
}

/** Use to create new labelInstance */
export type LabelMetrics = {
  position: Vec2;
  text: string;
};

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
   * This specifies how tall a line should be for each line.
   */
  @observable lineHeight: number = 0;
  /**
   * This indicates if a single line of text should wrap or not. If not, the first word that goes
   * out of bounds will be removed and replaced with ellipses. If true, excess words in a single line
   * will wrap down to the next line to stay within the space allotted.
   */
  @observable lineWrap: WordWrap = WordWrap.NONE;
  /**
   * This changes how the alignment for the text within the region will appear.
   */
  @observable alignment: TextAlignment = TextAlignment.LEFT;
  /** When onReady is called, this will be populated with all of the labels used to compose this text area */
  labels: (LabelInstance | SpecialLetter)[] = [];
  /** This will be used to hold new labels when a label should be divided into two labels because label is at the end a line */
  newLabels: LabelInstance[] = [];
  /** This holds the border of textArea */
  borders: RectangleInstance[] = [];
  /** This holds labelmetrics that will be used to create new labelinstance */
  labelsToLayout: LabelMetrics[] = [];
  /** This creates a labelInstance with all distinct letters in the textArea */
  labelForMap: LabelInstance;
  /** This stores the old origin which is used to calculate the new positions of labels */
  oldOrigin: [number, number];
  /** This stores old Font size which is used to calculate new font metrics */
  oldFontSize: number;

  constructor(options: ITextAreaInstanceOptions) {
    super(options);

    this.color = options.color;
    this.origin = options.origin;
    this.oldOrigin = options.origin;
    this.text = options.text;

    this.fontSize = options.fontSize || this.fontSize;
    this.oldFontSize = this.fontSize;
    this.maxWidth = options.maxWidth || this.maxWidth;

    this.maxHeight = options.maxHeight || this.maxHeight;
    this.lineHeight = options.lineHeight || this.lineHeight;
    this.lineWrap = options.lineWrap || this.lineWrap;
    this.alignment = options.alignment || this.alignment;

    this.generateLabels();
  }

  /** Populated the labelToLayout */
  generateLabels() {
    const lines: string[] = this.text.split(/\n|\r|\r\n/);
    const endi = lines.length - 1;
    for (let i = 0; i < endi; i++) {
      const line = lines[i];
      const wordsInLine = line.split(" ");

      for (const w of wordsInLine) {
        if (w !== "") {
          this.labelsToLayout.push({
            position: [0, 0],
            text: w
          });
        }
      }

      // new line sign
      this.labelsToLayout.push({
        position: [0, 0],
        text: "/n"
      });
    }

    const lastLine = lines[endi];
    const wordsInLine = lastLine.split(" ");

    for (const w of wordsInLine) {
      if (w !== "") {
        this.labelsToLayout.push({
          position: [0, 0],
          text: w
        });
      }
    }
  }

  /**
   * When onReady is called and the labels property is populated. This returns the glyphs that are rendered
   * for this text area.
   *
   * NOTE: This is pretty expensive for large amounts of text.
   */
  get glyphs() {
    let glyphs: GlyphInstance[] = [];

    for (let i = 0, iMax = this.labels.length; i < iMax; ++i) {
      const label = this.labels[i];
      if (label instanceof LabelInstance) {
        glyphs = glyphs.concat(label.glyphs);
      }
    }

    return glyphs;
  }

  set glyphs(_glyphs: GlyphInstance[]) {
    //
  }
}
