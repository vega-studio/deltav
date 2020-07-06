import { Instance } from "../../instance-provider/instance";
import { identity4 } from "../../math";
import { ShaderModule } from "../../shaders";
import { ILayerProps, Layer } from "../../surface";
import { ShaderInjectionTarget, UniformSize } from "../../types";
import { createUniform } from "../../util";
import { ISceneGraphLayerProps, SceneGraphLayer } from "./scene-graph-layer";

ShaderModule.register({
  moduleId: "parent-transform",
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
