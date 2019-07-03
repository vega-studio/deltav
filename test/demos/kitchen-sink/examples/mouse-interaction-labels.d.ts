import * as anime from "animejs";
import { Camera2D, InstanceProvider, IPickInfo, LabelInstance, LayerInitializer } from "src";
import { BaseExample, TestResourceKeys } from "./base-example";
export declare class MouseInteractionLabels extends BaseExample {
    isOver: Map<LabelInstance, anime.AnimeInstance>;
    hasLeft: Map<LabelInstance, anime.AnimeInstance>;
    handleLabelClick: (info: IPickInfo<LabelInstance>) => void;
    handleLabelOver: (info: IPickInfo<LabelInstance>) => void;
    handleLabelOut: (info: IPickInfo<LabelInstance>) => Promise<void>;
    makeCamera(defaultCamera: Camera2D): Camera2D;
    makeLayer(resource: TestResourceKeys, provider: InstanceProvider<LabelInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<LabelInstance>;
}
