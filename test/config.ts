import { BaseDemo } from "./common/base-demo";
import { BasicDemo } from "./demos/basic-demo";
import { BasicDemo3D } from "./demos/basic-demo-3d";
import { CameraControllerDemo3D } from "./demos/camera-controller-demo-3d";
import { CameraSceneGraphDemo } from "./demos/camera-scene-graph-demo";
import { ChartDemo } from "./demos/chart-demo";
import { CubeDemo3D } from "./demos/cube-demo-3d";
import { DeferredShadingDemo } from "./demos/deferred-shading-demo";
import { EaseDemo } from "./demos/ease-demo";
import { FrameCommandDemo } from "./demos/frame-command-demo";
import { KitchenSink } from "./demos/kitchen-sink";
import { MultiRenderTargetDemo3D } from "./demos/multi-render-target-demo";
import { NodesEdges } from "./demos/nodes-edges";
import { PhysicsDemo } from "./demos/physics-demo";
import { ProjectionDemo3D } from "./demos/projection-demo-3d";
import { QuatEaseDemo } from "./demos/quat-ease-demo";
import { SceneGraphDemo3D } from "./demos/scene-graph-demo-3d";
import { SpecializedTransformDemo } from "./demos/specialized-transform-demo";
import { StreamDemo } from "./demos/stream-demo";
import { TextAreaDemo } from "./demos/text-area-demo";
import { TextDemo } from "./demos/text-demo";
import { TexturingDemo } from "./demos/texturing-demo";
import { TouchDemo } from "./demos/touch-demo";
import { VideoDemo } from "./demos/video-demo";
import { WordSandDemo } from "./demos/word-sand";

interface IDemoCtor {
  new (): BaseDemo;
}

export const demos = new Map<string, IDemoCtor>();
export const startDemoKey = localStorage.getItem("deltaV_currentDemo") || "";

demos.set("basic-demo-3d", BasicDemo3D);
demos.set("basic-demo", BasicDemo);
demos.set("camera-controller-demo-3d", CameraControllerDemo3D);
demos.set("chart-demo", ChartDemo);
demos.set("cube-demo-3d", CubeDemo3D);
demos.set("ease-demo", EaseDemo);
demos.set("frame-command-demo", FrameCommandDemo);
demos.set("kitchen-sink", KitchenSink);
demos.set("nodes-edges", NodesEdges);
demos.set("physics-demo", PhysicsDemo);
demos.set("projection-demo-3d", ProjectionDemo3D);
demos.set("quat-ease-demo", QuatEaseDemo);
demos.set("scene-graph-demo-3d", SceneGraphDemo3D);
demos.set("stream-demo", StreamDemo);
demos.set("text-area", TextAreaDemo);
demos.set("text-demo", TextDemo);
demos.set("touch-demo", TouchDemo);
demos.set("video-demo", VideoDemo);
demos.set("word-sand", WordSandDemo);
demos.set("multiple-render-targets", MultiRenderTargetDemo3D);
demos.set("camera-scene-graph", CameraSceneGraphDemo);
demos.set("texturing", TexturingDemo);
demos.set("specialized-transform", SpecializedTransformDemo);
demos.set("deferred-shading", DeferredShadingDemo);

export const demoKeys = Array.from(demos.keys());
