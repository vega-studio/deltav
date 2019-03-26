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
import { CommonMaterialOptions, Vec3 } from "../../util";
import { MeshInstance } from "./mesh-instance";

export enum MeshScaleType {
  NONE,
  SCREEN_CURVE
}

export interface IMeshLayerProps<T extends MeshInstance>
  extends ILayerProps<T> {
  scaleType?: MeshScaleType;
  obj: string;
  mtl: string;
  eye: Vec3;
  light: Vec3;
}

export class MeshLayer<
  T extends MeshInstance,
  U extends IMeshLayerProps<T>
> extends Layer<T, U> {
  static defaultProps: IMeshLayerProps<MeshInstance> = {
    data: new InstanceProvider<MeshInstance>(),
    key: "",
    scaleType: MeshScaleType.NONE,
    scene: "default",
    obj: "",
    mtl: "",
    eye: [1, 1, 1],
    light: [1, 1, 1]
  };

  static attributeNames = {
    depth: "depth"
  };

  initShader(): IShaderInitialization<MeshInstance> {
    let count = 0;
    const normals: { [key: number]: number } = {};
    const vertices: { [key: number]: number } = {};

    const ambients: { [key: number]: number } = {};
    const diffuses: { [key: number]: number } = {};
    const speculars: { [key: number]: number } = {};

    const illums: { [key: number]: number } = {};

    const mtl = new objLoader.MaterialLibrary(this.props.mtl);
    const obj = new objLoader.Mesh(this.props.obj);

    let i = 0;
    obj.indices.forEach(index => {
      const materialIndex = obj.vertexMaterialIndices[index];
      const materialName = obj.materialNames[materialIndex];
      const material = mtl.materials[materialName];

      vertices[i] = obj.vertices[index * 3];
      normals[i] = obj.vertexNormals[index * 3];
      ambients[i] = material.ambient[0];
      diffuses[i] = material.diffuse[0];
      speculars[i] = material.diffuse[0];
      illums[i] = material.illumination;
      i++;
      vertices[i] = obj.vertices[index * 3 + 1];
      normals[i] = obj.vertexNormals[index * 3 + 1];
      ambients[i] = material.ambient[1];
      diffuses[i] = material.diffuse[1];
      speculars[i] = material.diffuse[1];
      illums[i] = material.illumination;
      i++;
      vertices[i] = obj.vertices[index * 3 + 2];
      normals[i] = obj.vertexNormals[index * 3 + 2];
      ambients[i] = material.ambient[2];
      diffuses[i] = material.diffuse[2];
      speculars[i] = material.diffuse[2];
      illums[i] = material.illumination;
      i++;
    });

    count = i;
    console.warn("obj", obj);

    console.warn("view", this.view);

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
        },
        {
          name: "eye_position",
          size: UniformSize.THREE,
          update: _u => this.props.eye
        },
        {
          name: "light_position",
          size: UniformSize.THREE,
          update: _u => this.props.light
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
        },
        {
          name: "normal",
          size: VertexAttributeSize.THREE,
          update: (vertex: number) => [
            normals[3 * vertex],
            normals[3 * vertex + 1],
            normals[3 * vertex + 2]
          ]
        },
        {
          name: "ambient",
          size: VertexAttributeSize.THREE,
          update: (vertex: number) => [
            ambients[3 * vertex],
            ambients[3 * vertex + 1],
            ambients[3 * vertex + 2]
          ]
        },
        {
          name: "diffuse",
          size: VertexAttributeSize.THREE,
          update: (vertex: number) => [
            diffuses[3 * vertex],
            diffuses[3 * vertex + 1],
            diffuses[3 * vertex + 2]
          ]
        },
        {
          name: "specular",
          size: VertexAttributeSize.THREE,
          update: (vertex: number) => [
            speculars[3 * vertex],
            speculars[3 * vertex + 1],
            speculars[3 * vertex + 2]
          ]
        },
        {
          name: "illumination",
          size: VertexAttributeSize.ONE,
          update: (vertex: number) => [illums[vertex]]
        }
      ],
      vertexCount: count,
      vs: require("./mesh-layer.vs")
    };
  }

  getModelType(): IModelType {
    return {
      drawMode: Three.TrianglesDrawMode,
      modelType: Three.Mesh
    };
  }

  getMaterialOptions(): IMaterialOptions {
    return Object.assign({}, CommonMaterialOptions.transparentShape, {
      side: Three.FrontSide,
      wireframe: false
    } as IMaterialOptions);
  }
}
