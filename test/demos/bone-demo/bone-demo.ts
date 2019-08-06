import {
  BasicSurface,
  Camera,
  ClearFlags,
  createLayer,
  createView,
  eulerToQuat,
  InstanceProvider,
  Transform,
  View3D
} from "src";
import { BaseDemo } from "test/common/base-demo";
import { BoneInstance } from "./bone/bone-instance";
import { BoneLayer } from "./bone/bone-layer";

export class BoneDemo extends BaseDemo {
  providers = {
    bones: new InstanceProvider<BoneInstance>()
  };
  buildConsole(_gui: dat.GUI) {
    //
  }

  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container,
      providers: this.providers,
      cameras: {
        perspective: Camera.makePerspective({
          fov: 60 * Math.PI / 180,
          far: 100000
        })
      },
      resources: {},
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
              bones: createLayer(BoneLayer, {
                data: providers.bones
              })
            }
          }
        }
      })
    });
  }

  async init() {
    if (!this.surface) return;
    await this.surface;

    const camera = this.surface.cameras.perspective;
    camera.position = [0, 0, 10];
    camera.lookAt([0, 0, 0], [0, 1, 0]);

    const transform1 = new Transform();
    transform1.rotation = eulerToQuat([0, 0, Math.PI / 4]);

    const transform2 = new Transform();
    //transform2.rotation = eulerToQuat([0, 0, Math.PI / 4]);

    const bone1 = new BoneInstance({
      transform: transform1,
      color: [1, 0, 0, 1]
    });

    const bone2 = new BoneInstance({
      transform: transform2,
      color: [0, 0, 1, 1]
    });
    bone1.addChild(bone2);

    this.providers.bones.add(bone1);
    this.providers.bones.add(bone2);
  }
}
