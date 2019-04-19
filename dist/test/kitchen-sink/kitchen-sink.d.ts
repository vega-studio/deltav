import { EventManager, IInstanceProvider, ISceneOptions, LayerInitializer } from "src";
import * as datGUI from "dat.gui";
import { BaseDemo } from "../common/base-demo";
import { BaseExample } from "./examples/base-example";
export interface IMainState {
    size: {
        width: number;
        height: number;
    };
}
export declare type SceneInitializer = {
    name: string;
    control: EventManager;
    scene: ISceneOptions;
};
export declare class KitchenSink extends BaseDemo {
    allScenes: SceneInitializer[];
    testControls: Map<BaseExample, {
        provider: IInstanceProvider<any>;
    }>;
    buildConsole(_gui: datGUI.GUI): void;
    destroy(): void;
    makeSceneControls(): SceneInitializer[];
    getEventManagers(): EventManager[];
    getScenes(): ISceneOptions[];
    getLayers(): LayerInitializer[];
    handleKeyDown: (e: KeyboardEvent) => void;
    handleKeyUp: (e: KeyboardEvent) => void;
    makeSceneBlock(sceneBlockSize: number): SceneInitializer[];
    init(): Promise<void>;
}
