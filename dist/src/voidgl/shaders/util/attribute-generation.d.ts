import { IInstanceAttribute, IInstancingUniform, IShaders, IUniform, IVertexAttribute } from "../../types";
import { Instance } from "../../util";
export interface IInjectionDetails {
    fs: string;
    materialUniforms: IInstancingUniform[];
    maxInstancesPerBuffer: number;
    vs: string;
}
export declare function injectFragments<T extends Instance>(shaders: IShaders, vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<T>[], uniforms: IUniform[]): IInjectionDetails;
