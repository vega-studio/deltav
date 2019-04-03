import {
  ChartCamera,
  createLayer,
  EventManager,
  InstanceProvider,
  LayerInitializer,
  MeshInstance,
  MeshLayer,
  MeshScaleType,
  quaternion,
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
  center: Vec3;

  constructor() {
    super();
    this.obj = require("../obj/cube/cube.obj");
    this.mtl = require("../obj/cube/cube.mtl");

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
    this.offset = [xMax * 2, yMax * 2, zMax * 2];
  }

  makeLayer(
    scene: string,
    atlas: string,
    provider: InstanceProvider<MeshInstance>
  ): LayerInitializer {
    return createLayer(MeshLayer, {
      atlas,
      data: provider,
      key: "meshes",
      scene: scene,
      scaleType: MeshScaleType.NONE,
      obj: this.obj,
      mtl: this.mtl,
      light: [this.offset[0] * 2, this.offset[1] * 2, this.offset[2] * 2]
    });
  }

  makeCamera(defaultCamera: ChartCamera): ChartCamera {
    this.camera = defaultCamera;
    this.camera.setEnable3D(true);
    this.camera.setTarget(this.target);
    this.camera.setOffset(this.offset);
    this.camera.setProjectionMatrix(
      Math.PI / 4,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );

    return this.camera;
  }

  makeController(
    defaultCamera: ChartCamera,
    _testCamera: ChartCamera,
    viewName: string
  ): EventManager {
    return new BasicCameraController3D({
      camera: defaultCamera,
      startView: viewName
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

    mesh.transform = [-this.target[0], 0, -this.target[2], 1];

    let angle = 0;
    setInterval(() => {
      angle += Math.PI / 100;
      mesh.quaternion = quaternion(0, 1, 0, angle);
    }, 20);

    return meshProvider;
  }
}
