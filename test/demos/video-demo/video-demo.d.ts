import * as datGUI from "dat.gui";
import { BasicCamera2DController, BasicSurface, Camera2D, ImageInstance, InstanceProvider, Vec2 } from "src";
import { BaseDemo } from "../../common/base-demo";
export declare class VideoDemo extends BaseDemo {
    providers: {
        controls: InstanceProvider<ImageInstance>;
        images: InstanceProvider<ImageInstance>;
    };
    images: ImageInstance[];
    parameters: {
        source: any;
    };
    currentLocation: Vec2;
    video?: HTMLVideoElement;
    videoInstance: ImageInstance;
    controls: {
        mute: ImageInstance;
        play: ImageInstance;
    };
    onImageReady(image: ImageInstance): void;
    buildConsole(gui: datGUI.GUI): void;
    handlePlay: () => void;
    handlePause: () => void;
    makeSurface(container: HTMLElement): BasicSurface<{
        controls: InstanceProvider<ImageInstance>;
        images: InstanceProvider<ImageInstance>;
    }, {
        main: Camera2D;
    }, {
        main: BasicCamera2DController;
    }, {
        atlas: import("../../../src").IAtlasResource;
    }>;
    updateMuteState(): void;
    updatePlayState(): void;
    init(): Promise<void>;
}
