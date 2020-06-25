import {
  CommonMaterialOptions,
  EdgeBroadphase,
  EdgeScaleType,
  EdgeType,
  IAutoEasingMethod,
  ILayer2DProps,
  ILayerMaterialOptions,
  InstanceAttributeSize,
  InstanceIOValue,
  InstanceProvider,
  IShaderInitialization,
  IUniform,
  Layer2D,
  shaderTemplate,
  UniformSize,
  Vec,
  VertexAttributeSize
} from "src";

import {
  EdgeControlSpace,
  EdgePadding,
  EdgePositionSpace,
  EdgeSizeSpace
} from "../type";
import { EdgeInstance } from "./edge-instance";

export interface IEdgeLayerProps<T extends EdgeInstance>
  extends ILayer2DProps<T> {
  /** Properties for animating attributes */
  animate?: {
    end?: IAutoEasingMethod<Vec>;
    start?: IAutoEasingMethod<Vec>;
    startColor?: IAutoEasingMethod<Vec>;
    endColor?: IAutoEasingMethod<Vec>;
    control?: IAutoEasingMethod<Vec>;
    thickness?: IAutoEasingMethod<Vec>;
  };
  /** Allows adjustments for broadphase interactions for an edge */
  broadphase?: EdgeBroadphase;
  /** Any distance to the mouse from an edge that is less than this distance will be picked */
  minPickDistance?: number;
  /** The transparency of the layer as a whole. (Makes for very efficient fading of all elements) */
  opacity?: number;
  /** This sets a scaling factor for the edge's line width and curve  */
  scaleFactor?(): number;
  sizeScale?(): number;
  /**
   * If this is set, then the thickness of the line and the curvature of the line exists in screen space
   * rather than world space.
   */
  scaleType?: EdgeScaleType;
  /** Specifies how the edge is formed */
  type: EdgeType;

  positionSpace?: EdgePositionSpace;
  sizeSpace?: EdgeSizeSpace;
  controlSpace?: EdgeControlSpace;
  padding?: EdgePadding;

  maxScale?: number;
}

export interface IEdgeLayerState {}

/** Converts a control list to an IO value */
function toInstanceIOValue(value: [number, number][]): InstanceIOValue {
  return [value[0][0], value[0][1], value[1][0], value[1][1]];
}

/** This picks the appropriate shader for the edge type desired */
const pickVS = {
  [EdgeType.LINE]: require("./shader2/interpolation/edge-layer-line.vs"),
  [EdgeType.BEZIER]: require("./shader2/interpolation/edge-layer-bezier.vs"),
  [EdgeType.BEZIER2]: require("./shader2/interpolation/edge-layer-bezier2.vs")
};

const positionVS = {
  [EdgePositionSpace.WORLD]: require("./shader2/position/edge-position-world.vs"),
  [EdgePositionSpace.START_RELATIVE_TO_END]: require("./shader2/position/edge-position-start-relative-to-end.vs"),
  [EdgePositionSpace.END_RELATIVE_TO_START]: require("./shader2/position/edge-position-end-relative-to-start.vs"),
  ["screen"]: require("./shader2/position/edge-position-screen.vs")
};

const sizeVS = {
  [EdgeSizeSpace.WORLD]: require("./shader2/size/edge-size-world.vs"),
  [EdgeSizeSpace.SCREEN]: require("./shader2/size/edge-size-screen.vs"),
  [EdgeSizeSpace.START_SCREEN_END_WORLD]: require("./shader2/size/edge-size-screen-world.vs"),
  [EdgeSizeSpace.START_WORLD_END_SCREEN]: require("./shader2/size/edge-size-world-screen.vs")
};

const controlVS = {
  [EdgeControlSpace.WORLD]: require("./shader2/control/edge-control-world.vs"),
  [EdgeControlSpace.CONTROL1_RELATIVE_TO_START]: require("./shader2/control/edge-control-start-world.vs"),
  [EdgeControlSpace.CONTROL1_RELATIVE_TO_END]: require("./shader2/control/edge-control-end-world.vs"),
  [EdgeControlSpace.CONTROL2_RELATIVE_TO_START]: require("./shader2/control/edge-control-world-start.vs"),
  [EdgeControlSpace.CONTROL2_RELATIVE_TO_END]: require("./shader2/control/edge-control-world-end.vs"),
  [EdgeControlSpace.CONTROL1_RELATIVE_TO_START_CONTROL2_RELATIVE_TO_END]: require("./shader2/control/edge-control-start-end.vs"),
  [EdgeControlSpace.CONTROL1_RELATIVE_TO_START_CONTROL2_RELATIVE_TO_START]: require("./shader2/control/edge-control-start-start.vs"),
  [EdgeControlSpace.CONTROL1_RELATIVE_TO_END_CONTROL2_RELATIVE_TO_END]: require("./shader2/control/edge-control-end-end.vs"),
  [EdgeControlSpace.CONTROL1_RELATIVE_TO_END_CONTROL2_RELATIVE_TO_START]: require("./shader2/control/edge-control-end-start.vs"),
  ["screen"]: require("./shader2/control/edge-control-screen.vs")
};

const paddingVS = {
  [EdgePadding.NONE]: require("./shader2/padding/edge-padding-none.vs"),
  [EdgePadding.START]: require("./shader2/padding/edge-padding-start.vs"),
  [EdgePadding.END]: require("./shader2/padding/edge-padding-end.vs"),
  [EdgePadding.BOTH]: require("./shader2/padding/edge-padding-both.vs")
};

/** This is the base edge layer which is a template that can be filled with the needed specifics for a given line type */
const baseVS = require("./shader2/edge-layer.vs");
const screenVS = require("./shader/edge-layer-screen-curve.vs");
const edgeFS = require("./shader2/edge-layer.fs");

/**
 * This layer displays edges and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export class EdgeLayer<
  T extends EdgeInstance,
  U extends IEdgeLayerProps<T>
> extends Layer2D<T, U> {
  // Set default props for the layer
  static defaultProps: IEdgeLayerProps<EdgeInstance> = {
    broadphase: EdgeBroadphase.ALL,
    data: new InstanceProvider<EdgeInstance>(),
    key: "none",
    scaleType: EdgeScaleType.NONE,
    type: EdgeType.LINE,
    maxScale: Number.MAX_SAFE_INTEGER,
    positionSpace: EdgePositionSpace.WORLD,
    sizeSpace: EdgeSizeSpace.WORLD,
    controlSpace: EdgeControlSpace.WORLD,
    padding: EdgePadding.NONE
  };

  static attributeNames = {
    anchor: "anchor",
    control: "control",
    depth: "depth",
    end: "end",
    endColor: "endColor",
    start: "start",
    startColor: "startColor",
    thickness: "thickness",
    paddings: "paddings"
  };

  /**
   * Define our shader and it's inputs
   */
  initShader(): IShaderInitialization<EdgeInstance> {
    const {
      animate = {},
      scaleFactor = () => 1,
      sizeScale = () => 1,
      type,
      scaleType = EdgeScaleType.NONE,
      maxScale = Number.MAX_SAFE_INTEGER,
      positionSpace = EdgePositionSpace.WORLD,
      sizeSpace = EdgeSizeSpace.WORLD,
      controlSpace = EdgeControlSpace.WORLD,
      padding = EdgePadding.NONE
    } = this.props;

    const {
      end: animateEnd,
      start: animateStart,
      startColor: animateColorStart,
      endColor: animateColorEnd,
      control: animateControl,
      thickness: animateThickness
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

    let glPositionVS: string;
    switch (positionSpace) {
      case EdgePositionSpace.WORLD:
        glPositionVS =
          controlSpace === EdgeControlSpace.WORLD
            ? require("./shader2/gl_Pos/edge-vertex-world.vs")
            : require("./shader2/gl_Pos/edge-vertex-screen-start.vs");
        break;
      case EdgePositionSpace.END_RELATIVE_TO_START:
        glPositionVS = require("./shader2/gl_Pos/edge-vertex-screen-start.vs");
        break;
      case EdgePositionSpace.START_RELATIVE_TO_END:
        glPositionVS = require("./shader2/gl_Pos/edge-vertex-screen-end.vs");
        break;
    }

    const templateOptions = {
      interpolation: pickVS[type],
      getPositions:
        positionSpace === EdgePositionSpace.WORLD &&
        controlSpace !== EdgeControlSpace.WORLD
          ? positionVS["screen"]
          : positionVS[positionSpace],
      getSizes: sizeVS[sizeSpace],
      getControls:
        controlSpace === EdgeControlSpace.WORLD &&
        positionSpace !== EdgePositionSpace.WORLD
          ? controlVS["screen"]
          : controlVS[controlSpace],
      addPaddings: paddingVS[padding],
      getGl_Position: glPositionVS
    };

    const vs = shaderTemplate({
      options: templateOptions,
      required: {
        name: "Edge Layer",
        values: [
          "interpolation",
          "getPositions",
          "getSizes",
          "getControls",
          "addPaddings",
          "getGl_Position"
        ]
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

    console.warn("Vs", vs);

    return {
      fs: edgeFS,
      instanceAttributes: [
        {
          easing: animateColorStart,
          name: EdgeLayer.attributeNames.startColor,
          size: InstanceAttributeSize.FOUR,
          update: o => o.startColor
        },
        {
          easing: animateColorEnd,
          name: EdgeLayer.attributeNames.endColor,
          size: InstanceAttributeSize.FOUR,
          update: o => o.endColor
        },
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
          easing: animateThickness,
          name: EdgeLayer.attributeNames.thickness,
          size: InstanceAttributeSize.TWO,
          update: o => o.thickness
        },
        {
          name: EdgeLayer.attributeNames.paddings,
          size: InstanceAttributeSize.FOUR,
          update: o => [
            o.startPadding[0],
            o.startPadding[1],
            o.endPadding[0],
            o.endPadding[1]
          ]
        },
        {
          name: EdgeLayer.attributeNames.depth,
          size: InstanceAttributeSize.ONE,
          update: o => [o.depth]
        },
        {
          name: EdgeLayer.attributeNames.anchor,
          size: InstanceAttributeSize.TWO,
          update: o => o.anchor
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
          name: "sizeScale",
          size: UniformSize.ONE,
          update: (_uniform: IUniform) => [sizeScale()]
        },
        {
          name: "maxScale",
          size: UniformSize.ONE,
          update: (_uniform: IUniform) => [maxScale]
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
        {
          name: "vertex",
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

  getMaterialOptions(): ILayerMaterialOptions {
    return CommonMaterialOptions.transparentShapeBlending;
  }
}
