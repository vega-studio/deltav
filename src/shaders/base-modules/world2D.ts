// import { Layer2D } from "src/surface/layer2D";
import { ShaderInjectionTarget } from "../../types";
import { ShaderModule } from "../processing";

/**
 * This module provides uniforms for retrieving camera propeerties within the shader.
 */
ShaderModule.register([
  /*{
    moduleId: "controller2D",
    content: "",
    compatibility: ShaderInjectionTarget.ALL,
    uniforms: (layer: Layer2D<any, any>) => [
      // This injects the projection matrix from the view camera
      {
        name: "projection",
        size: UniformSize.MATRIX4,
        update: () => layer.view.camera.projection
      },
      // This injects the model view matrix from the view camera
      {
        name: "modelView",
        size: UniformSize.MATRIX4,
        update: () => layer.view.camera.view
      },
      // This injects the camera offset uniforms that need to be present for projecting in a more
      // Chart centric style
      {
        name: "cameraOffset",
        size: UniformSize.THREE,
        update: () => layer.view.camera.position
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
  },*/
  {
    moduleId: "world2D",
    content: require("./shader-fragments/world-2d.vs"),
    compatibility: ShaderInjectionTarget.ALL
  }
]);
