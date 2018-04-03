import { DataProvider, ImageInstance, LayerInitializer } from '../../src';
import { BaseExample } from './base-example';
export declare class Images extends BaseExample {
    makeLayer(scene: string, atlas: string, provider: DataProvider<ImageInstance>): LayerInitializer;
    makeProvider(): DataProvider<ImageInstance>;
}
