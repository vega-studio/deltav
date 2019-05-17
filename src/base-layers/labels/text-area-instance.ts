import { observable } from "../../instance-provider/observable";
import { Vec1Compat } from "../../util";
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

/** WordWrap mode */
export enum WordWrap {
  /**
   * NONE: New lines ONLY happen when an explicit newline character ('\n', '\r', '\n\r') occurs.
   * Lines that exceed the maxWidth will be truncated.
   */
  NONE,
  /**
   * CHARACTER: Newlines happen on newline characters OR they happen when the row exceeds maxWidth
   * and some characters stay in this line while the rest continue on the next line.
   */
  CHARACTER,
  /**
   * WORD: Newlines happen on newline characters OR they happen when the row exceeds maxWidth
   * and the whole word continues on the next line.
   */
  WORD
}

/** This is used to mark the specialLetter when divide the textArea into several labels */
export enum NewLineCharacterMode {
  /** When the scanner meets a new line sign ("/n", "/r", "/n/r") */
  NEWLINE
}

export type TextAreaLabel = LabelInstance | NewLineCharacterMode;

/** Options for customaizing a TextAreaInstance */
export interface ITextAreaInstanceOptions extends ILabelInstanceOptions {
  /* This sets the alignment of TextArea */
  alignment?: TextAlignment;
  /* This sets thickness of border if included */
  borderWidth?: number;
  /* This decides whehter the border of textArea is included */
  hasBorder?: boolean;
  /* This sets the distance between letters in a word */
  letterSpacing?: number;
  /* This sets the distance from line to next line of text */
  lineHeight?: number;
  /* This sets how tall the text area can render. Any text beyond this point will not be rendered
   This also establishes the borders' height to be rendered if included */
  maxHeight?: number;
  /* This sets distance from top, left, right, bottom of border to content of text */
  padding?: Vec1Compat;
  /* This decides the way to wrap a word whether this word exceeds maxWidth */
  wordWrap?: WordWrap;
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
  /** This stores the old origin which is used to calculate the new positions of labels */
  oldOrigin: [number, number];
  /** Stores paddings for the text area, [top, right, bottom, left] */
  @observable padding: Vec1Compat = [0, 0, 0, 0];
  /** Border width */
  @observable borderWidth: number = 6;
  /** Whether the textArea has border */
  @observable hasBorder: boolean = true;
  /** Width of space in a textArea */
  spaceWidth: number = 0;

  constructor(options: ITextAreaInstanceOptions) {
    super(options);

    this.color = options.color;
    this.origin = options.origin;
    this.oldOrigin = options.origin;
    this.text = options.text;
    this.fontSize = options.fontSize || this.fontSize;
    this.maxWidth = options.maxWidth || this.maxWidth;
    this.maxHeight = options.maxHeight || this.maxHeight;
    this.lineHeight = options.lineHeight || this.lineHeight;
    this.wordWrap = options.wordWrap || this.wordWrap;
    this.alignment = options.alignment || this.alignment;
    this.padding = options.padding || this.padding;
    this.borderWidth = options.borderWidth || this.borderWidth;
    this.hasBorder =
      options.hasBorder !== undefined ? options.hasBorder : this.hasBorder;
    this.letterSpacing = options.letterSpacing || this.letterSpacing;
  }
}
