import { Instance } from "../../instance-provider/instance";
import { ILayerProps, Layer } from "../../surface/layer";
import { IInstanceAttribute, IInstancingUniform, IShaders, IUniform, IVertexAttribute } from "../../types";
export interface IInjectionDetails {
    fs: string;
    materialUniforms: IInstancingUniform[];
    maxInstancesPerBuffer: number;
    vs: string;
}
export declare function injectFragments<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>, shaders: IShaders, vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<any>[], uniforms: IUniform[]): IInjectionDetails;
