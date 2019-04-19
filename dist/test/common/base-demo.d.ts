import * as datGUI from "dat.gui";
import { BaseResourceOptions, BasicCameraController, Bounds, ChartCamera, EventManager, ISceneOptions, LayerInitializer } from "src";
import { Surface } from "../gl/surface";
import { IDefaultResources } from "../types";
export declare abstract class BaseDemo {
    surface: Surface;
    private timers;
    abstract buildConsole(gui: datGUI.GUI): void;
    destroy(): void;
    getEventManagers(_defaultController: BasicCameraController, _defaultCamera: ChartCamera): EventManager[] | null;
    getLayers(_resources: IDefaultResources): LayerInitializer[];
    getResources(defaultResources: {
        atlas: BaseResourceOptions;
        font: BaseResourceOptions;
    }): BaseResourceOptions[];
    getScenes(_defaultCamera: ChartCamera): ISceneOptions[] | null;
    getViewScreenBounds(viewId?: string): Promise<Bounds | null>;
    abstract init(): Promise<void>;
    makeInterval(f: Function, time: number): number;
    refreshDemo(): void;
    resize(): void;
    setSurface(surface: Surface): void;
    updateLayer(): void;
}
