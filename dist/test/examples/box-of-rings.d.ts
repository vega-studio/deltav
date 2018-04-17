import { DataProvider, LayerInitializer, RingInstance } from '../../src';
import { BaseExample } from './base-example';
export declare class BoxOfRings extends BaseExample {
    makeLayer(scene: string, atlas: string, provider: DataProvider<RingInstance>): LayerInitializer;
    makeProvider(): DataProvider<RingInstance>;
}
