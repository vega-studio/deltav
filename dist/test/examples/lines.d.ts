import { DataProvider, EdgeInstance, LayerInitializer } from '../../src';
import { BaseExample } from './base-example';
export declare class Lines extends BaseExample {
    makeLayer(scene: string, atlas: string, provider: DataProvider<EdgeInstance>): LayerInitializer;
    makeProvider(): DataProvider<EdgeInstance>;
}
