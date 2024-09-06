import { Geometry } from "../../gl";
import { type IIndexBufferInternal, IVertexAttributeInternal } from "../../types";
import { Instance } from "../../instance-provider/instance";
import { Layer } from "../layer";
/**
 * Produces the initial geometry for the vertex attributes and index buffers.
 *
 * These buffers can be manipulated and adjusted in the buffer managers, but
 * this provides a baseline for them to work with.
 */
export declare function generateLayerGeometry<T extends Instance>(_layer: Layer<T, any>, _maxInstancesPerBuffer: number, vertexAttributes: IVertexAttributeInternal[], vertexCount: number, indexBuffer?: IIndexBufferInternal): Geometry;
