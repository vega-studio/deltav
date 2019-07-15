import * as datGUI from "dat.gui";
import { BasicCamera2DController, BasicSurface, Camera2D, CircleInstance, InstanceProvider } from "src";
import { TextAlignment, TextAreaInstance, WordWrap } from "src/2d/layers/labels/text-area-instance";
import { BaseDemo } from "../../common/base-demo";
export declare class TextAreaDemo extends BaseDemo {
    parameters: {
        alignment: TextAlignment;
        text: string;
        fontSize: number;
        maxHeight: number;
        maxWidth: number;
        color: number[];
        x: number;
        y: number;
        lineHeight: number;
        wordWrap: WordWrap;
        paddingTop: number;
        paddingRight: number;
        paddingBottom: number;
        paddingLeft: number;
        borderWidth: number;
        hasBorder: boolean;
        letterSpacing: number;
    };
    providers: {
        circles: InstanceProvider<CircleInstance>;
        textAreas: InstanceProvider<TextAreaInstance>;
    };
    textAreas: TextAreaInstance[];
    buildConsole(gui: datGUI.GUI): void;
    makeSurface(container: HTMLElement): BasicSurface<{
        circles: InstanceProvider<CircleInstance>;
        textAreas: InstanceProvider<TextAreaInstance>;
    }, {
        main: Camera2D;
    }, {
        main: BasicCamera2DController;
    }, {
        font: import("../../../src").IFontResourceOptions;
    }>;
    init(): Promise<void>;
}
