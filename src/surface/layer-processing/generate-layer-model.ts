import { Geometry, GLSettings, Material, Model } from "../../gl";

export function generateLayerModel(
  geometry: Geometry,
  material: Material,
  drawMode?: GLSettings.Model.DrawMode
): Model {
  const model = new Model(geometry, material);

  model.drawMode =
    drawMode === undefined
      ? GLSettings.Model.DrawMode.TRIANGLE_STRIP
      : drawMode;

  return model;
}
