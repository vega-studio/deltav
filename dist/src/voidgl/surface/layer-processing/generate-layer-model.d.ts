import * as Three from "three";
import { IModelConstructable, Layer } from "../layer";
export declare function generateLayerModel(layer: Layer<any, any>, geometry: Three.BufferGeometry, material: Three.ShaderMaterial): IModelConstructable & Three.Object3D;
