import * as anime from "animejs";
import { ChartCamera, InstanceProvider, IPickInfo, LayerInitializer, RectangleInstance } from "src";
import { BaseExample, TestResourceKeys } from "./base-example";
export declare class MouseInteractionRectangle extends BaseExample {
    isOver: Map<RectangleInstance, anime.AnimeInstance>;
    hasLeft: Map<RectangleInstance, anime.AnimeInstance>;
    handleRectangleClick: (info: IPickInfo<RectangleInstance>) => void;
    handleRectangleOver: (info: IPickInfo<RectangleInstance>) => void;
    handleRectangleOut: (info: IPickInfo<RectangleInstance>) => Promise<void>;
    makeCamera(defaultCamera: ChartCamera): ChartCamera;
    makeLayer(_resource: TestResourceKeys, provider: InstanceProvider<RectangleInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<RectangleInstance>;
}
