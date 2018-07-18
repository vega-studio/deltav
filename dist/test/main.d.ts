/** @jsx h */
import { Component } from 'preact';
import { EventManager, ISceneOptions, LayerSurface } from 'src';
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
    control: EventManager;
    scene: ISceneOptions;
};
/**
 * Entry class for the Application
 */
export declare class Main extends Component<any, IMainState> {
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
    /** Flagged to true when the surface shouldn't be auto generated */
    preventAutoCreateSurface: boolean;
    state: IMainState;
    componentWillMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(): void;
    createSurface(): Promise<void>;
    draw(time: number): void;
    handleForceResize: () => void;
    handleKeyDown: (e: KeyboardEvent) => void;
    handleKeyUp: (e: KeyboardEvent) => void;
    handleResize: () => void;
    handleToggleMonitorDensity: () => void;
    handleToggleSurface: () => Promise<void>;
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
