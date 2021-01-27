import { Layer } from "../../surface/layer";
import { ShaderInjectionTarget, UniformSize } from "../../types";
import { ShaderModule } from "../processing";

const doc = `
These are properties injected from the
current camera applied to the view.

Constants:
mat4 projection;
mat4 view;
mat4 viewProjection;
vec3 cameraOffset;
vec3 cameraPosition;
vec3 cameraScale;
vec3 cameraRotation;
vec2 viewSize;
float pixelRatio;
`;

/**
 * This module provides uniforms for retrieving camera propeerties within the shader.
 */
ShaderModule.register([
  {
    moduleId: "camera",
    description: doc,
    // No explicit functional content is required, we will only use the uniforms for injecting information for this
    // module.
    content: "",
    compatibility: ShaderInjectionTarget.ALL,
    uniforms: (layer: Layer<any, any>) => [
      // This injects the projection matrix from the view camera
      {
        name: "projection",
        size: UniformSize.MATRIX4,
        update: () => layer.view.props.camera.projection
      },
      {
        name: "viewProjection",
        size: UniformSize.MATRIX4,
        update: () => layer.view.props.camera.viewProjection
      },
      // This injects the model view matrix from the view camera
      {
        name: "view",
        size: UniformSize.MATRIX4,
        update: () => layer.view.props.camera.view
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
      // This injects the camera's Euler rotation
      {
        name: "cameraRotation",
        size: UniformSize.THREE,
        update: () => layer.view.props.camera.scale
      },
      // This injects the pixel width and height of the view
      {
        shaderInjection: ShaderInjectionTarget.ALL,
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
        shaderInjection: ShaderInjectionTarget.ALL,
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
