import { ChartCamera, DataProvider, LabelInstance, LayerInitializer } from '../../src';
import { BaseExample } from './base-example';
export declare class SingleAxisLabelScaling extends BaseExample {
    isYAxis: boolean;
    constructor(yAxis?: boolean);
    makeCamera(defaultCamera: ChartCamera): ChartCamera;
    makeLayer(scene: string, atlas: string, provider: DataProvider<LabelInstance>): LayerInitializer;
    makeProvider(): DataProvider<LabelInstance>;
}
