import { EdgeInstance, InstanceProvider, RectangleInstance } from "src";
import { BaseExample, TestResourceKeys } from "./base-example";
export declare class VertexAttributePacking extends BaseExample {
    uid: number;
    rectangleProvider: InstanceProvider<RectangleInstance>;
    doesVertexpack: boolean;
    constructor(noVertexPacking?: boolean);
    makeLayer(_resource: TestResourceKeys, provider: InstanceProvider<EdgeInstance>): import("../../../../src").LayerInitializer[];
    makeProvider(): InstanceProvider<EdgeInstance>;
}
