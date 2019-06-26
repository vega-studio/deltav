import * as datGUI from "dat.gui";
import { BasicCameraController, BasicSurface, ChartCamera, InstanceProvider } from "src";
import { TextAreaInstance } from "src/base-layers/labels/text-area-instance";
import { BaseDemo } from "../../common/base-demo";
export declare class TextAreaDemo extends BaseDemo {
    parameters: {
        text: string;
        fontSize: number;
        maxHeight: number;
        maxWidth: number;
        color: number[];
        x: number;
        y: number;
        lineHeight: number;
        wordWrap: number;
        paddingTop: number;
        paddingRight: number;
        paddingBottom: number;
        paddingLeft: number;
        borderWidth: number;
        hasBorder: boolean;
        letterSpacing: number;
    };
    providers: {
        textAreas: InstanceProvider<TextAreaInstance>;
    };
    textAreas: TextAreaInstance[];
    buildConsole(gui: datGUI.GUI): void;
    makeSurface(container: HTMLElement): BasicSurface<{
        textAreas: InstanceProvider<TextAreaInstance>;
    }, {
        main: ChartCamera;
    }, {
        main: BasicCameraController;
    }, {
        font: import("../../../src").IFontResourceOptions;
    }>;
    init(): Promise<void>;
}
