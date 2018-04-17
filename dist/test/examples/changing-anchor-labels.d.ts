import { DataProvider, LabelInstance, LayerInitializer } from '../../src';
import { BaseExample } from './base-example';
export declare class ChangingAnchorLabels extends BaseExample {
    makeLayer(scene: string, atlas: string, provider: DataProvider<LabelInstance>): LayerInitializer;
    makeProvider(): DataProvider<LabelInstance>;
}
