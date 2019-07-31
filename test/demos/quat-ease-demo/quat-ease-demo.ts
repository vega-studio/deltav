import * as datGUI from "dat.gui";
import {
  BasicSurface,
  Camera,
  Camera2D,
  ClearFlags,
  createView,
  View3D
} from "src";
import { BaseDemo } from "test/common/base-demo";
import { DEFAULT_RESOURCES } from "test/types";

export class QuatEaseDemo extends BaseDemo {
  providers = {
    //
  };

  parameters = {};

  buildConsole(gui: datGUI.GUI): void {}

  async init() {
    //
  }

  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container,
      rendererOptions: {
        antialias: true
      },
      providers: this.providers,
      cameras: {
        xz: new Camera2D(),
        perspective: Camera.makePerspective({
          fov: 60 * Math.PI / 180,
          far: 100000
        })
      },
      resources: {
        font: DEFAULT_RESOURCES.font
      },
      eventManagers: _cameras => ({}),
      pipeline: (_resources, providers, cameras) => ({
        resources: [],
        scenes: {
          main: {
            views: {
              perspective: createView(View3D, {
                camera: cameras.perspective,
                clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
              })
            },
            layers: {
              //
            }
          }
        }
      })
    });
  }
}
