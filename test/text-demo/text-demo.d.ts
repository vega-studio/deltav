import * as datGUI from "dat.gui";
import { BasicCamera2DController, BasicSurface, Camera2D, InstanceProvider, LabelInstance, ScaleMode } from "src";
import { BaseDemo } from "../common/base-demo";
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
        main: Camera2D;
    }, {
        main: BasicCamera2DController;
    }, {
        font: import("../../src").IFontResourceOptions;
    }>;
    init(): Promise<void>;
    labelReady(label: LabelInstance): void;
    makeLabel(preload?: boolean, txt?: string): void;
    layoutLabels(): void;
    removeLabel(): void;
    resize(): void;
}
