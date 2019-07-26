import * as objLoader from "webgl-obj-loader";
import {
  atlasRequest,
  GLSettings,
  ILayerProps,
  InstanceAttributeSize,
  InstanceProvider,
  IShaderInitialization,
  isVideoResource,
  Layer,
  UniformSize,
  VertexAttributeSize
} from "../../../../src";
import { Light } from "./light";
import { MeshInstance } from "./mesh-instance";

const WHITE_PIXEL = new Image();
WHITE_PIXEL.src =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

export enum MeshScaleType {
  NONE,
  SCREEN_CURVE
}

export interface IMeshLayerProps<T extends MeshInstance>
  extends ILayerProps<T> {
  atlas?: string;
  scaleType?: MeshScaleType;
  obj: string;
  mtl: string;
  light: Light;
  hasTexture?: boolean;
  rasterizationScale?: number;
}

export class MeshLayer<
  T extends MeshInstance,
  U extends IMeshLayerProps<T>
> extends Layer<T, U> {
  static defaultProps: IMeshLayerProps<MeshInstance> = {
    data: new InstanceProvider<MeshInstance>(),
    key: "",
    scaleType: MeshScaleType.NONE,
    // scene: "default",
    obj: "",
    mtl: "",
    light: new Light({ position: [1, 1, 1] }),
    hasTexture: false
  };

  static attributeNames = {
    depth: "depth",
    texture: "texture"
  };

  sourceToVideo = new Map<string, HTMLVideoElement>();

  private getAtlasSource(mesh: MeshInstance) {
    if (isVideoResource(mesh.source)) {
      return this.sourceToVideo.get(mesh.source.videoSrc) || WHITE_PIXEL;
    }
    // console.warn("source", mesh.source);
    return mesh.source;
  }

  initShader(): IShaderInitialization<MeshInstance> {
    let count = 0;
    const normals: { [key: number]: number } = {};
    const vertices: { [key: number]: number } = {};
    const textures: { [key: number]: number } = {};

    const ambients: { [key: number]: number } = {};
    const diffuses: { [key: number]: number } = {};
    const speculars: { [key: number]: number } = {};

    const illums: { [key: number]: number } = {};

    const mtl = new objLoader.MaterialLibrary(this.props.mtl);
    const obj = new objLoader.Mesh(this.props.obj);

    let i = 0;
    let j = 0;
    obj.indices.forEach(index => {
      const materialIndex = obj.vertexMaterialIndices[index];
      const materialName = obj.materialNames[materialIndex];
      const material = mtl.materials[materialName];

      vertices[i] = obj.vertices[index * 3];
      normals[i] = obj.vertexNormals[index * 3];
      ambients[i] = material.ambient[0];
      diffuses[i] = material.diffuse[0];
      speculars[i] = material.specular[0];
      illums[i] = material.illumination;
      i++;
      vertices[i] = obj.vertices[index * 3 + 1];
      normals[i] = obj.vertexNormals[index * 3 + 1];
      ambients[i] = material.ambient[1];
      diffuses[i] = material.diffuse[1];
      speculars[i] = material.specular[1];
      illums[i] = material.illumination;
      i++;
      vertices[i] = -obj.vertices[index * 3 + 2];
      normals[i] = obj.vertexNormals[index * 3 + 2];
      ambients[i] = material.ambient[2];
      diffuses[i] = material.diffuse[2];
      speculars[i] = material.specular[2];
      illums[i] = material.illumination;
      i++;

      textures[j] = obj.textures[index * 2];
      j++;
      textures[j] = obj.textures[index * 2 + 1];
      j++;
    });

    count = i;

    return {
      drawMode: GLSettings.Model.DrawMode.TRIANGLES,
      fs: require("./mesh-layer.fs"),
      instanceAttributes: [
        {
          name: MeshLayer.attributeNames.texture,
          resource: {
            key: () => this.props.atlas || "",
            name: "imageAtlas"
          },
          update: o => {
            const resource = this.getAtlasSource(o);

            if (!o.request) {
              o.request = atlasRequest({
                key: this.props.atlas || "",
                source: resource,
                rasterizationScale: 1.0
              });
            }

            return this.resource.request(this, o, o.request);
          }
          /*{
            if (
              !o.request ||
              (o.request.texture && !o.request.texture.isValid)
            ) {
              const resource = this.getAtlasSource(o);

              const request = atlasRequest({
                key: this.props.atlas || "",
                source: resource,
                rasterizationScale: 1.0
              });

              return this.resource.request(this, o, request);
            }
            return
          }*/
        },
        {
          name: "transform",
          size: InstanceAttributeSize.FOUR,
          update: o => o.transform
        },
        {
          name: "quaternion",
          size: InstanceAttributeSize.FOUR,
          update: o => o.quaternion
        },
        {
          name: "scale",
          size: InstanceAttributeSize.FOUR,
          update: o => o.scale
        }
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: UniformSize.ONE,
          update: _u => [1]
        },
        {
          name: "light_position",
          size: UniformSize.THREE,
          update: _u => this.props.light.position
        },
        {
          name: "light_type",
          size: UniformSize.ONE,
          update: _u => this.props.light.type
        },
        {
          name: "ambient_color",
          size: UniformSize.FOUR,
          update: _u => this.props.light.ambientColor
        },
        {
          name: "diffuse_color",
          size: UniformSize.FOUR,
          update: _u => this.props.light.diffuseColor
        },
        {
          name: "specular_color",
          size: UniformSize.FOUR,
          update: _u => this.props.light.specularColor
        },
        {
          name: "has_texture",
          size: UniformSize.ONE,
          update: _u => Number(this.props.hasTexture)
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
          name: "tex",
          size: VertexAttributeSize.TWO,
          update: (vertex: number) => [
            textures[2 * vertex],
            textures[2 * vertex + 1]
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
      vertexCount: count / 3,
      vs: require("./mesh-layer.vs")
    };
  }
}
