import { Control2D } from "../../2d/view/control-2d";
import { Layer2D } from "../../2d/view/layer-2d";
import { ShaderModule } from "../../shaders";
import { Layer } from "../../surface/layer";
import { ShaderInjectionTarget, UniformSize } from "../../types";
import world2DYZ from "./shader-fragments/world-2d-yz-projection.vs";

const doc = `
This is a special helper module used by
the system to map View2D content into
a 3D world space. The system utilizes
this module automatically for you when
you utilize createLayer2Din3D.
`;

/**
 * This module changes the projections for Layer2D style layers to map [x, y] -> [z, y]
 */
ShaderModule.register([
  {
    moduleId: "world2DYZ",
    description: doc,
    content: world2DYZ,
    compatibility: ShaderInjectionTarget.ALL,
    uniforms: (layer: Layer<any, any>) => {
      if (!(layer instanceof Layer2D)) {
        console.warn(
          "A shader requesed the module world2DYZ; however, the layer the shader comes from is NOT a Layer2D which is",
          "required for the module to work."
        );
        return [];
      }

      if (!layer.props.control2D) {
        console.warn(
          "For a layer 2D to be compatible with a 3D View, the layer requires an additional prop of control2D"
        );
        return [];
      }

      return [
        // This injects the projection matrix from the view camera
        {
          name: "projection",
          size: UniformSize.MATRIX4,
          update: () => layer.view.props.camera.projection
        },
        // This injects the model view matrix from the view camera
        {
          name: "view",
          size: UniformSize.MATRIX4,
          update: () => layer.view.props.camera.view
        },
        // This injects a 2D camera's offset
        {
          name: "cameraOffset",
          size: UniformSize.THREE,
          update: () =>
            layer.props.control2D instanceof Control2D
              ? layer.props.control2D.offset
              : [0, 0, 0]
        },
        // This injects the camera's current position
        {
          name: "cameraPosition",
          size: UniformSize.THREE,
          update: () => layer.view.props.camera.position
        },
        // This injects the camera's current scale
        {
          name: "cameraScale",
          size: UniformSize.THREE,
          update: () => layer.view.props.camera.scale
        },
        // This injects the camera's 2D current scale
        {
          name: "cameraScale2D",
          size: UniformSize.THREE,
          update: () =>
            layer.props.control2D instanceof Control2D
              ? layer.props.control2D.scale
              : [1, 1, 1]
        },
        // This injects the camera's Euler rotation
        {
          name: "cameraRotation",
          size: UniformSize.THREE,
          update: () => layer.view.props.camera.scale
        },
        // This injects the pixel width and height of the view
        {
          name: "viewSize",
          size: UniformSize.TWO,
          update: () => [
            layer.view.viewBounds.width,
            layer.view.viewBounds.height
          ]
        },
        // This injects the current layer's pixel ratio so pixel ratio dependent items can react to it
        // Things like gl_PointSize will need this metric if not working in clip space
        {
          name: "pixelRatio",
          size: UniformSize.ONE,
          update: () => [layer.view.pixelRatio]
        }
      ];
    }
  }
]);
