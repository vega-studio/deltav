import { BorderInstance } from "./border-instance";
import { ILabelInstanceOptions, LabelInstance } from "./label-instance";
import { Vec1Compat } from "../../../math";
/**
 * Alignment mode for text within a region.
 */
export declare enum TextAlignment {
    LEFT = 0,
    RIGHT = 1,
    CENTERED = 2
}
/**
 * WordWrap mode
 * */
export declare enum WordWrap {
    /**
     * NONE: New lines ONLY happen when an explicit newline character ('\n', '\r', '\n\r') occurs.
     * Lines that exceed the maxWidth will be truncated.
     */
    NONE = 0,
    /**
     * CHARACTER: Newlines happen on newline characters OR they happen when the row exceeds maxWidth
     * and some characters stay in this line while the rest continue on the next line.
     */
    CHARACTER = 1,
    /**
     * WORD: Newlines happen on newline characters OR they happen when the row exceeds maxWidth
     * and the whole word continues on the next line.
     */
    WORD = 2
}
/** This is used to mark the specialLetter when divide the textArea into several labels */
export declare enum NewLineCharacterMode {
    /** When the scanner meets a new line sign ("/n", "/r", "/n/r") */
    NEWLINE = 0
}
export type TextAreaLabel = LabelInstance | NewLineCharacterMode;
/**
 * Options for customaizing a TextAreaInstance
 * */
export interface ITextAreaInstanceOptions extends ILabelInstanceOptions {
    alignment?: TextAlignment;
    borderWidth?: number;
    hasBorder?: boolean;
    letterSpacing?: number;
    lineHeight?: number;
    /**
     * This sets max height the text area can render. Any text beyond this point will not be rendered
     * This also establishes the borders' height to be rendered if included
     */
    maxHeight?: number;
    padding?: Vec1Compat;
    wordWrap?: WordWrap;
}
/**
 * This defines a multi-line area that renders text. This is essentially a label
 * with added properties to handle multi-lining.
 */
export declare class TextAreaInstance extends LabelInstance {
    /**
     * Specifies how tall the text area can become. If this is exceeded, the final line
     * in the text area will end with ellipses.
     */
    maxHeight: number;
    /**
     * This specifies how tall a line should be for each line.
     */
    lineHeight: number;
    /**
     * This indicates if a single line of text should wrap or not. If not, the first word that goes
     * out of bounds will be removed and replaced with ellipses. If true, excess words in a single line
     * will wrap down to the next line to stay within the space allowed.
     */
    wordWrap: WordWrap;
    /**
     * This changes how the alignment for the text within the region will appear.
     */
    alignment: TextAlignment;
    /**
     * When onReady is called, this will be populated with all of the labels used to compose this text area
     * SpecialLetter will be used when layouting labels, it may indicates a new line
     */
    labels: TextAreaLabel[];
    /** This will be used to hold new labels when a label should be divided into two labels because label is at the end a line */
    newLabels: LabelInstance[];
    /** This holds the borders of textArea */
    borders: BorderInstance[];
    /** This stores the old origin which is used to calculate the new positions of labels */
    oldOrigin: [number, number];
    /** Stores paddings for the text area, [top, right, bottom, left] */
    padding: Vec1Compat;
    /** Border width */
    borderWidth: number;
    /** Whether the textArea has border */
    hasBorder: boolean;
    /** Width of space in a textArea */
    spaceWidth: number;
    constructor(options: ITextAreaInstanceOptions);
}
