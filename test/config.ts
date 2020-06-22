import { BaseDemo } from "./common/base-demo";
import { BasicDemo } from "./demos/basic-demo";
import { BasicDemo3D } from "./demos/basic-demo-3d";
import { ChartDemo } from "./demos/chart-demo";
import { CubeDemo3D } from "./demos/cube-demo-3d";
import { EaseDemo } from "./demos/ease-demo";
import { FrameCommandDemo } from "./demos/frame-command-demo";
import { KitchenSink } from "./demos/kitchen-sink";
import { NodesEdges } from "./demos/nodes-edges";
import { PhysicsDemo } from "./demos/physics-demo";
import { ProjectionDemo3D } from "./demos/projection-demo-3d";
import { QuatEaseDemo } from "./demos/quat-ease-demo";
import { StreamDemo } from "./demos/stream-demo";
import { TextAreaDemo } from "./demos/text-area-demo";
import { TextDemo } from "./demos/text-demo";
import { TouchDemo } from "./demos/touch-demo";
import { TriangleDemo } from "./demos/triangle-demo";
import { VideoDemo } from "./demos/video-demo";
import { WordSandDemo } from "./demos/word-sand";

interface IDemoCtor {
  new (): BaseDemo;
}

export const demos = new Map<string, IDemoCtor>();
export const startDemoKey = localStorage.getItem("deltaV_currentDemo") || "";

demos.set("basic-demo", BasicDemo);
demos.set("basic-demo-3d", BasicDemo3D);
demos.set("chart-demo", ChartDemo);
demos.set("cube-demo-3d", CubeDemo3D);
demos.set("text-area", TextAreaDemo);
demos.set("text-demo", TextDemo);
demos.set("nodes-edges", NodesEdges);
demos.set("word-sand", WordSandDemo);
demos.set("physics-demo", PhysicsDemo);
demos.set("kitchen-sink", KitchenSink);
demos.set("touch-demo", TouchDemo);
demos.set("video-demo", VideoDemo);
demos.set("ease-demo", EaseDemo);
demos.set("quat-ease-demo", QuatEaseDemo);
demos.set("stream-demo", StreamDemo);
demos.set("frame-command-demo", FrameCommandDemo);
demos.set("projection-demo-3d", ProjectionDemo3D);
demos.set("Triangle demo", TriangleDemo);

export const demoKeys = Array.from(demos.keys());
