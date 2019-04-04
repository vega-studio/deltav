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
  Vec3,
  CameraType
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

  sphereProvider = new InstanceProvider<MeshInstance>();

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
  ): LayerInitializer | LayerInitializer[] {
    return [
      createLayer(MeshLayer, {
        atlas,
        data: provider,
        key: "meshes",
        scene: scene,
        scaleType: MeshScaleType.NONE,
        obj: this.obj,
        mtl: this.mtl,
        light: [this.offset[0] * 2, this.offset[1] * 2, this.offset[2] * 2]
      }),
      createLayer(MeshLayer, {
        atlas,
        data: this.sphereProvider,
        key: "meshes2",
        scene: scene,
        scaleType: MeshScaleType.NONE,
        obj: require("../obj/sphere/sphere.obj"),
        mtl: require("../obj/sphere/sphere.mtl"),
        light: [this.offset[0] * 2, this.offset[1] * 2, this.offset[2] * 2]
      })
    ];
  }

  makeCamera(defaultCamera: ChartCamera): ChartCamera {
    this.camera = defaultCamera;
    this.camera.setType(CameraType.PROJECTION);
    this.camera.setTarget(this.target);
    this.camera.setOffset(this.offset);
    this.camera.setProjectionMatrix(
      Math.PI / 4,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );

    this.camera.setOrthographicMatrix(
      -window.innerWidth / 200,
      window.innerWidth / 200,
      -window.innerHeight / 200,
      window.innerHeight / 200,
      -100,
      1000
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
    const sphereProvider = new InstanceProvider<MeshInstance>();

    const mesh = new MeshInstance({
      color: [1, 0, 0, 1],
      element: texture
    });

    meshProvider.add(mesh);

    let angle = 0;
    setInterval(() => {
      angle += Math.PI / 200;
      mesh.quaternion = quaternion(0, 1, 0, angle);
    }, 40);

    const sphere = new MeshInstance({
      color: [1, 0, 0, 1],
      element: texture
    });

    sphereProvider.add(sphere);
    this.sphereProvider = sphereProvider;

    return meshProvider;
  }
}
