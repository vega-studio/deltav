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
import { ArmInstance } from "./arm/arm-instance";
import { ArmLayer } from "./arm/arm-layer";
import { BoneInstance } from "./bone/bone-instance";
import { BoneLayer } from "./bone/bone-layer";

export class BoneDemo extends BaseDemo {
  providers = {
    bones: new InstanceProvider<BoneInstance>(),
    arms: new InstanceProvider<ArmInstance>()
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
              }),
              arms: createLayer(ArmLayer, {
                data: providers.arms
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
    camera.position = [0, 0, 30];
    camera.lookAt([0, 0, 0], [0, 1, 0]);

    let angle = Math.PI / 4;

    const transform1 = new Transform();
    transform1.rotation = eulerToQuat([0, 0, Math.PI / 4]);

    const transform2 = new Transform();
    transform2.rotation = eulerToQuat([Math.PI / 2, 0, angle]);

    const transform3 = new Transform();
    transform3.rotation = eulerToQuat([0, 0, -Math.PI / 3]);

    const transform4 = new Transform();
    transform4.rotation = eulerToQuat([0, 0, Math.PI / 2]);

    const bone1 = new BoneInstance({
      transform: transform1,
      color: [1, 0, 0, 1]
    });

    const bone2 = new BoneInstance({
      transform: transform2,
      color: [0, 0, 1, 1]
    });

    const bone3 = new BoneInstance({
      transform: transform3,
      color: [0, 1, 0, 1]
    });

    const bone4 = new BoneInstance({
      transform: transform4,
      color: [1, 1, 0, 1]
    });

    bone1.addChild(bone2);

    // bone2.addChild(bone4);
    // bone2.addChild(bone3);
    // this.providers.bones.add(bone2);
    // this.providers.bones.add(bone1);

    // this.providers.bones.add(bone3);
    // this.providers.bones.add(bone4);

    const arm = new ArmInstance({
      transform: transform1,
      quat1: eulerToQuat([0, 0, Math.PI / 6]),
      length1: 6,
      length2: 6,
      quat2: eulerToQuat([0, 0, -Math.PI / 4])
    });

    this.providers.arms.add(arm);

    setTimeout(() => {
      setInterval(() => {
        angle += 0.01;
        arm.quat2 = eulerToQuat([0, 0, angle]);
      }, 50);
    }, 2000);
  }
}
