import { Component } from "preact";
import { EventManager, ISceneOptions, LayerSurface } from "src";
import "./backend";
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
export declare class Main extends Component<any, IMainState> {
    container: HTMLElement;
    context: HTMLCanvasElement;
    willAnimate: number;
    surface: LayerSurface;
    allScenes: SceneInitializer[];
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
    render(): JSX.Element;
}
