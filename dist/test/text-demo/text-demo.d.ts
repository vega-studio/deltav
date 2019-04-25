import * as datGUI from "dat.gui";
import { BasicCameraController, ChartCamera, InstanceProvider, ISceneOptions, LabelInstance, LayerInitializer, ScaleMode } from "src";
import { IDefaultResources } from "test/types";
import { BaseDemo } from "../common/base-demo";
export declare class TextDemo extends BaseDemo {
    camera: ChartCamera;
    labels: LabelInstance[];
    shakeTimer: number;
    providers: {
        labels: InstanceProvider<LabelInstance>;
    };
    parameters: {
        count: number;
        fontSize: number;
        words: number;
        maxWidth: number;
        scaleMode: ScaleMode;
        previous: {
            count: number;
        };
        copy: () => void;
    };
    buildConsole(gui: datGUI.GUI): void;
    getEventManagers(defaultController: BasicCameraController, _defaultCamera: ChartCamera): null;
    getScenes(defaultCamera: ChartCamera): ISceneOptions[] | null;
    getLayers(resources: IDefaultResources): LayerInitializer[];
    init(): Promise<void>;
    labelReady(label: LabelInstance): void;
    makeLabel(): void;
    layoutLabels(): void;
    removeLabel(): void;
    resize(): void;
}
