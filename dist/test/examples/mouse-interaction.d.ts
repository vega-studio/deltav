/// <reference types="animejs" />
import * as anime from 'animejs';
import { CircleInstance, DataProvider, IPickInfo, LayerInitializer } from '../../src';
import { BaseExample } from './base-example';
export declare class MouseInteraction extends BaseExample {
    isOver: Map<CircleInstance, anime.AnimeInstance>;
    hasLeft: Map<CircleInstance, anime.AnimeInstance>;
    handleCircleClick: (info: IPickInfo<CircleInstance>) => void;
    handleCircleOver: (info: IPickInfo<CircleInstance>) => void;
    handleCircleOut: (info: IPickInfo<CircleInstance>) => Promise<void>;
    makeLayer(scene: string, atlas: string, provider: DataProvider<CircleInstance>): LayerInitializer;
    makeProvider(): DataProvider<CircleInstance>;
}
