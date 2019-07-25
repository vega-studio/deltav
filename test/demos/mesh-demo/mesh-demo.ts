import * as datGUI from "dat.gui";
import { BaseDemo } from "test/common/base-demo";
import * as objLoader from "webgl-obj-loader";
import {
  BasicSurface,
  Camera,
  Camera2D,
  ClearFlags,
  createAtlas,
  createLayer,
  createView,
  cross3,
  InstanceProvider,
  Mat4x4,
  matrix4x4ToQuaternion,
  multiply4x4,
  PickType,
  rotationByAxis,
  subtract3,
  TextureSize,
  Transform,
  transform4,
  Vec3,
  View3D
} from "../../../src";
import { Light } from "./mesh/light";
import { MeshInstance } from "./mesh/mesh-instance";
import { MeshLayer } from "./mesh/mesh-layer";

const imageData1 = require("./images/Face.png");
const imageData2 = require("./images/tex.png");
const cubeTexture = new Image();
cubeTexture.src = imageData1;
const sphereTexture = new Image();
sphereTexture.src = imageData2;

const TO_RADIANS = Math.PI / 180;

export enum CameraOrder {
  DIRECT,
  DVH,
  DHV,
  VHD,
  VDH,
  HVD,
  HDV
}

export class MeshDemo extends BaseDemo {
  obj: string = require("./obj/lego/lego.obj");
  mtl: string = require("./obj/lego/lego.mtl");

  gui: datGUI.GUI;

  mouseDown: boolean = false;
  private center: Vec3 = [0, 0, 0];

  distance: number = 200;
  angleV: number = 90 * TO_RADIANS;
  angleH: number = 90 * TO_RADIANS;
  order: CameraOrder = CameraOrder.DIRECT;

  transform: Transform;

  mesh: MeshInstance;

  matrix: Mat4x4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

  parameters = {
    distance: this.distance,
    angleV: Math.round(this.angleV / TO_RADIANS),
    angleH: Math.round(this.angleH / TO_RADIANS),
    duration: 100,
    order: this.order,
    random: () => {
      this.parameters.angleH = 1 + Math.round(179 * Math.random());
      this.parameters.angleV = Math.round(360 * Math.random());
      this.moveCamera(
        (this.parameters.distance = 1 + Math.round(399 * Math.random())),
        this.parameters.angleH * TO_RADIANS,
        this.parameters.angleV * TO_RADIANS,
        this.parameters.duration,
        this.order
      );

      this.gui.updateDisplay();
    }
  };

  providers = {
    spheres: new InstanceProvider<MeshInstance>(),
    cubes: new InstanceProvider<MeshInstance>()
  };

  mouseX: number;
  mouseY: number;

  buildConsole(gui: datGUI.GUI): void {
    this.gui = gui;
    const parameters = gui.addFolder("Parameters");
    parameters
      .add(this.parameters, "distance", 1, 400, 1)
      .onFinishChange((value: number) => {
        this.moveCameraByDistance(value, this.parameters.duration);
      });
    parameters
      .add(this.parameters, "angleV", 0, 180, 1)
      .onFinishChange((value: number) => {
        this.moveCameraByAngleV(value * TO_RADIANS, this.parameters.duration);
      });
    parameters
      .add(this.parameters, "angleH", 0, 360, 1)
      .onFinishChange((value: number) => {
        this.moveCameraByAngleH(value * TO_RADIANS, this.parameters.duration);
        /*const q = fromEulerAxisAngleToQuat(
          [0, 1, 0],
          -value * TO_RADIANS + this.angleH
        );
        this.mesh.quaternion = multiplyQuat(q, this.mesh.quaternion);
        this.angleH = value;*/
      });
    parameters.add(this.parameters, "duration", 100, 2000, 100);
    parameters
      .add(this.parameters, "order", {
        DIRECT: 0,
        DVH: 1,
        DHV: 2,
        VHD: 3,
        VDH: 4,
        HVD: 5,
        HDV: 6
      })
      .onChange((value: string) => {
        switch (value) {
          case "0":
            this.order = CameraOrder.DIRECT;
            break;
          case "1":
            this.order = CameraOrder.DVH;
            break;
          case "2":
            this.order = CameraOrder.DHV;
            break;
          case "3":
            this.order = CameraOrder.VHD;
            break;
          case "4":
            this.order = CameraOrder.VDH;
            break;
          case "5":
            this.order = CameraOrder.HVD;
            break;
          case "6":
            this.order = CameraOrder.HDV;
            break;
        }
      });
    parameters.add(this.parameters, "random");
  }

  destroy(): void {
    super.destroy();
  }

  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container,
      rendererOptions: {
        antialias: true
      },
      providers: this.providers,
      cameras: {
        flat: new Camera2D(),
        perspective: Camera.makePerspective({
          fov: 60 * Math.PI / 180,
          far: 100000
        })
      },
      resources: {
        atlas: createAtlas({
          width: TextureSize._4096,
          height: TextureSize._4096
        })
      },
      eventManagers: _cameras => ({}),
      pipeline: (resources, providers, cameras) => ({
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
              cubes: createLayer(MeshLayer, {
                atlas: resources.atlas.key,
                data: providers.cubes,
                picking: PickType.SINGLE,
                key: "meshes",
                obj: this.obj,
                mtl: this.mtl,
                light: new Light({ position: [1, 1, 1] }),
                onMouseDown: info => {
                  this.mouseDown = true;
                  this.mouseX = info.screen[0];
                  this.mouseY = info.screen[1];
                },
                onMouseUp: info => {
                  this.mouseDown = false;
                  this.mouseX = info.screen[0];
                  this.mouseY = info.screen[1];
                },
                onMouseUpOutside: () => {
                  this.mouseDown = false;
                },
                onMouseMove: info => {
                  if (this.mouseDown && this.surface) {
                    /*this.angleH += (info.screen[0] - this.mouseX) / 100;
                    this.angleV += -(info.screen[1] - this.mouseY) / 100;
                    if (this.angleV < 0.0001) this.angleV = 0.0001;
                    if (this.angleV > Math.PI) this.angleV = Math.PI;
                    this.setCamera();
                    this.mouseX = info.screen[0];
                    this.mouseY = info.screen[1];*/

                    const angleU = -(info.screen[0] - this.mouseX) / 100;
                    const angleT = -(info.screen[1] - this.mouseY) / 100;

                    const vectorFromObjectoCamera = subtract3(
                      this.surface.cameras.perspective.position,
                      this.center
                    );

                    const t = cross3([0, 1, 0], vectorFromObjectoCamera);
                    const u = cross3(vectorFromObjectoCamera, t);

                    const t2 = transform4(this.matrix, [t[0], t[1], t[2], 1]);
                    const u2 = transform4(this.matrix, [u[0], u[1], u[2], 1]);

                    const matrixT = rotationByAxis(t2[0], t2[1], t2[2], angleT);
                    const matrixU = rotationByAxis(u2[0], u2[1], u2[2], angleU);

                    this.matrix = multiply4x4(
                      matrixT,
                      multiply4x4(matrixU, this.matrix)
                    );

                    this.mesh.quaternion = matrix4x4ToQuaternion(this.matrix);

                    this.mouseX = info.screen[0];
                    this.mouseY = info.screen[1];
                  }
                }
              })
            }
          }
        }
      })
    });
  }

  moveCameraByDistance(distance: number, duration: number) {
    const newPosition: Vec3 = [
      this.center[0] + distance * Math.sin(this.angleV) * Math.cos(this.angleH),
      this.center[1] + distance * Math.cos(this.angleV),
      this.center[2] + distance * Math.sin(this.angleV) * Math.sin(this.angleH)
    ];

    this.moveCameraToPosition(newPosition, duration);
    this.distance = distance;
  }

  moveCameraByAngleH(angleH: number, duration: number) {
    const newPosition: Vec3 = [
      this.center[0] + this.distance * Math.sin(this.angleV) * Math.cos(angleH),
      this.center[1] + this.distance * Math.cos(this.angleV),
      this.center[2] + this.distance * Math.sin(this.angleV) * Math.sin(angleH)
    ];

    this.moveCameraToPosition(newPosition, duration);
    this.angleH = angleH;
  }

  moveCameraByAngleV(angleV: number, duration: number) {
    const newPosition: Vec3 = [
      this.center[0] + this.distance * Math.sin(angleV) * Math.cos(this.angleH),
      this.center[1] + this.distance * Math.cos(angleV),
      this.center[2] + this.distance * Math.sin(angleV) * Math.sin(this.angleH)
    ];

    this.moveCameraToPosition(newPosition, duration);
    this.angleV = angleV;
  }

  moveCameraDirect(
    distance: number,
    angleH: number,
    angleV: number,
    duration: number
  ) {
    const newPosition: Vec3 = [
      this.center[0] + distance * Math.sin(angleV) * Math.cos(angleH),
      this.center[1] + distance * Math.cos(angleV),
      this.center[2] + distance * Math.sin(angleV) * Math.sin(angleH)
    ];

    this.moveCameraToPosition(newPosition, duration);

    this.distance = distance;
    this.angleH = angleH;
    this.angleV = angleV;
  }

  moveCamera(
    distance: number,
    angleH: number,
    angleV: number,
    duration: number,
    order?: CameraOrder
  ) {
    order = order || CameraOrder.DIRECT;

    const subDuration = duration / 3;

    switch (order) {
      case CameraOrder.DIRECT:
        this.moveCameraDirect(distance, angleH, angleV, duration);
        break;
      case CameraOrder.DVH:
        this.moveCameraByDistance(distance, subDuration);
        setTimeout(() => {
          this.moveCameraByAngleV(angleV, subDuration);
          setTimeout(() => {
            this.moveCameraByAngleH(angleH, subDuration);
          }, subDuration);
        }, subDuration);
        break;
      case CameraOrder.DHV:
        this.moveCameraByDistance(distance, subDuration);
        setTimeout(() => {
          this.moveCameraByAngleH(angleH, subDuration);
          setTimeout(() => {
            this.moveCameraByAngleV(angleV, subDuration);
          }, subDuration);
        }, subDuration);
        break;
      case CameraOrder.HDV:
        this.moveCameraByAngleH(angleH, subDuration);
        setTimeout(() => {
          this.moveCameraByDistance(distance, subDuration);
          setTimeout(() => {
            this.moveCameraByAngleV(angleV, subDuration);
          }, subDuration);
        }, subDuration);
        break;
      case CameraOrder.HVD:
        this.moveCameraByAngleH(angleH, subDuration);
        setTimeout(() => {
          this.moveCameraByAngleV(angleV, subDuration);
          setTimeout(() => {
            this.moveCameraByDistance(distance, subDuration);
          }, subDuration);
        }, subDuration);
        break;
      case CameraOrder.VDH:
        this.moveCameraByAngleV(angleV, subDuration);
        setTimeout(() => {
          this.moveCameraByDistance(distance, subDuration);
          setTimeout(() => {
            this.moveCameraByAngleH(angleH, subDuration);
          }, subDuration);
        }, subDuration);
        break;
      case CameraOrder.VHD:
        this.moveCameraByAngleV(angleV, subDuration);
        setTimeout(() => {
          this.moveCameraByAngleH(angleH, subDuration);
          setTimeout(() => {
            this.moveCameraByDistance(distance, subDuration);
          }, subDuration);
        }, subDuration);
        break;
    }
  }

  moveCameraToPosition(newPosition: Vec3, duration: number) {
    if (!this.surface) return;
    const oldPosition = this.surface.cameras.perspective.position;

    let i = 0;

    const timerId = setInterval(() => {
      if (this.surface) {
        this.surface.cameras.perspective.position = [
          oldPosition[0] + (newPosition[0] - oldPosition[0]) * i / 100,
          oldPosition[1] + (newPosition[1] - oldPosition[1]) * i / 100,
          oldPosition[2] + (newPosition[2] - oldPosition[2]) * i / 100
        ];
        this.surface.cameras.perspective.lookAt(this.center, [0, 1, 0]);
        i++;
        if (i === 100) clearInterval(timerId);
      }
    }, duration / 100);
  }

  setCamera() {
    if (!this.surface) return;
    this.surface.cameras.perspective.position = [
      this.center[0] +
        this.distance * Math.sin(this.angleV) * Math.cos(this.angleH),
      this.center[1] + this.distance * Math.cos(this.angleV),
      this.center[2] +
        this.distance * Math.sin(this.angleV) * Math.sin(this.angleH)
    ];

    this.surface.cameras.perspective.lookAt(this.center, [0, 1, 0]);
  }

  async init() {
    if (!this.surface) return;
    await this.surface.ready;

    const cube = new MeshInstance({
      color: [1, 0, 0, 1],
      source: cubeTexture
    });
    this.mesh = cube;
    this.providers.cubes.add(cube);

    let xMin = Number.MAX_SAFE_INTEGER;
    let xMax = Number.MIN_SAFE_INTEGER;
    let yMin = Number.MAX_SAFE_INTEGER;
    let yMax = Number.MIN_SAFE_INTEGER;
    let zMin = Number.MAX_SAFE_INTEGER;
    let zMax = Number.MIN_SAFE_INTEGER;

    const objModel = new objLoader.Mesh(this.obj);

    for (let i = 0, endi = objModel.vertices.length; i < endi; i += 3) {
      const x = objModel.vertices[i * 3];
      if (x > xMax) xMax = x;
      if (x < xMin) xMin = x;
      const y = objModel.vertices[i * 3 + 1];
      if (y > yMax) yMax = y;
      if (y < yMin) yMin = y;
      const z = -objModel.vertices[i * 3 + 2];
      if (z > zMax) zMax = z;
      if (z < zMin) zMin = z;
    }

    const centerX = (xMin + xMax) / 2;
    const centerY = (yMin + yMax) / 2;
    const centerZ = (zMin + zMax) / 2;

    this.mesh.transform = [-centerX, -centerY, -centerZ, 1];

    this.surface.cameras.perspective.position = [
      0 + this.distance * Math.sin(this.angleV) * Math.cos(this.angleH),
      0 + this.distance * Math.cos(this.angleV),
      0 + this.distance * Math.sin(this.angleV) * Math.sin(this.angleH)
    ];
    this.surface.cameras.perspective.lookAt([0, 0, 0], [0, 1, 0]);
    this.center = [0, 0, 0];
  }
}
