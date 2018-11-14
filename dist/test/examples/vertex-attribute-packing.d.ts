import { EdgeInstance, InstanceProvider, RectangleInstance } from "src";
import { BaseExample } from "./base-example";
export declare class VertexAttributePacking extends BaseExample {
    uid: number;
    rectangleProvider: InstanceProvider<RectangleInstance>;
    doesVertexpack: boolean;
    constructor(noVertexPacking?: boolean);
    makeLayer(scene: string, _atlas: string, provider: InstanceProvider<EdgeInstance>): [import("../../src/voidgl/surface/layer-surface").ILayerConstructable<import("../../src/voidgl/instance-provider/instance").Instance> & {
        defaultProps: import("../../src/voidgl/surface/layer").ILayerProps<import("../../src/voidgl/instance-provider/instance").Instance>;
    }, import("../../src/voidgl/surface/layer").ILayerProps<import("../../src/voidgl/instance-provider/instance").Instance>][];
    makeProvider(): InstanceProvider<EdgeInstance>;
}
