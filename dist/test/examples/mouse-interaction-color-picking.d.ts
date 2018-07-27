import * as anime from "animejs";
import { CircleInstance, EdgeInstance, InstanceProvider, IPickInfo, LayerInitializer } from "src";
import { BaseExample } from "./base-example";
export declare class MouseInteractionColorPicking extends BaseExample {
    isOver: Map<CircleInstance, anime.AnimeInstance>;
    hasLeft: Map<CircleInstance, anime.AnimeInstance>;
    edgeProvider: InstanceProvider<EdgeInstance>;
    side: number;
    handleCircleClick: (info: IPickInfo<CircleInstance>) => void;
    handleCircleOver: (info: IPickInfo<CircleInstance>) => void;
    handleCircleOut: (info: IPickInfo<CircleInstance>) => Promise<void>;
    handleEdgeMouseOut: (info: IPickInfo<EdgeInstance>) => void;
    handleEdgeMouseMove: (info: IPickInfo<EdgeInstance>) => void;
    makeLayer(scene: string, _atlas: string, provider: InstanceProvider<CircleInstance>): LayerInitializer | LayerInitializer[];
    makeProvider(): InstanceProvider<CircleInstance>;
}
