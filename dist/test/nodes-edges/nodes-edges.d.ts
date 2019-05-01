import * as datGUI from "dat.gui";
import { BasicCameraController, ChartCamera, CircleInstance, EdgeInstance, InstanceProvider, ISceneOptions, LabelInstance, LayerInitializer, RectangleInstance, ScaleMode, Vec4 } from "src";
import { IDefaultResources } from "test/types";
import { BaseDemo } from "../common/base-demo";
export declare function wait(t: number): Promise<{}>;
export declare class NodesEdges extends BaseDemo {
    camera: ChartCamera;
    circles: CircleInstance[];
    edges: EdgeInstance[];
    labels: LabelInstance[];
    rectangles: RectangleInstance[];
    lblToRect: Map<LabelInstance, RectangleInstance>;
    center: CircleInstance;
    providers: {
        circles: InstanceProvider<CircleInstance>;
        edges: InstanceProvider<EdgeInstance>;
        rectangles: InstanceProvider<RectangleInstance>;
        labels: InstanceProvider<LabelInstance>;
    };
    parameters: {
        count: number;
        fontSize: number;
        scaleMode: ScaleMode;
        circleRadius: number;
        nodeRadius: number;
        previous: {
            count: number;
        };
    };
    buildConsole(gui: datGUI.GUI): void;
    getEventManagers(defaultController: BasicCameraController, _defaultCamera: ChartCamera): null;
    getScenes(defaultCamera: ChartCamera): ISceneOptions[] | null;
    getLayers(resources: IDefaultResources): LayerInitializer[];
    init(): Promise<void>;
    labelReady: (label: LabelInstance) => void;
    makeNode(preload?: boolean, txt?: string): void;
    makeColor(i: number): Vec4;
    layout(): void;
    removeNode(): void;
    resize(): void;
}
