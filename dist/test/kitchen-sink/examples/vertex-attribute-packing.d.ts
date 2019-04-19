import { EdgeInstance, InstanceProvider, RectangleInstance } from "src";
import { BaseExample, TestResourceKeys } from "./base-example";
export declare class VertexAttributePacking extends BaseExample {
    uid: number;
    rectangleProvider: InstanceProvider<RectangleInstance>;
    doesVertexpack: boolean;
    constructor(noVertexPacking?: boolean);
    makeLayer(scene: string, _resource: TestResourceKeys, provider: InstanceProvider<EdgeInstance>): [import("../../../src").ILayerConstructionClass<import("../../../src").Instance, import("../../../src").ILayerProps<import("../../../src").Instance>>, import("../../../src").ILayerProps<import("../../../src").Instance>][];
    makeProvider(): InstanceProvider<EdgeInstance>;
}
