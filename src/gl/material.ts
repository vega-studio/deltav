export class MaterialSettings {
  BlendingDstFactor = {
    ZeroFactor: 0,
    OneFactor: 0,
    SrcColorFactor: 0,
    OneMinusSrcColorFactor: 0,
    SrcAlphaFactor: 0,
    OneMinusSrcAlphaFactor: 0,
    DstAlphaFactor: 0,
    OneMinusDstAlphaFactor: 0,
    DstColorFactor: 0,
    OneMinusDstColorFactor: 0,
  };
}

/**
 * This represents a Shader configuration and a state for the configuration to be applied
 * when a model is rendered.
 */
export class Material {
  defines?: any;
  uniforms?: any;
  vertexShader?: string;
  fragmentShader?: string;
  lineWidth?: number;
  wireframe?: boolean;
  wireframeLinewidth?: number;
  lights?: boolean;
  clipping?: boolean;
  skinning?: boolean;
  morphTargets?: boolean;
  morphNormals?: boolean;
  alphaTest?: number;

  blendDst?: BlendingDstFactor;
  blendDstAlpha?: number;
  blendEquation?: BlendingEquation;
  blendEquationAlpha?: number;
  blending?: Blending;
  blendSrc?: BlendingSrcFactor | BlendingDstFactor;
  blendSrcAlpha?: number;
  clipIntersection?: boolean;
  clippingPlanes?: Plane[];
  clipShadows?: boolean;
  colorWrite?: boolean;
  depthFunc?: DepthModes;
  depthTest?: boolean;
  depthWrite?: boolean;
  fog?: boolean;
  lights?: boolean;
  name?: string;
  opacity?: number;
  overdraw?: number;
  polygonOffset?: boolean;
  polygonOffsetFactor?: number;
  polygonOffsetUnits?: number;
  precision?: 'highp' | 'mediump' | 'lowp' | null;
  premultipliedAlpha?: boolean;
  dithering?: boolean;
  flatShading?: boolean;
  side?: Side;
  transparent?: boolean;
  vertexColors?: Colors;
  visible?: boolean;
}
