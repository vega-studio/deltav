import {
  CameraType,
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
import { Light, LightType } from "../../src/util/light";
import { BaseExample } from "./base-example";

const imageData1 = require("./images/Face.png");
const imageData2 = require("./images/tex.png");
const cubeTexture = new Image();
cubeTexture.src = imageData1;
const sphereTexture = new Image();
sphereTexture.src = imageData2;

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
        light: new Light({
          position: [
            -this.offset[0] * 2,
            this.offset[1] * 2,
            -this.offset[2] * 2
          ],
          type: LightType.DIRECTION,
          ambientColor: [1.0, 0.0, 0.0, 1.0]
        }),
        hasTexture: true
      }),
      createLayer(MeshLayer, {
        atlas,
        data: this.sphereProvider,
        key: "meshes2",
        scene: scene,
        scaleType: MeshScaleType.NONE,
        obj: require("../obj/sphere/sphere.obj"),
        mtl: require("../obj/sphere/sphere.mtl"),
        light: new Light({
          position: [
            this.offset[0] * 2,
            this.offset[1] * 2,
            this.offset[2] * 2
          ],
          type: LightType.POINT,
          ambientColor: [0.0, 0.0, 1.0, 1.0]
        })
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
    const cubeProvider = new InstanceProvider<MeshInstance>();
    const sphereProvider = new InstanceProvider<MeshInstance>();

    const cube = new MeshInstance({
      color: [1, 0, 0, 1],
      element: cubeTexture
    });

    cube.transform = [2, 0, 2, 1];
    cubeProvider.add(cube);

    let angle = 0;
    setInterval(() => {
      angle += Math.PI / 200;
      cube.quaternion = quaternion(0, 1, 0, angle);
    }, 40);

    const sphere = new MeshInstance({
      color: [1, 0, 0, 1],
      element: sphereTexture
    });
    sphereProvider.add(sphere);
    setInterval(() => {
      const scale = Math.cos(angle) * 0.2 + 0.8;
      sphere.scale = [scale, scale, scale, 1];
    });
    this.sphereProvider = sphereProvider;

    return cubeProvider;
  }
}
