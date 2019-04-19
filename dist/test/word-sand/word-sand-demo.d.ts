import * as datGUI from "dat.gui";
import { ChartCamera, CircleInstance, InstanceProvider, ISceneOptions, LayerInitializer } from "src";
import { BaseDemo } from "../common/base-demo";
export declare class WordSandDemo extends BaseDemo {
    camera: ChartCamera;
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
    getScenes(defaultCamera: ChartCamera): ISceneOptions[] | null;
    getLayers(): LayerInitializer[];
    init(): Promise<void>;
    makeCircle(): void;
    private moveToText;
    removeCircle(): void;
    resize(): void;
}
