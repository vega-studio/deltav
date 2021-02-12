import * as datGUI from "dat.gui";

import {
  BasicSurface,
  ClearFlags,
  createLayer,
  createView,
  EulerOrder,
  fromOrderedEulerToQuat,
  InstanceProvider,
  M4R,
  multiply4x4,
  onAnimationLoop,
  scale3,
  shearX4x4,
  shearY4x4,
  shearZ4x4,
  stopAnimationLoop,
  Transform,
  View3D,
  zeroQuat
} from "../../../src";
import { Camera, CameraProjectionType } from "../../../src/util/camera";
import { BaseDemo } from "../../common/base-demo";
import { CubeInstance } from "./cube/cube-instance";
import { CubeLayer } from "./cube/cube-layer";

/**
 * A very basic demo proving the system is operating as expected
 */
export class SpecializedTransformDemo extends BaseDemo {
  cube: CubeInstance;
  rotate = false;
  angle = 0;
  focus: Transform;

  /** Surface providers */
  providers = {
    cubes: new InstanceProvider<CubeInstance>()
  };

  /** GUI properties */
  parameters = {
    cameraMode: "Orthographic",
    reset: () => {
      this.focus.localRotation = zeroQuat();
      for (const key in this.parameters.cube) {
        (this.parameters.cube as any)[key] = 0;
      }

      for (const key in this.parameters.camera) {
        (this.parameters.camera as any)[key] = 0;
      }

      this.parameters.updateCube();
      this.parameters.updateCamera();
    },

    rotate: () => {
      this.rotate = !this.rotate;
    },

    rotate45: () => {
      if (!this.surface) return;
      this.angle += Math.PI / 4;
      this.focus.localRotation = fromOrderedEulerToQuat(
        [0, this.angle, 0],
        EulerOrder.xyz
      );
    },

    updateCube: () => {
      this.cube.transform.localTransform = multiply4x4(
        multiply4x4(
          shearX4x4(
            this.parameters.cube.skewXAlongY,
            this.parameters.cube.skewXAlongZ,
            M4R[0]
          ),
          shearY4x4(
            this.parameters.cube.skewYAlongX,
            this.parameters.cube.skewYAlongZ,
            M4R[1]
          ),
          M4R[2]
        ),
        shearZ4x4(
          this.parameters.cube.skewZAlongX,
          this.parameters.cube.skewZAlongY,
          M4R[3]
        )
      );
    },

    updateCamera: () => {
      if (!this.surface) return;
      this.surface.cameras.main.transform.localViewTransform = multiply4x4(
        multiply4x4(
          shearX4x4(
            this.parameters.camera.skewXAlongY,
            this.parameters.camera.skewXAlongZ,
            M4R[0]
          ),
          shearY4x4(
            this.parameters.camera.skewYAlongX,
            this.parameters.camera.skewYAlongZ,
            M4R[1]
          ),
          M4R[2]
        ),
        shearZ4x4(
          this.parameters.camera.skewZAlongX,
          this.parameters.camera.skewZAlongY,
          M4R[3]
        )
      );
    },

    cube: {
      skewXAlongY: 0,
      skewXAlongZ: 0,
      skewYAlongX: 0,
      skewYAlongZ: 0,
      skewZAlongX: 0,
      skewZAlongY: 0
    },

    camera: {
      skewXAlongY: 0,
      skewXAlongZ: 0,
      skewYAlongX: 0,
      skewYAlongZ: 0,
      skewZAlongX: 0,
      skewZAlongY: 0
    }
  };

  loopId: Promise<number>;

  buildConsole(gui: datGUI.GUI): void {
    const parameters = gui.addFolder("Parameters");
    parameters
      .add(this.parameters, "cameraMode", {
        orthographic: "Orthographic",
        perspective: "Perspective"
      })
      .onFinishChange(() => {
        this.reset();
      });

    const updateCube = this.parameters.updateCube;
    const updateCamera = this.parameters.updateCamera;

    parameters.add(this.parameters, "reset");
    parameters.add(this.parameters, "rotate");
    parameters.add(this.parameters, "rotate45");

    const cube = parameters.addFolder("Cube");
    cube
      .add(
        this.parameters.cube,
        "skewXAlongY",
        -Math.PI / 2 + 0.001,
        Math.PI / 2 - 0.001,
        0.01
      )
      .onFinishChange(updateCube);
    cube
      .add(
        this.parameters.cube,
        "skewXAlongZ",
        -Math.PI / 2 + 0.001,
        Math.PI / 2 - 0.001,
        0.01
      )
      .onFinishChange(updateCube);
    cube
      .add(
        this.parameters.cube,
        "skewYAlongX",
        -Math.PI / 2 + 0.001,
        Math.PI / 2 - 0.001,
        0.01
      )
      .onFinishChange(updateCube);
    cube
      .add(
        this.parameters.cube,
        "skewYAlongZ",
        -Math.PI / 2 + 0.001,
        Math.PI / 2 - 0.001,
        0.01
      )
      .onFinishChange(updateCube);
    cube
      .add(
        this.parameters.cube,
        "skewZAlongX",
        -Math.PI / 2 + 0.001,
        Math.PI / 2 - 0.001,
        0.01
      )
      .onFinishChange(updateCube);
    cube
      .add(
        this.parameters.cube,
        "skewZAlongY",
        -Math.PI / 2 + 0.001,
        Math.PI / 2 - 0.001,
        0.01
      )
      .onFinishChange(updateCube);

    const camera = parameters.addFolder("Camera");
    camera
      .add(
        this.parameters.camera,
        "skewXAlongY",
        -Math.PI / 2 + 0.001,
        Math.PI / 2 - 0.001,
        0.01
      )
      .onFinishChange(updateCamera);
    camera
      .add(
        this.parameters.camera,
        "skewXAlongZ",
        -Math.PI / 2 + 0.001,
        Math.PI / 2 - 0.001,
        0.01
      )
      .onFinishChange(updateCamera);
    camera
      .add(
        this.parameters.camera,
        "skewYAlongX",
        -Math.PI / 2 + 0.001,
        Math.PI / 2 - 0.001,
        0.01
      )
      .onFinishChange(updateCamera);
    camera
      .add(
        this.parameters.camera,
        "skewYAlongZ",
        -Math.PI / 2 + 0.001,
        Math.PI / 2 - 0.001,
        0.01
      )
      .onFinishChange(updateCamera);
    camera
      .add(
        this.parameters.camera,
        "skewZAlongX",
        -Math.PI / 2 + 0.001,
        Math.PI / 2 - 0.001,
        0.01
      )
      .onFinishChange(updateCamera);
    camera
      .add(
        this.parameters.camera,
        "skewZAlongY",
        -Math.PI / 2 + 0.001,
        Math.PI / 2 - 0.001,
        0.01
      )
      .onFinishChange(updateCamera);
  }

  destroy(): void {
    super.destroy();
    stopAnimationLoop(this.loopId);
  }

  reset() {
    if (this.surface) {
      this.destroy();
      this.providers.cubes.clear();
      this.surface.cameras.main =
        this.parameters.cameraMode === "Perspective"
          ? Camera.makePerspective({
              fov: (60 * Math.PI) / 180,
              far: 100000
            })
          : Camera.makeOrthographic();
      this.surface.rebuild();
      this.init();
    }
  }

  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container,
      rendererOptions: {
        antialias: true
      },
      providers: this.providers,
      cameras: {
        main:
          this.parameters.cameraMode === "Perspective"
            ? Camera.makePerspective({
                fov: (60 * Math.PI) / 180,
                far: 100000
              })
            : Camera.makeOrthographic()
      },
      resources: {},
      eventManagers: _cameras => ({}),
      scenes: (_resources, providers, cameras) => ({
        main: {
          views: {
            perspective: createView(View3D, {
              camera: cameras.main,
              clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
            })
          },
          layers: {
            cubes: createLayer(CubeLayer, {
              data: providers.cubes
            })
          }
        }
      })
    });
  }

  async init() {
    if (!this.surface) return;

    const camera = this.surface.cameras.main;
    camera.position = [0, 10, 25];
    camera.lookAt([0, 0, 0], [0, 1, 0]);
    this.focus = new Transform();
    camera.transform.parent = this.focus;

    const factor =
      camera.projectionType === CameraProjectionType.PERSPECTIVE ? 1 : 100;

    this.cube = this.providers.cubes.add(
      new CubeInstance({
        color: [0.9, 0.56, 0.2, 1],
        size: scale3([1, 1, 1], factor)
      })
    );

    this.providers.cubes.add(
      new CubeInstance({
        color: [0.9, 0.56, 0.2, 1],
        size: scale3([1, 1, 1], factor),
        transform: new Transform({
          localPosition: [-factor * 4, 0, 0]
        })
      })
    );

    this.providers.cubes.add(
      new CubeInstance({
        color: [0.9, 0.56, 0.2, 1],
        size: scale3([1, 1, 1], factor),
        transform: new Transform({
          localPosition: [factor * 4, 0, 0]
        })
      })
    );

    onAnimationLoop(t => {
      if (!this.rotate) {
        return;
      }
      this.focus.localRotation = fromOrderedEulerToQuat(
        [0, t / 1000, 0],
        EulerOrder.xyz
      );
    });
  }
}
