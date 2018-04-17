import { CircleInstance, DataProvider, LayerInitializer } from '../../src';
import { BaseExample } from './base-example';
export declare class BoxOfCircles extends BaseExample {
    makeLayer(scene: string, atlas: string, provider: DataProvider<CircleInstance>): LayerInitializer;
    makeProvider(): DataProvider<CircleInstance>;
}
