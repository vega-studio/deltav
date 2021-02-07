import { Instance } from "../../instance-provider/instance";
import { identity4 } from "../../math";
import { ShaderModule } from "../../shaders";
import { ILayerProps, Layer } from "../../surface";
import { ShaderInjectionTarget, UniformSize } from "../../types";
import { createUniform } from "../../util";
import { ISceneGraphLayerProps, SceneGraphLayer } from "./scene-graph-layer";

const doc = `
When working with SceneGraphLayers, the
layer can have a transform applied to
the layer. This makes that transform
available in the parentTransform
constant.

mat4 parentTransform;
`;

ShaderModule.register({
  moduleId: "parent-transform",
  description: doc,
  compatibility: ShaderInjectionTarget.VERTEX,
  content: "",
  uniforms: layer => {
    const moduleLayer:
      | SceneGraphLayer<Instance, ISceneGraphLayerProps<Instance>>
      | Layer<Instance, ILayerProps<Instance>> = layer;

    if (!(moduleLayer instanceof SceneGraphLayer)) {
      console.warn(
        "A shader requested the module parent-transform; however, the layer the",
        "shader is generated from is NOT a SceneGraphLayer which is",
        "required for the module to work."
      );
      return [];
    }

    const identity = identity4();

    return [
      createUniform({
        name: "parentTransform",
        size: UniformSize.MATRIX4,
        update: () => moduleLayer.props.parent?.matrix || identity
      })
    ];
  }
});
