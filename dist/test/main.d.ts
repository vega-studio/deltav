/// <reference types="react" />
import * as React from 'react';
import { LayerSurface } from '../src/voidgl/surface/layer-surface';
/**
 * The state of the application
 */
export interface IMainState {
    size: {
        width: number;
        height: number;
    };
}
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
    state: IMainState;
    componentWillUnmount(): void;
    draw(): void;
    setContainer: (element: HTMLDivElement) => void;
    setContext: (canvas: HTMLCanvasElement) => Promise<void>;
    sizeContext(): void;
    /**
     * @override
     * The React defined render method
     */
    render(): JSX.Element;
}
