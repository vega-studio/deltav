import * as Three from "three";
import { InstanceProvider } from "../../instance-provider";
import {
  ILayerProps,
  IModelType,
  IPickingMethods,
  Layer
} from "../../surface/layer";
import {
  IMaterialOptions,
  InstanceAttributeSize,
  InstanceIOValue,
  IShaderInitialization,
  IUniform,
  UniformSize,
  VertexAttributeSize
} from "../../types";
import {
  CommonMaterialOptions,
  IAutoEasingMethod,
  shaderTemplate,
  Vec
} from "../../util";
import { EdgeInstance } from "./edge-instance";
import { edgePicking } from "./edge-picking";
import { EdgeBroadphase, EdgeScaleType, EdgeType } from "./types";

export interface IEdgeLayerProps<T extends EdgeInstance>
  extends ILayerProps<T> {
  /** Properties for animating attributes */
  animate?: {
    end?: IAutoEasingMethod<Vec>;
    start?: IAutoEasingMethod<Vec>;
    colorStart?: IAutoEasingMethod<Vec>;
    colorEnd?: IAutoEasingMethod<Vec>;
    control?: IAutoEasingMethod<Vec>;
  };
  /** Allows adjustments for broadphase interactions for an edge */
  broadphase?: EdgeBroadphase;
  /** Any distance to the mouse from an edge that is less than this distance will be picked */
  minPickDistance?: number;
  /** The transparency of the layer as a whole. (Makes for very efficient fading of all elements) */
  opacity?: number;
  /** This sets a scaling factor for the edge's line width and curve  */
  scaleFactor?(): number;
  /**
   * If this is set, then the thickness of the line and the curvature of the line exists in screen space
   * rather than world space.
   */
  scaleType?: EdgeScaleType;
  /** Specifies how the edge is formed */
  type: EdgeType;
}

export interface IEdgeLayerState {}

/** Converts a control list to an IO value */
function toInstanceIOValue(value: [number, number][]): InstanceIOValue {
  return [value[0][0], value[0][1], value[1][0], value[1][1]];
}

/** This picks the appropriate shader for the edge type desired */
const pickVS = {
  [EdgeType.LINE]: require("./shader/edge-layer-line.vs"),
  [EdgeType.BEZIER]: require("./shader/edge-layer-bezier.vs"),
  [EdgeType.BEZIER2]: require("./shader/edge-layer-bezier2.vs")
};

/** This is the base edge layer which is a template that can be filled with the needed specifics for a given line type */
const baseVS = require("./shader/edge-layer.vs");
const screenVS = require("./shader/edge-layer-screen-curve.vs");
const edgeFS = require("./shader/edge-layer.fs");

/**
 * This layer displays edges and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export class EdgeLayer<
  T extends EdgeInstance,
  U extends IEdgeLayerProps<T>
> extends Layer<T, U> {
  // Set default props for the layer
  static defaultProps: IEdgeLayerProps<EdgeInstance> = {
    broadphase: EdgeBroadphase.ALL,
    data: new InstanceProvider<EdgeInstance>(),
    key: "none",
    scaleType: EdgeScaleType.NONE,
    scene: "default",
    type: EdgeType.LINE
  };

  static attributeNames = {
    start: "start",
    end: "end",
    widthStart: "widthStart",
    widthEnd: "widthEnd",
    depth: "depth",
    colorStart: "colorStart",
    colorEnd: "colorEnd",
    control: "control"
  };

  /**
   * We provide bounds and hit test information for the instances for this layer to allow for mouse picking
   * of elements
   */
  getInstancePickingMethods(): IPickingMethods<EdgeInstance> {
    return edgePicking(this.props);
  }

  /**
   * Define our shader and it's inputs
   */
  initShader(): IShaderInitialization<EdgeInstance> {
    const {
      animate = {},
      scaleFactor = () => 1,
      type,
      scaleType = EdgeScaleType.NONE
    } = this.props;

    const {
      end: animateEnd,
      start: animateStart,
      colorStart: animateColorStart,
      colorEnd: animateColorEnd,
      control: animateControl
    } = animate;

    const MAX_SEGMENTS = type === EdgeType.LINE ? 2 : 50;

    // Calculate the normals and interpolations for our vertices
    const vertexToNormal: { [key: number]: number } = {
      0: 1,
      [MAX_SEGMENTS * 2 + 2]: -1
    };

    const vertexInterpolation: { [key: number]: number } = {
      0: 0,
      [MAX_SEGMENTS * 2 + 2]: 1
    };

    let sign = 1;
    for (let i = 0; i < MAX_SEGMENTS * 2; ++i) {
      vertexToNormal[i + 1] = sign;
      vertexInterpolation[i + 1] = Math.floor(i / 2) / (MAX_SEGMENTS - 1);
      sign *= -1;
    }

    const templateOptions = {
      interpolation: pickVS[type]
    };

    const vs = shaderTemplate({
      options: templateOptions,
      required: {
        name: "Edge Layer",
        values: ["interpolation"]
      },
      shader: scaleType === EdgeScaleType.NONE ? baseVS : screenVS,

      // We do not want to remove any other templating options present
      onToken: (token, replace) => {
        if (!(token in templateOptions)) {
          return `$\{${token}}`;
        }

        return replace;
      }
    });

    return {
      fs: edgeFS,
      instanceAttributes: [
        {
          easing: animateStart,
          name: EdgeLayer.attributeNames.start,
          size: InstanceAttributeSize.TWO,
          update: o => o.start
        },
        {
          easing: animateEnd,
          name: EdgeLayer.attributeNames.end,
          size: InstanceAttributeSize.TWO,
          update: o => o.end
        },
        {
          name: EdgeLayer.attributeNames.widthStart,
          size: InstanceAttributeSize.ONE,
          update: o => [o.widthStart]
        },
        {
          name: EdgeLayer.attributeNames.widthEnd,
          size: InstanceAttributeSize.ONE,
          update: o => [o.widthEnd]
        },
        {
          name: EdgeLayer.attributeNames.depth,
          size: InstanceAttributeSize.ONE,
          update: o => [o.depth]
        },
        {
          easing: animateColorStart,
          name: EdgeLayer.attributeNames.colorStart,
          size: InstanceAttributeSize.FOUR,
          update: o => o.colorStart
        },
        {
          easing: animateColorEnd,
          name: EdgeLayer.attributeNames.colorEnd,
          size: InstanceAttributeSize.FOUR,
          update: o => o.colorEnd
        },
        type === EdgeType.LINE
          ? {
              easing: animateControl,
              name: EdgeLayer.attributeNames.control,
              size: InstanceAttributeSize.FOUR,
              update: _o => [0, 0, 0, 0]
            }
          : null,
        type === EdgeType.BEZIER
          ? {
              easing: animateControl,
              name: EdgeLayer.attributeNames.control,
              size: InstanceAttributeSize.FOUR,
              update: o => [o.control[0][0], o.control[0][1], 0, 0]
            }
          : null,
        type === EdgeType.BEZIER2
          ? {
              easing: animateControl,
              name: EdgeLayer.attributeNames.control,
              size: InstanceAttributeSize.FOUR,
              update: o => toInstanceIOValue(o.control)
            }
          : null
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: UniformSize.ONE,
          update: (_uniform: IUniform) => [scaleFactor()]
        },
        {
          name: "layerOpacity",
          size: UniformSize.ONE,
          update: (_uniform: IUniform) => [
            this.props.opacity === undefined ? 1.0 : this.props.opacity
          ]
        }
      ],
      vertexAttributes: [
        // TODO: This is from the heinous evils of THREEJS and their inability to fix a bug within our lifetimes.
        // Right now position is REQUIRED in order for rendering to occur, otherwise the draw range gets updated to
        // Zero against your wishes.
        {
          name: "position",
          size: VertexAttributeSize.THREE,
          update: (vertex: number) => [
            // Normal
            vertexToNormal[vertex],
            // The side of the quad
            vertexInterpolation[vertex],
            // The number of vertices
            MAX_SEGMENTS * 2
          ]
        }
      ],
      vertexCount: MAX_SEGMENTS * 2 + 2,
      vs: vs.shader
    };
  }

  getModelType(): IModelType {
    return {
      drawMode: Three.TriangleStripDrawMode,
      modelType: Three.Mesh
    };
  }

  getMaterialOptions(): IMaterialOptions {
    return CommonMaterialOptions.transparentShape;
  }
}