import { CircleInstance, IInstanceProvider, LayerInitializer } from "src";
import { BaseExample } from "./base-example";
export declare class AnimateDeleteAdd extends BaseExample {
    makeLayer(scene: string, _atlas: string, provider: IInstanceProvider<CircleInstance>): LayerInitializer;
    makeProvider(): IInstanceProvider<CircleInstance>;
    move: (circle: CircleInstance) => void;
}
