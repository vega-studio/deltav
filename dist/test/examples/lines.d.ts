import { EdgeInstance, InstanceProvider, LayerInitializer } from 'src';
import { BaseExample } from './base-example';
export declare class Lines extends BaseExample {
    makeLayer(scene: string, atlas: string, provider: InstanceProvider<EdgeInstance>): LayerInitializer;
    makeProvider(): InstanceProvider<EdgeInstance>;
}
