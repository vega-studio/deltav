import * as datGUI from "dat.gui";
import { BasicCameraController, BasicSurface, ChartCamera, InstanceProvider, LabelInstance, ScaleMode } from "src";
import { BaseDemo } from "../../common/base-demo";
export declare function wait(t: number): Promise<{}>;
export declare class TextDemo extends BaseDemo {
    labels: LabelInstance[];
    shakeTimer: number;
    providers: {
        labels: InstanceProvider<LabelInstance>;
    };
    parameters: {
        count: number;
        fontSize: number;
        words: number;
        letterSpacing: number;
        maxWidth: number;
        scaleMode: ScaleMode;
        previous: {
            count: number;
        };
        copy: () => void;
    };
    buildConsole(gui: datGUI.GUI): void;
    makeSurface(container: HTMLElement): BasicSurface<{
        labels: InstanceProvider<LabelInstance>;
    }, {
        main: ChartCamera;
    }, {
        main: BasicCameraController;
    }, {
        font: import("../../../src").IFontResourceOptions;
    }>;
    init(): Promise<void>;
    labelReady(label: LabelInstance): void;
    makeLabel(preload?: boolean, txt?: string): void;
    layoutLabels(): void;
    removeLabel(): void;
    resize(): void;
}
