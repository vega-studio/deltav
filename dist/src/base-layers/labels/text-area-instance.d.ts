import { Vec1Compat } from "../../util";
import { RectangleInstance } from "../rectangle";
import { ILabelInstanceOptions, LabelInstance } from "./label-instance";
export declare enum TextAlignment {
    LEFT = 0,
    RIGHT = 1,
    CENTERED = 2
}
export declare enum WordWrap {
    NONE = 0,
    CHARACTER = 1,
    WORD = 2
}
export declare enum NewLineCharacterMode {
    NEWLINE = 0
}
export declare type TextAreaLabel = LabelInstance | NewLineCharacterMode;
export interface ITextAreaInstanceOptions extends ILabelInstanceOptions {
    alignment?: TextAlignment;
    borderWidth?: number;
    hasBorder?: boolean;
    letterSpacing?: number;
    lineHeight?: number;
    maxHeight?: number;
    padding?: Vec1Compat;
    wordWrap?: WordWrap;
}
export declare class TextAreaInstance extends LabelInstance {
    maxHeight: number;
    lineHeight: number;
    wordWrap: WordWrap;
    alignment: TextAlignment;
    labels: TextAreaLabel[];
    newLabels: LabelInstance[];
    borders: RectangleInstance[];
    oldOrigin: [number, number];
    padding: Vec1Compat;
    borderWidth: number;
    hasBorder: boolean;
    spaceWidth: number;
    constructor(options: ITextAreaInstanceOptions);
}
