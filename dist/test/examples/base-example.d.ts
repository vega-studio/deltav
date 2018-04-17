import { DataProvider, Instance, LayerInitializer } from '../../src';
export declare class BaseExample {
    makeLayer(scene: string, atlas: string, provider: DataProvider<Instance>): LayerInitializer;
    makeProvider(): DataProvider<Instance>;
}
