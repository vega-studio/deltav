import { Camera } from "./camera";
export declare enum ViewCameraType {
    CONTROLLED = 0,
    CUSTOM = 1
}
export declare class ViewCamera {
    type: ViewCameraType;
    baseCamera: Camera;
    constructor(baseCamera?: Camera);
}
