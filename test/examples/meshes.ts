import {
  ChartCamera,
  createLayer,
  EventManager,
  InstanceProvider,
  LayerInitializer,
  MeshInstance,
  MeshLayer,
  MeshScaleType,
  Vec3
} from "src";
import * as objLoader from "webgl-obj-loader";
import { BasicCameraController3D } from "../../src/base-event-managers/basic-camera-controller-3D";
import { BaseExample } from "./base-example";

const imageData = require("./images/Face.png");
const texture = new Image();
texture.src = imageData;

export class Meshes extends BaseExample {
  camera: ChartCamera;
  obj: string;
  mtl: string;
  offset: Vec3;
  target: Vec3;

  constructor() {
    super();
    this.obj = require("../obj/bmw/bmw.obj");
    this.mtl = require("../obj/bmw/bmw.mtl");

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
      const z = objModel.vertices[i * 3 + 2];
      if (z > zMax) zMax = z;
      if (z < zMin) zMin = z;
    }

    const centerX = (xMin + xMax) / 2;
    const centerY = (yMin + yMax) / 2;
    const centerZ = (zMin + zMax) / 2;

    this.target = [centerX, centerY, centerZ];
    /*this.offset = [
      (xMax - centerX) * 1.5 + centerX,
      (yMax - centerY) * 1.5 + centerY,
      (zMax - centerZ) * 1.5 + centerZ
    ];*/

    this.offset = [xMax, yMax, zMax];
  }

  makeLayer(
    scene: string,
    atlas: string,
    provider: InstanceProvider<MeshInstance>
  ): LayerInitializer {
    return createLayer(MeshLayer, {
      atlas: atlas,
      data: provider,
      key: "meshes",
      scene: scene,
      scaleType: MeshScaleType.NONE,
      obj: this.obj,
      mtl: this.mtl,
      eye: this.offset,
      light: [this.offset[0] * 2, this.offset[1] * 2, this.offset[2] * 2]
      // light: this.target
      // light: [this.target[0] + 0.2, this.target[1] + 0.2, this.target[2] + 5]
    });
  }

  makeCamera(defaultCamera: ChartCamera): ChartCamera {
    //defaultCamera.setTarget(this.target);
    //defaultCamera.setOffset(this.offset);
    this.camera = defaultCamera;

    return defaultCamera;
  }

  makeController(
    defaultCamera: ChartCamera,
    _testCamera: ChartCamera
  ): EventManager {
    return new BasicCameraController3D({
      camera: defaultCamera
    });
  }

  makeProvider(): InstanceProvider<MeshInstance> {
    const meshProvider = new InstanceProvider<MeshInstance>();

    const mesh = new MeshInstance({
      color: [1, 0, 0, 1],
      depth: 0,
      element: texture
    });

    meshProvider.add(mesh);
    console.warn("provider", meshProvider);

    return meshProvider;
  }
}
