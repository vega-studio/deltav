/**
 * This test will test the observable ability to have a projectile be animated and have it removed and added
 * while the Instance continues to be moved around. This will ensure changes do not override removals / adds
 * and vice versa.
 */
import { CircleInstance, IInstanceProvider, LayerInitializer } from 'src';
import { BaseExample } from './base-example';
export declare class AnimateDeleteAdd extends BaseExample {
    makeLayer(scene: string, atlas: string, provider: IInstanceProvider<CircleInstance>): LayerInitializer;
    makeProvider(): IInstanceProvider<CircleInstance>;
    move: (circle: CircleInstance) => void;
}
