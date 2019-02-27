import * as Three from "three";
export declare enum ViewCameraType {
    CONTROLLED = 0,
    CUSTOM = 1
}
export declare class ViewCamera {
    type: ViewCameraType;
    baseCamera: Three.Camera;
}
