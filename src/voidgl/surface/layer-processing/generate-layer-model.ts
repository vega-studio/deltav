import * as Three from "three";
import { IModelConstructable, Layer } from "../layer";

function isMesh(val: any): val is Three.Mesh {
  return Boolean(val.isMesh);
}

export function generateLayerModel(
  layer: Layer<any, any>,
  geometry: Three.BufferGeometry,
  material: Three.ShaderMaterial
): IModelConstructable & Three.Object3D {
  const modelInfo = layer.getModelType();
  const model = new modelInfo.modelType(geometry, material);

  if (isMesh(model)) {
    model.drawMode =
      modelInfo.drawMode === undefined
        ? Three.TriangleStripDrawMode
        : modelInfo.drawMode;
  }

  return model;
}
