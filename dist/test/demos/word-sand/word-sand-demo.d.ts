import * as datGUI from "dat.gui";
import { BasicCameraController, BasicSurface, ChartCamera, CircleInstance, InstanceProvider } from "src";
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
        main: ChartCamera;
    }, {
        main: BasicCameraController;
    }, {}>;
    init(): Promise<void>;
    makeCircle(): void;
    private moveToText;
    removeCircle(): void;
    resize(): void;
}
