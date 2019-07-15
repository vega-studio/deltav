import * as datGUI from "dat.gui";
import { BasicCamera2DController, BasicSurface, Camera2D, CircleInstance, InstanceProvider } from "src";
import { BaseDemo } from "../../common/base-demo";
export declare class WordSandDemo extends BaseDemo {
    circles: CircleInstance[];
    shakeTimer: number;
    providers: {
        circles: InstanceProvider<CircleInstance>;
    };
    parameters: {
        count: number;
        speedFactor: number;
        text: string;
        fontSize: number;
        previous: {
            count: number;
        };
    };
    buildConsole(gui: datGUI.GUI): void;
    makeSurface(container: HTMLElement): BasicSurface<{
        circles: InstanceProvider<CircleInstance>;
    }, {
        main: Camera2D;
    }, {
        main: BasicCamera2DController;
    }, {}>;
    init(): Promise<void>;
    makeCircle(): void;
    private moveToText;
    removeCircle(): void;
    resize(): void;
}
