import * as anime from "animejs";
import { ChartCamera, InstanceProvider, IPickInfo, LabelInstance, LayerInitializer } from "src";
import { BaseExample } from "./base-example";
export declare class MouseInteractionLabels extends BaseExample {
    isOver: Map<LabelInstance, anime.AnimeInstance>;
    hasLeft: Map<LabelInstance, anime.AnimeInstance>;
    handleLabelClick: (info: IPickInfo<LabelInstance>) => void;
    handleLabelOver: (info: IPickInfo<LabelInstance>) => void;
    handleLabelOut: (info: IPickInfo<LabelInstance>) => Promise<void>;
    makeCamera(defaultCamera: ChartCamera): ChartCamera;
    makeLayer(scene: string, atlas: string, provider: InstanceProvider<LabelInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<LabelInstance>;
}
