import { Layer } from "../../surface/layer";
import { ShaderInjectionTarget, UniformSize } from "../../types";
import { ShaderModule } from "../processing";

/**
 * This module provides uniforms for retrieving camera propeerties within the shader.
 */
ShaderModule.register([
  {
    moduleId: "camera",
    content: "",
    compatibility: ShaderInjectionTarget.ALL,
    uniforms: (layer: Layer<any, any>) => [
      // This injects the projection matrix from the view camera
      {
        name: "projection",
        size: UniformSize.MATRIX4,
        // update: () => layer.view.viewCamera.baseCamera.projection
        update: () => layer.view.camera.getProjectionElements()
      },
      // This injects the model view matrix from the view camera
      {
        name: "modelView",
        size: UniformSize.MATRIX4,
        // update: () => layer.view.viewCamera.baseCamera.view
        update: () => layer.view.camera.getModelViewMatrixElements()
      },
      {
        name: "normalMatrix",
        size: UniformSize.MATRIX4,
        update: () => layer.view.camera.getNormalMatrixElements()
      },
      // This injects the camera offset uniforms that need to be present for projecting in a more
      // Chart centric style
      {
        name: "cameraOffset",
        size: UniformSize.THREE,
        update: () => layer.view.camera.offset
      },
      // This injects the camera scaling uniforms that need to be present for projecting in a more
      // Chart centric style
      {
        name: "cameraScale",
        size: UniformSize.THREE,
        update: () => layer.view.camera.scale
      },
      // This injects the camera scaling uniforms that need to be present for projecting in a more
      // Chart centric style
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
    ]
  },
  {
    moduleId: "projection",
    content: require("./shader-fragments/projection.vs"),
    compatibility: ShaderInjectionTarget.ALL
  }
]);
