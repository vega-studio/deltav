import { Geometry, GLSettings, Material, Model } from "../../gl";
import { Layer } from "../layer";

export function generateLayerModel(
  layer: Layer<any, any>,
  geometry: Geometry,
  material: Material
): Model {
  const modelInfo = layer.getModelType();
  const model = new Model(geometry, material);

  model.drawMode =
    modelInfo.drawMode === undefined
      ? GLSettings.Model.DrawMode.TRIANGLE_STRIP
      : modelInfo.drawMode;

  return model;
}
