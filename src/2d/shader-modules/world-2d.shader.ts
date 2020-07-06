import { ShaderModule } from "../../shaders/processing";
import { Layer } from "../../surface";
import { ShaderInjectionTarget, UniformSize } from "../../types";
import { Camera2D } from "../view/camera-2d";
import { Layer2D } from "../view/layer-2d";

/**
 * This module provides uniforms for retrieving camera propeerties within the shader.
 */
ShaderModule.register([
  {
    moduleId: "world2D",
    content: require("./shader-fragments/world-2d-projection.vs"),
    compatibility: ShaderInjectionTarget.ALL,
    uniforms: (layer: Layer<any, any>) => {
      if (!(layer instanceof Layer2D)) {
        console.warn(
          "A shader requested the module world2D; however, the layer the shader comes from is NOT a Layer2D which is",
          "required for the module to work."
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
        {
          name: "viewProjection",
          size: UniformSize.MATRIX4,
          update: () => layer.view.props.camera.viewProjection
        },
        // This injects a 2D camera's offset
        {
          name: "cameraOffset",
          size: UniformSize.THREE,
          update: () =>
            layer.view.props.camera instanceof Camera2D
              ? layer.view.props.camera.control2D.offset
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
            layer.view.props.camera instanceof Camera2D
              ? layer.view.props.camera.scale2D
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
