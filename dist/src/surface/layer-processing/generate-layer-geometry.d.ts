import { Geometry } from "../../gl";
import { Instance } from "../../instance-provider/instance";
import { IVertexAttributeInternal } from "../../types";
import { Layer } from "../layer";
export declare function generateLayerGeometry<T extends Instance>(layer: Layer<T, any>, maxInstancesPerBuffer: number, vertexAttributes: IVertexAttributeInternal[], vertexCount: number): Geometry;
