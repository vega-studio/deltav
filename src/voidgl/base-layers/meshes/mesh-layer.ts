import * as Three from "three";
import * as objLoader from "webgl-obj-loader";
import { InstanceProvider } from "../../instance-provider";
import { ILayerProps, IModelType, Layer } from "../../surface/layer";
import {
  IMaterialOptions,
  InstanceAttributeSize,
  IShaderInitialization,
  UniformSize,
  VertexAttributeSize
} from "../../types";
import { CommonMaterialOptions } from "../../util";
import { MeshInstance } from "./mesh-instance";

export enum MeshScaleType {
  NONE,
  SCREEN_CURVE
}

export interface IMeshLayerProps<T extends MeshInstance>
  extends ILayerProps<T> {
  scaleType?: MeshScaleType;
  obj?: string;
}

export class MeshLayer<
  T extends MeshInstance,
  U extends IMeshLayerProps<T>
> extends Layer<T, U> {
  static defaultProps: IMeshLayerProps<MeshInstance> = {
    data: new InstanceProvider<MeshInstance>(),
    key: "",
    scaleType: MeshScaleType.NONE,
    scene: "default"
  };

  static attributeNames = {
    depth: "depth"
  };

  initShader(): IShaderInitialization<MeshInstance> {
    let count = 0;
    const normals: { [key: number]: number } = {};
    const vertices: { [key: number]: number } = {};

    if (this.props.obj) {
      const obj = new objLoader.Mesh(this.props.obj);
      console.warn("layer", obj);
      obj.vertexNormals.forEach((value, index) => {
        normals[index] = value;
      });

      let xMin = obj.vertices[0];
      let xMax = obj.vertices[0];
      let yMin = obj.vertices[1];
      let yMax = obj.vertices[1];
      let zMin = obj.vertices[2];
      let zMax = obj.vertices[2];

      obj.vertices.forEach((value, index) => {
        vertices[index] = value;

        if (index % 3 === 0) {
          if (value < xMin) xMin = value;
          if (value > xMax) xMax = value;
        } else if (index % 3 === 1) {
          if (value < yMin) yMin = value;
          if (value > yMax) yMax = value;
        } else {
          if (value < zMin) zMin = value;
          if (value > zMax) zMax = value;
        }
      });

      console.warn(xMax - xMin, yMax - yMin, zMax - zMin);

      count = obj.vertices.length;
    }

    //console.warn(normals, vertices);
    console.warn("layer view", this.view);
    return {
      fs: require("./mesh-layer.fs"),
      instanceAttributes: [
        {
          name: MeshLayer.attributeNames.depth,
          size: InstanceAttributeSize.ONE,
          update: o => [o.depth]
        }
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: UniformSize.ONE,
          update: _u => [1]
        }
      ],
      vertexAttributes: [
        {
          name: "position",
          size: VertexAttributeSize.THREE,
          update: (vertex: number) => [
            vertices[3 * vertex],
            vertices[3 * vertex + 1],
            vertices[3 * vertex + 2]
          ]
        }
      ],
      vertexCount: count / 3,
      vs: require("./mesh-layer.vs")
    };
  }

  getModelType(): IModelType {
    return {
      drawMode: Three.TriangleStripDrawMode,
      modelType: Three.Mesh
    };
  }

  getMaterialOptions(): IMaterialOptions {
    return Object.assign({}, CommonMaterialOptions.transparentShape, {
      side: Three.DoubleSide,
      wireframe: false
    } as IMaterialOptions);
  }
}
