import {
  createLayer,
  InstanceProvider,
  LayerInitializer,
  MeshInstance,
  MeshLayer,
  MeshScaleType,
  ChartCamera,
  EventManager
} from "src";
import { BaseExample } from "./base-example";
import { BasicCameraController3D } from "src/voidgl/base-event-managers/basic-camera-controller-3D";

export class Meshes extends BaseExample {
  camera: ChartCamera;

  makeLayer(
    scene: string,
    _atlas: string,
    provider: InstanceProvider<MeshInstance>
  ): LayerInitializer {
    return createLayer(MeshLayer, {
      data: provider,
      key: "meshes",
      scene: scene,
      scaleType: MeshScaleType.NONE,
      obj: require("../obj/cube.obj")
    });
  }

  makeCamera(defaultCamera: ChartCamera): ChartCamera {
    defaultCamera.setOffset([0, 1, 1]);
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
      depth: 0
    });

    meshProvider.add(mesh);

    return meshProvider;
  }
}
