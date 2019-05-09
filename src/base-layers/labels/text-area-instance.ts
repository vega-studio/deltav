import { observable } from "../../instance-provider/observable";
import { Vec1Compat, Vec2 } from "../../util";
import { RectangleInstance } from "../rectangle";
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
 * CHARACTER: Newlines happen on newline characters OR they happen when the row exceeds maxWidth
 *         and some characters stay in this line while the rest continue on the next line
 * WORD: Newlines happen on newline characters OR they happen when the row exceeds maxWidth
 *         and the whole word continues on the next line
 */
export enum WordWrap {
  NONE,
  CHARACTER,
  WORD
}

/** This is used to mark the specialLetter when divide the textArea into several labels */
export enum SpecialLetter {
  /** When the scanner meets a new line sign ("/n", "/r", "/n/r") */
  NEWLINE
}

export type TextAreaLabel = LabelInstance | SpecialLetter;

export interface ITextAreaInstanceOptions extends ILabelInstanceOptions {
  maxHeight?: number;
  lineHeight?: number;
  wordWrap?: WordWrap;
  alignment?: TextAlignment;
  padding?: Vec1Compat;
  borderWidth?: number;
  hasBorder?: boolean;
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
   * will wrap down to the next line to stay within the space allowed.
   */
  @observable wordWrap: WordWrap = WordWrap.NONE;
  /**
   * This changes how the alignment for the text within the region will appear.
   */
  @observable alignment: TextAlignment = TextAlignment.LEFT;
  /**
   * When onReady is called, this will be populated with all of the labels used to compose this text area
   * SpecialLetter will be used when layoutint labels, it may indicates a new line
   */
  labels: TextAreaLabel[] = [];
  /** This will be used to hold new labels when a label should be divided into two labels because label is at the end a line */
  newLabels: LabelInstance[] = [];
  /** This holds the border of textArea */
  borders: RectangleInstance[] = [];
  /** This holds labelmetrics that will be used to create new labelinstance */
  labelsToLayout: LabelMetrics[] = [];
  /** This stores the old origin which is used to calculate the new positions of labels */
  oldOrigin: [number, number];
  /** This stores old Font size which is used to calculate new font metrics */
  oldFontSize: number;
  /** Stores paddings for the text area, [top, right, bottom, left] */
  @observable padding: Vec1Compat = [0, 0, 0, 0];
  /** Border width */
  @observable borderWidth: number = 6;
  /** Whether the textArea has border */
  @observable hasBorder: boolean = true;

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
    this.wordWrap = options.wordWrap || this.wordWrap;
    this.alignment = options.alignment || this.alignment;
    this.padding = options.padding || this.padding;
    this.borderWidth = options.borderWidth || this.borderWidth;
    this.hasBorder =
      options.hasBorder !== undefined ? options.hasBorder : this.hasBorder;

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

      // Create an element with text "/n" to indicate a new line will be created
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
  /*get glyphs() {
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
  }*/
}
