import { Geometry, GLSettings, Material, Model } from "../../gl";

export function generateLayerModel(
  id: string,
  geometry: Geometry,
  material: Material,
  drawMode?: GLSettings.Model.DrawMode
): Model {
  const model = new Model(id, geometry, material);
  model.drawMode = drawMode || GLSettings.Model.DrawMode.TRIANGLE_STRIP;

  return model;
}
