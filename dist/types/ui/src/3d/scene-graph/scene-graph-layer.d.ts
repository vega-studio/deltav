import { ILayerProps, Layer } from "../../surface";
import { Instance } from "../../instance-provider";
import { IShaderInitialization } from "../../types";
import { Mat4x4 } from "../../math/matrix";
export interface ISceneGraphLayerProps<TInstance extends Instance> extends ILayerProps<TInstance> {
    /**
     * If this is sepcified, this will be the parent transform this layer
     * renders it's objects relative to.
     */
    parent?: {
        matrix: Mat4x4;
    };
}
/**
 * If you wish to support a scene graph in a more optimal fashion where
 * Transforms are parented by other Transforms, then your rendering layers
 * should probably extend this layer.
 *
 * This layer will automatically split your defined Layer into numerous child
 * layers, such that each layer will render with a specific parent Transform set
 * into the child's uniforms.
 *
 * This way, each child can render based on local properties instead of using
 * the heavier world properties.
 */
export declare class SceneGraphLayer<TInstance extends Instance, TProps extends ISceneGraphLayerProps<TInstance>> extends Layer<TInstance, TProps> {
    /**
     * Ensure the shaders utilizing this framework has easy access to the
     * parentTransform property.
     */
    baseShaderModules(shaderIO: IShaderInitialization<TInstance>): {
        fs: string[];
        vs: string[];
    };
}
