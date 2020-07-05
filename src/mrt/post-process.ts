import { createView } from "../surface/view";
import { Camera, createLayer } from "../util";
import { ViewScreen } from "./view/view-screen";

export interface IPostProcess {}

/**
 * This creates a scene, view, and layer configuration quickly. This will
 * perform the task of setting up a screen quad that will let you composite
 * several textures into a single output. This output can either be rendered to
 * the screen directly or target another texture to render to.
 */
export function postProcess(options: IPostProcess) {
  return {
    views: {
      screen: createView(ViewScreen, {
        camera: Camera.makeOrthographic(),
        viewport: { left: 0, top: 0, width: "100%", height: "100%" }
      })
    },
    layers: {
      screen: createLayer()
    }
  };
}
