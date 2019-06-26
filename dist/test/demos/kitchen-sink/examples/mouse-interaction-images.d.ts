import * as anime from "animejs";
import { ImageInstance, InstanceProvider, IPickInfo, LayerInitializer } from "src";
import { BaseExample, TestResourceKeys } from "./base-example";
export declare class MouseInteractionImages extends BaseExample {
    isOver: Map<ImageInstance, anime.AnimeInstance>;
    hasLeft: Map<ImageInstance, anime.AnimeInstance>;
    handleImageClick: (info: IPickInfo<ImageInstance>) => void;
    handleImageOver: (info: IPickInfo<ImageInstance>) => void;
    handleImageOut: (info: IPickInfo<ImageInstance>) => Promise<void>;
    makeLayer(resource: TestResourceKeys, provider: InstanceProvider<ImageInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<ImageInstance>;
}
