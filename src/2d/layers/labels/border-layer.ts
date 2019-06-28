import { InstanceProvider } from "../../../instance-provider";
import {
  ILayerMaterialOptions,
  InstanceAttributeSize,
  IShaderInitialization,
  UniformSize,
  VertexAttributeSize
} from "../../../types";
import { IAutoEasingMethod, Vec } from "../../../util";
import { CommonMaterialOptions } from "../../../util/common-options";
import { ILayer2DProps, Layer2D } from "../../view";
import { BorderInstance } from "./border-instance";

export interface IBorderLayerProps<T extends BorderInstance>
  extends ILayer2DProps<T> {
  animate?: {
    color?: IAutoEasingMethod<Vec>;
    location?: IAutoEasingMethod<Vec>;
  };
  atlas?: string;
  /** Scale factor determining the scale size of the border */
  scaleFactor?(): number;
}

/**
 * This layer displays Borders and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export class BorderLayer<
  T extends BorderInstance,
  U extends IBorderLayerProps<T>
> extends Layer2D<T, U> {
  static defaultProps: IBorderLayerProps<BorderInstance> = {
    key: "",
    data: new InstanceProvider<BorderInstance>()
  };

  static attributeNames = {
    anchor: "anchor",
    color: "color",
    depth: "depth",
    fontScale: "fontScale",
    location: "location",
    maxScale: "maxScale",
    scale: "scale",
    scaling: "scaling",
    size: "size"
  };

  /**
   * Define our shader and it's inputs
   */
  initShader(): IShaderInitialization<BorderInstance> {
    const animate = this.props.animate || {};
    const vertexToNormal: { [key: number]: number } = {
      0: 1,
      1: 1,
      2: -1,
      3: 1,
      4: -1,
      5: -1
    };

    const vertexToSide: { [key: number]: number } = {
      0: 0,
      1: 0,
      2: 0,
      3: 1,
      4: 1,
      5: 1
    };

    const { scaleFactor = () => 1 } = this.props;

    return {
      fs: require("./border-layer.fs"),
      instanceAttributes: [
        {
          easing: animate.location,
          name: BorderLayer.attributeNames.location,
          size: InstanceAttributeSize.TWO,
          update: o => o.position
        },
        {
          name: BorderLayer.attributeNames.anchor,
          size: InstanceAttributeSize.TWO,
          update: o => [o.anchor.x || 0, o.anchor.y || 0]
        },
        {
          name: BorderLayer.attributeNames.size,
          size: InstanceAttributeSize.TWO,
          update: o => o.size
        },
        {
          name: BorderLayer.attributeNames.depth,
          size: InstanceAttributeSize.ONE,
          update: o => [o.depth]
        },
        {
          name: BorderLayer.attributeNames.scaling,
          size: InstanceAttributeSize.ONE,
          update: o => [o.scaling]
        },
        {
          easing: animate.color,
          name: BorderLayer.attributeNames.color,
          size: InstanceAttributeSize.FOUR,
          update: o => o.color
        },
        {
          name: BorderLayer.attributeNames.scale,
          size: InstanceAttributeSize.ONE,
          update: o => [o.scale]
        },
        {
          name: BorderLayer.attributeNames.maxScale,
          size: InstanceAttributeSize.ONE,
          update: o => [o.maxScale]
        },
        {
          name: BorderLayer.attributeNames.fontScale,
          size: InstanceAttributeSize.ONE,
          update: o => [o.fontScale]
        },
        {
          name: "textAreaOrigin",
          size: InstanceAttributeSize.TWO,
          update: o => o.textAreaOrigin
        },
        {
          name: "textAreaAnchor",
          size: InstanceAttributeSize.TWO,
          update: o => o.textAreaAnchor
        }
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: UniformSize.ONE,
          update: _u => [scaleFactor()]
        }
      ],
      vertexAttributes: [
        {
          name: "normals",
          size: VertexAttributeSize.TWO,
          update: (vertex: number) => [
            // Normal
            vertexToNormal[vertex],
            // The side of the quad
            vertexToSide[vertex]
          ]
        }
      ],
      vertexCount: 6,
      vs: require("./border-layer.vs")
    };
  }

  getMaterialOptions(): ILayerMaterialOptions {
    return CommonMaterialOptions.transparentShapeBlending;
  }
}
