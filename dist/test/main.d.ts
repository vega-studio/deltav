/// <reference types="react" />
import * as React from 'react';
import { ISceneOptions } from '../src';
import { BasicCameraController } from '../src/voidgl/base-event-managers';
import { LayerSurface } from '../src/voidgl/surface/layer-surface';
import { ChartCamera } from '../src/voidgl/util/chart-camera';
/**
 * The state of the application
 */
export interface IMainState {
    size: {
        width: number;
        height: number;
    };
}
export declare type SceneInitializer = {
    name: string;
    camera: ChartCamera;
    control: BasicCameraController;
    scene: ISceneOptions;
};
/**
 * Entry class for the Application
 */
export declare class Main extends React.Component<any, IMainState> {
    /** The containing element of this component */
    container: HTMLElement;
    /** The rendering context we will draw into */
    context: HTMLCanvasElement;
    /** While true, the animation loop will run */
    willAnimate: number;
    /** The layer manager that draws our GL elements */
    surface: LayerSurface;
    /** This is all of the scenes that were initialized */
    allScenes: SceneInitializer[];
    state: IMainState;
    componentWillMount(): void;
    componentWillUnmount(): void;
    draw(): void;
    handleResize: () => void;
    handleToggleMonitorDensity: () => void;
    makeSceneBlock(sceneBlockSize: number): SceneInitializer[];
    setContainer: (element: HTMLDivElement) => void;
    setContext: (canvas: HTMLCanvasElement) => Promise<void>;
    sizeContext(): void;
    /**
     * @override
     * The React defined render method
     */
    render(): JSX.Element;
}
